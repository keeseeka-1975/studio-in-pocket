import * as React from "react";
import {
  Badge,
  Button,
  Card,
  Divider,
  Field,
  Icon,
  Input,
  ProgressBar,
  Range,
  Select,
  Textarea,
} from "@/components/ui";
import { VideoPreview } from "@/components/VideoPreview";
import { Waveform } from "@/components/Waveform";
import { BackendView } from "@/components/BackendView";
import { PricingView } from "@/components/PricingView";

import type {
  AppData,
  Asset,
  BackendConfig,
  GenerationJob,
  GenerationSettings,
  LipSyncMode,
  Project,
  QualityPreset,
} from "@/app/types";
import { emptyData, loadAppData, saveAppData } from "@/app/storage";
import { uid } from "@/app/id";
import {
  clamp,
  formatDuration,
  formatPct,
  formatTime,
  minutesToHMS,
} from "@/app/format";
import { createJob, estimateEta, startJobSimulation } from "@/app/simulate";
import {
  renderPlayablePreviewWebm,
  supportsPlayablePreview,
} from "@/app/renderPreview";
import {
  apiCancelJob,
  apiCreateJob,
  apiWatchJob,
} from "@/app/backendApi";
import {
  DEFAULT_BACKEND_CONFIG,
  DEFAULT_PLAN_ID,
  FALLBACK_PLAYABLE_VIDEO_URL,
} from "@/app/defaults";
import { getPlan } from "@/app/pricing";

type TabId = "studio" | "jobs" | "assets" | "backend" | "pricing";

const DEFAULT_SETTINGS: GenerationSettings = {
  prompt:
    "A cinematic travel documentary through neon-lit night markets in Tokyo, ultra realistic, smooth camera motion, shallow depth of field",
  negativePrompt:
    "low-res, jitter, flicker, distortion, extra limbs, broken faces, text, watermark",
  lengthMinutes: 8,
  aspectRatio: "16:9",
  fps: 30,
  quality: "Standard",

  // UI-only: speed multiplier for the prototype pipeline.
  simSpeed: 2.5,

  seed: "",
  guidance: 7.5,
  motion: 55,
  camera: "Steadicam, slow dolly-ins, occasional aerial establishing",
  style: "Cinematic, natural skin tones, filmic contrast, subtle grain",

  // Default lip-sync ON (TTS). You can switch to Off for silent videos.
  lipSyncMode: "tts",
  ttsText: "",
  voice: "Nova",
  audioAssetId: undefined,
};

function makeDefaultProject(): Project {
  const now = Date.now();
  return {
    id: uid("proj"),
    name: "Untitled Project",
    createdAt: now,
    updatedAt: now,
    settings: { ...DEFAULT_SETTINGS },
  };
}

function getActiveProject(data: AppData): Project | undefined {
  if (!data.projects.length) return undefined;
  const found = data.activeProjectId
    ? data.projects.find((p) => p.id === data.activeProjectId)
    : undefined;
  return found ?? data.projects[0];
}

function downloadJson(filename: string, obj: unknown) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function App() {
  const [tab, setTab] = React.useState<TabId>("studio");
  const [data, setData] = React.useState<AppData>(() => {
    const loaded = typeof window !== "undefined" ? loadAppData() : emptyData();
    if (loaded.projects.length) return loaded;
    const proj = makeDefaultProject();
    return { ...loaded, projects: [proj], activeProjectId: proj.id };
  });

  const project = React.useMemo(() => getActiveProject(data), [data]);

  const planId = data.planId ?? DEFAULT_PLAN_ID;
  const plan = React.useMemo(() => getPlan(planId), [planId]);

  const backend: BackendConfig = data.backend ?? DEFAULT_BACKEND_CONFIG;

  const [activeJobId, setActiveJobId] = React.useState<string | undefined>(() =>
    data.jobs[0]?.id
  );
  const activeJob = React.useMemo(
    () => (activeJobId ? data.jobs.find((j) => j.id === activeJobId) : undefined),
    [activeJobId, data.jobs]
  );

  // Local simulation (only one active simulator at a time).
  const simRef = React.useRef<ReturnType<typeof startJobSimulation> | null>(
    null
  );
  const simJobIdRef = React.useRef<string | null>(null);

  // API watcher (only watches the active API job).
  const watchRef = React.useRef<ReturnType<typeof apiWatchJob> | null>(null);

  const [previewUrlByJob, setPreviewUrlByJob] = React.useState<
    Record<string, string>
  >({});
  const [previewBusyJobId, setPreviewBusyJobId] = React.useState<string | null>(
    null
  );
  const [previewErrorByJob, setPreviewErrorByJob] = React.useState<
    Record<string, string>
  >({});

  const [backendMsg, setBackendMsg] = React.useState<
    { tone: "info" | "warn" | "error"; msg: string } | null
  >(null);

  const canRenderPlayablePreview = React.useMemo(
    () => supportsPlayablePreview(),
    []
  );

  React.useEffect(() => {
    saveAppData(data);
  }, [data]);

  // Cleanup on unmount.
  React.useEffect(() => {
    return () => {
      simRef.current?.stop?.();
      simRef.current = null;
      simJobIdRef.current = null;

      watchRef.current?.stop?.();
      watchRef.current = null;

      setPreviewUrlByJob((m) => {
        Object.values(m).forEach((u) => URL.revokeObjectURL(u));
        return {};
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateProject = React.useCallback(
    (patch: Partial<Project>) => {
      if (!project) return;
      setData((d) => {
        const projects = d.projects.map((p) =>
          p.id === project.id ? { ...p, ...patch, updatedAt: Date.now() } : p
        );
        return { ...d, projects };
      });
    },
    [project]
  );

  const updateSettings = React.useCallback(
    (patch: Partial<GenerationSettings>) => {
      if (!project) return;
      const maxLen = plan.limits.maxMinutesPerVideo;
      const next: Partial<GenerationSettings> = { ...patch };
      if (typeof next.lengthMinutes === "number") {
        next.lengthMinutes = clamp(next.lengthMinutes, 0.5, maxLen);
      }
      // If the plan doesn't allow lip-sync, force it off.
      if (!plan.limits.lipSync) {
        next.lipSyncMode = "off";
      }
      updateProject({ settings: { ...project.settings, ...next } });
    },
    [plan.limits.lipSync, plan.limits.maxMinutesPerVideo, project, updateProject]
  );

  const createNewProject = React.useCallback(() => {
    const proj = makeDefaultProject();
    setData((d) => ({
      ...d,
      projects: [proj, ...d.projects],
      activeProjectId: proj.id,
    }));
    setTab("studio");
  }, []);

  const deleteProject = React.useCallback(() => {
    if (!project) return;
    setData((d) => {
      const projects = d.projects.filter((p) => p.id !== project.id);
      const nextActive = projects[0]?.id;
      const jobs = d.jobs.filter((j) => j.projectId !== project.id);
      return { ...d, projects, activeProjectId: nextActive, jobs };
    });
  }, [project]);

  const createAudioAsset = React.useCallback((file: File): Asset => {
    const asset: Asset = {
      id: uid("asset"),
      type: "audio",
      name: file.name,
      createdAt: Date.now(),
      size: file.size,
      mime: file.type,
    };
    setData((d) => ({ ...d, assets: [asset, ...d.assets] }));
    return asset;
  }, []);

  const startGeneration = React.useCallback(async () => {
    if (!project) return;

    setBackendMsg(null);

    const settings: GenerationSettings = {
      ...project.settings,
      lengthMinutes: clamp(
        project.settings.lengthMinutes,
        0.5,
        plan.limits.maxMinutesPerVideo
      ),
      lipSyncMode: plan.limits.lipSync ? project.settings.lipSyncMode : "off",
    };

    if (backend.mode === "local") {
      const job = createJob(project.id, settings);
      setData((d) => ({ ...d, jobs: [job, ...d.jobs] }));
      setActiveJobId(job.id);
      setTab("jobs");

      // stop previous simulator without canceling it
      simRef.current?.stop?.();
      simRef.current = startJobSimulation(job, ({ job: next }) => {
        setData((d) => ({
          ...d,
          jobs: d.jobs.map((j) => (j.id === next.id ? next : j)),
        }));
      });
      simJobIdRef.current = job.id;
      return;
    }

    // API mode
    try {
      setBackendMsg({
        tone: "info",
        msg: "Creating job on backend…",
      });

      const created = await apiCreateJob(backend, {
        projectId: project.id,
        settings,
      });

      const job: GenerationJob = {
        ...created,
        backendMode: "api",
      };

      setData((d) => ({ ...d, jobs: [job, ...d.jobs] }));
      setActiveJobId(job.id);
      setTab("jobs");

      setBackendMsg({ tone: "info", msg: "Job created. Streaming updates…" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create backend job.";
      setBackendMsg({
        tone: "warn",
        msg: `${msg} Falling back to Local simulator…`,
      });

      // Automatic fallback so the app still works when the backend isn’t running/reachable.
      const job = createJob(project.id, settings);
      setData((d) => ({ ...d, jobs: [job, ...d.jobs] }));
      setActiveJobId(job.id);
      setTab("jobs");

      simRef.current?.stop?.();
      simRef.current = startJobSimulation(job, ({ job: next }) => {
        setData((d) => ({
          ...d,
          jobs: d.jobs.map((j) => (j.id === next.id ? next : j)),
        }));
      });
      simJobIdRef.current = job.id;
    }
  }, [backend, plan.limits.lipSync, plan.limits.maxMinutesPerVideo, project]);

  // Watch active API jobs.
  React.useEffect(() => {
    // reset watcher
    watchRef.current?.stop?.();
    watchRef.current = null;

    if (!activeJob) return;
    if (activeJob.backendMode !== "api") return;
    if (backend.mode !== "api") {
      setBackendMsg({
        tone: "warn",
        msg: "This job is an API job, but your backend mode is set to Local. Switch to API mode to watch it.",
      });
      return;
    }
    if (!backend.baseUrl.trim()) {
      setBackendMsg({
        tone: "warn",
        msg: "Backend Base URL is empty. Configure it in the Backend tab.",
      });
      return;
    }

    watchRef.current = apiWatchJob(
      backend,
      activeJob.id,
      (next) => {
        const withMode: GenerationJob = { ...next, backendMode: "api" };

        // If the backend completes without providing a videoUrl, derive a sensible default.
        const derivedVideoUrl =
          withMode.status === "complete" && !withMode.result?.videoUrl
            ? deriveBackendVideoUrl(withMode.id)
            : "";

        const patched: GenerationJob =
          derivedVideoUrl && withMode.status === "complete"
            ? {
                ...withMode,
                result: {
                  title: withMode.result?.title ?? "VeoForge Export",
                  exportNote:
                    withMode.result?.exportNote ??
                    "Backend job completed. The UI derived a playable /video URL because the backend did not provide one.",
                  videoUrl: derivedVideoUrl,
                },
              }
            : withMode;

        setData((d) => ({
          ...d,
          jobs: d.jobs.map((j) => (j.id === patched.id ? patched : j)),
        }));
      },
      (err) => {
        const msg = err instanceof Error ? err.message : "Backend watch error.";
        setBackendMsg({ tone: "warn", msg });
      }
    );

    return () => {
      watchRef.current?.stop?.();
      watchRef.current = null;
    };
  }, [
    activeJob?.id,
    activeJob?.backendMode,
    backend.apiKey,
    backend.baseUrl,
    backend.mode,
    backend.pollIntervalMs,
    backend.useSse,
  ]);

  const cancelActiveJob = React.useCallback(async () => {
    if (!activeJob) return;

    if (activeJob.backendMode === "api") {
      if (backend.mode !== "api" || !backend.baseUrl.trim()) {
        setBackendMsg({
          tone: "error",
          msg: "Cannot cancel: backend is not configured for API mode.",
        });
        return;
      }
      try {
        setBackendMsg({ tone: "info", msg: "Canceling job on backend…" });
        const next = await apiCancelJob(backend, activeJob.id);
        setData((d) => ({
          ...d,
          jobs: d.jobs.map((j) =>
            j.id === next.id ? { ...next, backendMode: "api" } : j
          ),
        }));
        setBackendMsg({ tone: "info", msg: "Canceled." });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Cancel failed.";
        setBackendMsg({ tone: "error", msg });
      }
      return;
    }

    // Local job
    if (simJobIdRef.current !== activeJob.id) {
      setBackendMsg({
        tone: "warn",
        msg: "This local job is not attached to the active simulator session (it may be from a previous reload).",
      });
      return;
    }

    simRef.current?.cancel?.();
    simRef.current = null;
    simJobIdRef.current = null;
  }, [activeJob, backend]);

  const generatePlayablePreview = React.useCallback(
    async (opts?: { withAudio?: boolean }) => {
      if (!activeJob) return;
      if (activeJob.status !== "complete") return;
      if (!canRenderPlayablePreview) {
        setPreviewErrorByJob((m) => ({
          ...m,
          [activeJob.id]:
            "Playable preview is not supported in this browser (requires MediaRecorder + canvas.captureStream).",
        }));
        return;
      }

      // Clear any previous error
      setPreviewErrorByJob((m) => {
        const next = { ...m };
        delete next[activeJob.id];
        return next;
      });

      // Revoke previous URL for this job
      setPreviewUrlByJob((m) => {
        const prev = m[activeJob.id];
        if (prev) URL.revokeObjectURL(prev);
        const next = { ...m };
        delete next[activeJob.id];
        return next;
      });

      setPreviewBusyJobId(activeJob.id);
      try {
        // NOTE: We currently don't persist binary audio files. Upload mode will fall back to synthetic audio.
        const blob = await renderPlayablePreviewWebm({
          settings: activeJob.settings,
          scenes: activeJob.scenes,
          durationSec: 12,
          fps: activeJob.settings.fps,
          includeAudio: opts?.withAudio ?? false,
        });
        const url = URL.createObjectURL(blob);
        setPreviewUrlByJob((m) => ({ ...m, [activeJob.id]: url }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Preview render failed.";
        setPreviewErrorByJob((m) => ({ ...m, [activeJob.id]: msg }));
      } finally {
        setPreviewBusyJobId(null);
      }
    },
    [activeJob, canRenderPlayablePreview]
  );

  // Auto-render a playable preview once per completed job (silent mode for reliability),
  // but only if we don't already have a real backend videoUrl.
  React.useEffect(() => {
    if (!activeJob) return;
    if (activeJob.status !== "complete") return;
    if (activeJob.result?.videoUrl) return;
    if (previewUrlByJob[activeJob.id]) return;
    if (previewBusyJobId === activeJob.id) return;
    void generatePlayablePreview({ withAudio: false });
  }, [
    activeJob,
    generatePlayablePreview,
    previewBusyJobId,
    previewUrlByJob,
  ]);

  const clearCompletedJobs = React.useCallback(() => {
    setData((d) => ({
      ...d,
      jobs: d.jobs.filter(
        (j) => j.status === "running" || j.status === "queued"
      ),
    }));
  }, []);

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-indigo-50 p-6">
        <div className="mx-auto max-w-xl">
          <Card title="VeoForge" subtitle="Long-form video studio">
            <div className="space-y-3">
              <div className="text-sm text-zinc-700">
                No project found. Create one to get started.
              </div>
              <Button variant="primary" onClick={createNewProject}>
                <Icon name="spark" /> New project
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const settings = project.settings;
  const eta = estimateEta(settings);

  const activePreviewUrl = activeJob ? previewUrlByJob[activeJob.id] : undefined;
  const activePreviewError = activeJob
    ? previewErrorByJob[activeJob.id]
    : undefined;

  const maxLen = plan.limits.maxMinutesPerVideo;
  const lengthMaxLabel = `${maxLen}m max on ${plan.name}`;

  const deriveBackendVideoUrl = (jobId: string) => {
    const base = (backend.baseUrl || "").trim().replace(/\/+$/, "");
    if (!base) return "";
    return `${base}/v1/jobs/${encodeURIComponent(jobId)}/video`;
  };

  const playableUrl =
    activeJob?.status === "complete"
      ? activeJob?.result?.videoUrl ||
        activePreviewUrl ||
        FALLBACK_PLAYABLE_VIDEO_URL
      : undefined;

  const playableLabel = activeJob?.result?.videoUrl
    ? "Backend render"
    : activePreviewUrl
      ? "In-browser preview"
      : "Fallback clip";

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(167,139,250,0.16),transparent_50%),linear-gradient(to_br,rgba(250,250,250,1),rgba(255,255,255,1))]">
      <div className="mx-auto max-w-[1200px] p-4 sm:p-6">
        <Header
          tab={tab}
          setTab={setTab}
          project={project}
          projects={data.projects}
          planName={plan.name}
          backendMode={backend.mode}
          onSelectProject={(id) =>
            setData((d) => ({ ...d, activeProjectId: id }))
          }
          onNewProject={createNewProject}
          onRename={(name) => updateProject({ name })}
        />

        {backendMsg && (
          <div
            className={
              "mt-4 rounded-2xl border p-3 text-xs " +
              (backendMsg.tone === "error"
                ? "border-rose-200 bg-rose-50 text-rose-900"
                : backendMsg.tone === "warn"
                  ? "border-amber-200 bg-amber-50 text-amber-900"
                  : "border-zinc-200 bg-white text-zinc-800")
            }
          >
            {backendMsg.msg}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Left */}
          <div className="lg:col-span-5 space-y-4">
            {tab === "studio" && (
              <>
                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white">
                        <Icon name="spark" className="h-4 w-4" />
                      </span>
                      Prompt & plan
                    </div>
                  }
                  subtitle="Write a long-form prompt, then tune motion + camera + style."
                  right={
                    <div className="flex items-center gap-2">
                      <Badge tone="indigo">Up to {maxLen} minutes</Badge>
                    </div>
                  }
                >
                  <div className="space-y-3">
                    <Field
                      label="Prompt"
                      hint="Natural language. The app will auto-split into scenes."
                    >
                      <Textarea
                        value={settings.prompt}
                        onChange={(e) =>
                          updateSettings({ prompt: e.target.value })
                        }
                        placeholder="Describe the story, visuals, pacing, and mood…"
                      />
                    </Field>

                    <Field
                      label="Negative prompt"
                      hint="Avoid artifacts / undesirable content."
                    >
                      <Textarea
                        value={settings.negativePrompt}
                        onChange={(e) =>
                          updateSettings({ negativePrompt: e.target.value })
                        }
                        placeholder="e.g. flicker, jitter, low-res, watermark"
                      />
                    </Field>

                    <Divider label="Core" />

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field
                        label="Length"
                        hint={`${minutesToHMS(settings.lengthMinutes)} • ${lengthMaxLabel}`}
                      >
                        <div className="space-y-2">
                          <Range
                            value={settings.lengthMinutes}
                            min={0.5}
                            max={maxLen}
                            step={0.5}
                            onChange={(v) =>
                              updateSettings({ lengthMinutes: v })
                            }
                          />
                          <div className="flex items-center justify-between text-xs text-zinc-500">
                            <span>0.5m</span>
                            <span className="font-semibold text-zinc-800">
                              {settings.lengthMinutes.toFixed(1)}m
                            </span>
                            <span>{maxLen}m</span>
                          </div>
                        </div>
                      </Field>

                      <Field label="Aspect ratio">
                        <Select
                          value={settings.aspectRatio}
                          onChange={(e) =>
                            updateSettings({
                              aspectRatio:
                                e.target
                                  .value as GenerationSettings["aspectRatio"],
                            })
                          }
                        >
                          <option value="16:9">16:9 (Landscape)</option>
                          <option value="9:16">9:16 (Vertical)</option>
                          <option value="1:1">1:1 (Square)</option>
                          <option value="21:9">21:9 (Ultra-wide)</option>
                        </Select>
                      </Field>

                      <Field label="FPS">
                        <Select
                          value={settings.fps}
                          onChange={(e) =>
                            updateSettings({
                              fps: Number(e.target.value) as 24 | 30 | 60,
                            })
                          }
                        >
                          <option value={24}>24</option>
                          <option value={30}>30</option>
                          <option value={60}>60</option>
                        </Select>
                      </Field>

                      <Field label="Quality">
                        <Select
                          value={settings.quality}
                          onChange={(e) =>
                            updateSettings({
                              quality: e.target.value as QualityPreset,
                            })
                          }
                        >
                          <option value="Draft">Draft</option>
                          <option value="Standard">Standard</option>
                          <option value="Cinematic">Cinematic</option>
                        </Select>
                      </Field>
                    </div>

                    <Divider label="Motion" />

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field
                        label="Guidance"
                        hint={`${settings.guidance.toFixed(1)} / 20`}
                      >
                        <Range
                          value={settings.guidance}
                          min={1}
                          max={20}
                          step={0.5}
                          onChange={(v) => updateSettings({ guidance: v })}
                        />
                      </Field>
                      <Field
                        label="Motion"
                        hint={`${Math.round(settings.motion)} / 100`}
                      >
                        <Range
                          value={settings.motion}
                          min={0}
                          max={100}
                          step={1}
                          onChange={(v) => updateSettings({ motion: v })}
                        />
                      </Field>
                    </div>

                    <Divider label="Simulation" />

                    <Field
                      label="Generation speed"
                      hint={`${settings.simSpeed.toFixed(1)}×`}
                    >
                      <div className="space-y-2">
                        <Range
                          value={settings.simSpeed}
                          min={0.5}
                          max={6}
                          step={0.1}
                          onChange={(v) => updateSettings({ simSpeed: v })}
                        />
                        <div className="text-[11px] text-zinc-500">
                          Speeds up the <span className="font-semibold text-zinc-700">prototype</span> pipeline only (not a real model runtime).
                        </div>
                      </div>
                    </Field>

                    <Field
                      label="Camera"
                      hint="Describes shot language; used by the planner."
                    >
                      <Input
                        value={settings.camera}
                        onChange={(e) =>
                          updateSettings({ camera: e.target.value })
                        }
                      />
                    </Field>
                    <Field
                      label="Style"
                      hint="Aesthetic + grade + lighting constraints."
                    >
                      <Input
                        value={settings.style}
                        onChange={(e) =>
                          updateSettings({ style: e.target.value })
                        }
                      />
                    </Field>

                    <Divider label="Lip-sync" />

                    {!plan.limits.lipSync ? (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                        <div className="font-semibold">Lip-sync is locked on your plan</div>
                        <div className="mt-1">
                          Switch to Creator/Pro to enable lip-sync (TTS or uploaded VO).
                        </div>
                      </div>
                    ) : (
                      <LipSyncPanel
                        mode={settings.lipSyncMode}
                        onMode={(m) => updateSettings({ lipSyncMode: m })}
                        ttsText={settings.ttsText}
                        onTtsText={(t) => updateSettings({ ttsText: t })}
                        voice={settings.voice}
                        onVoice={(v) => updateSettings({ voice: v })}
                        audioAsset={
                          settings.audioAssetId
                            ? data.assets.find(
                                (a) => a.id === settings.audioAssetId
                              )
                            : undefined
                        }
                        onUpload={(file) => {
                          const asset = createAudioAsset(file);
                          updateSettings({
                            audioAssetId: asset.id,
                            lipSyncMode: "upload",
                          });
                        }}
                        onClearAudio={() =>
                          updateSettings({ audioAssetId: undefined })
                        }
                      />
                    )}

                    <Divider />

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-xs text-zinc-500">
                        <span className="inline-flex items-center gap-1">
                          <Icon name="clock" />
                          Est. pipeline time:{" "}
                          <span className="font-semibold text-zinc-800">
                            {formatDuration(eta)}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            updateSettings({
                              seed: Math.random().toString(16).slice(2, 10),
                            });
                          }}
                        >
                          <Icon name="grid" /> Random seed
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => void startGeneration()}
                        >
                          <Icon name="video" /> Generate video
                        </Button>
                      </div>
                    </div>

                    {settings.seed && (
                      <div className="text-[11px] text-zinc-500">
                        Seed:{" "}
                        <span className="font-mono text-zinc-800">
                          {settings.seed}
                        </span>
                      </div>
                    )}

                    <div className="rounded-2xl border border-zinc-200 bg-white p-3 text-xs text-zinc-700">
                      <div className="font-semibold">Execution</div>
                      <div className="mt-1">
                        Current backend: <span className="font-semibold">{backend.mode === "local" ? "Local simulator" : "API backend"}</span>. Configure it in the Backend tab.
                      </div>
                    </div>
                  </div>
                </Card>

                <Card
                  title="Project safety & realism"
                  subtitle="This is a front-end prototype. It’s designed like a Veo-style studio, but it doesn’t generate real video unless you connect a backend."
                >
                  <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
                    <li>
                      Local mode: pipeline stages are simulated for UX.
                    </li>
                    <li>
                      API mode: create/watch/cancel jobs via REST and optional SSE.
                    </li>
                  </ul>
                </Card>
              </>
            )}

            {tab === "assets" && (
              <AssetsView
                assets={data.assets}
                onUploadAudio={(file) => createAudioAsset(file)}
              />
            )}

            {tab === "jobs" && (
              <JobsList
                jobs={data.jobs}
                activeJobId={activeJobId}
                onSelect={setActiveJobId}
                onClearCompleted={clearCompletedJobs}
              />
            )}

            {tab === "backend" && (
              <BackendView
                backend={backend}
                onChange={(next) =>
                  setData((d) => ({ ...d, backend: next }))
                }
              />
            )}

            {tab === "pricing" && (
              <PricingView
                planId={planId}
                onChoose={(id) => setData((d) => ({ ...d, planId: id }))}
              />
            )}
          </div>

          {/* Right */}
          <div className="lg:col-span-7 space-y-4">
            <Card
              title={
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-white">
                    <Icon name="video" className="h-4 w-4" />
                  </span>
                  Output preview
                </div>
              }
              subtitle="Playable output (backend videoUrl or in-browser preview) + scene plan"
              right={
                <div className="flex items-center gap-2">
                  {activeJob?.status === "running" && (
                    <Badge tone="amber">Generating</Badge>
                  )}
                  {activeJob?.status === "queued" && (
                    <Badge tone="zinc">Queued</Badge>
                  )}
                  {activeJob?.status === "complete" && (
                    <Badge tone="emerald">Complete</Badge>
                  )}
                  {!activeJob && <Badge tone="zinc">No active job</Badge>}
                </div>
              }
            >
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="space-y-3">
                  {activeJob?.status === "complete" && playableUrl ? (
                    <div className="space-y-2">
                      {activePreviewError && !activeJob.result?.videoUrl && (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                          <div className="font-semibold">Preview render failed</div>
                          <div className="mt-1">{activePreviewError}</div>
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-zinc-900">
                            {playableLabel}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {activeJob.result?.videoUrl
                              ? "Served by your backend"
                              : "WebM rendered in-browser (mock output)"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!activeJob.result?.videoUrl && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                void generatePlayablePreview({ withAudio: false })
                              }
                              disabled={
                                previewBusyJobId === activeJob.id ||
                                !canRenderPlayablePreview
                              }
                            >
                              {previewBusyJobId === activeJob.id
                                ? "Rendering…"
                                : "Re-render"}
                            </Button>
                          )}
                          {activeJob.result?.videoUrl && (
                            <a
                              className="text-xs font-semibold text-indigo-700 hover:text-indigo-600"
                              href={activeJob.result.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-black shadow-sm">
                        <video
                          className="block h-auto w-full"
                          src={playableUrl}
                          controls
                          playsInline
                          preload="metadata"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <VideoPreview
                        title={
                          activeJob ? `Job ${activeJob.id.slice(-6)}` : "Preview"
                        }
                        subtitle={
                          activeJob
                            ? `${formatPct(activeJob.progress)} • ETA ${formatDuration(activeJob.etaSec)}`
                            : "Ready"
                        }
                        progress={activeJob?.progress ?? 0}
                        aspect={settings.aspectRatio}
                      />

                      {activeJob?.status === "complete" && (
                        <div className="space-y-2">
                          {!canRenderPlayablePreview && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                              <div className="font-semibold">
                                Playable preview not supported
                              </div>
                              <div className="mt-1">
                                This browser can’t record a canvas to video (needs{" "}
                                <span className="font-semibold">MediaRecorder</span> +{" "}
                                <span className="font-semibold">
                                  canvas.captureStream
                                </span>
                                ).
                              </div>
                            </div>
                          )}

                          {activePreviewError && (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                              <div className="font-semibold">
                                Preview render failed
                              </div>
                              <div className="mt-1">{activePreviewError}</div>
                            </div>
                          )}

                          <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="text-sm font-semibold text-zinc-900">
                                Render a playable preview
                              </div>
                              <div className="text-xs text-zinc-500">
                                Creates a short video file in-browser. If "With audio" fails, try "Silent".
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                  void generatePlayablePreview({ withAudio: false })
                                }
                                disabled={
                                  previewBusyJobId === activeJob.id ||
                                  !canRenderPlayablePreview
                                }
                              >
                                {previewBusyJobId === activeJob.id
                                  ? "Rendering…"
                                  : "Silent"}
                              </Button>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() =>
                                  void generatePlayablePreview({ withAudio: true })
                                }
                                disabled={
                                  previewBusyJobId === activeJob.id ||
                                  !canRenderPlayablePreview
                                }
                              >
                                {previewBusyJobId === activeJob.id
                                  ? "Rendering…"
                                  : "With audio"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Card title="Scenes" subtitle="Auto planned" className="p-3">
                      <div className="text-2xl font-semibold text-zinc-900">
                        {activeJob?.scenes.length ??
                          clamp(
                            Math.round(settings.lengthMinutes / 3),
                            4,
                            12
                          )}
                      </div>
                      <div className="text-xs text-zinc-500">Estimated beats</div>
                    </Card>
                    <Card
                      title="Backend"
                      subtitle="Execution"
                      className="p-3"
                    >
                      <div className="text-2xl font-semibold text-zinc-900">
                        {activeJob?.backendMode ?? backend.mode}
                      </div>
                      <div className="text-xs text-zinc-500">Mode</div>
                    </Card>
                  </div>

                  {settings.lipSyncMode !== "off" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-zinc-800">
                          Audio preview
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          Deterministic mock waveform
                        </div>
                      </div>
                      <Waveform
                        seed={
                          settings.lipSyncMode === "tts"
                            ? settings.ttsText || "tts"
                            : settings.audioAssetId || "upload"
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <PipelinePanel
                    job={activeJob}
                    onCancel={() => void cancelActiveJob()}
                    onExport={(j) => exportJob(j, project)}
                  />
                  <ScenesPanel job={activeJob} fallbackSettings={settings} />
                </div>
              </div>
            </Card>

            <Card
              title="Project management"
              subtitle={`Created ${formatTime(project.createdAt)} • Updated ${formatTime(project.updatedAt)}`}
              right={
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() =>
                      downloadJson(
                        `${project.name || "project"}.json`,
                        project
                      )
                    }
                  >
                    Export project JSON
                  </Button>
                  <Button variant="danger" onClick={deleteProject}>
                    <Icon name="x" /> Delete
                  </Button>
                </div>
              }
            >
              <div className="text-sm text-zinc-700">
                This app is designed to feel like a modern “Veo-style” studio: long prompts, scene planning, and a pipeline view with lip-sync.
              </div>
            </Card>
          </div>
        </div>

        <footer className="mt-8 pb-8 text-center text-xs text-zinc-500">
          VeoForge — UI studio + backend wiring (REST/SSE). Local mode is simulated; connect a real backend to generate real video.
        </footer>
      </div>
    </div>
  );
}

function Header({
  tab,
  setTab,
  project,
  projects,
  planName,
  backendMode,
  onSelectProject,
  onNewProject,
  onRename,
}: {
  tab: TabId;
  setTab: (t: TabId) => void;
  project: Project;
  projects: Project[];
  planName: string;
  backendMode: BackendConfig["mode"];
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onRename: (name: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-200/70">
          <Icon name="spark" className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-zinc-900">
              VeoForge Studio
            </div>
            <Badge tone="zinc">{planName}</Badge>
            <Badge tone={backendMode === "api" ? "indigo" : "zinc"}>
              {backendMode === "api" ? "API" : "Local"}
            </Badge>
          </div>
          <div className="text-xs text-zinc-500">
            Long-form generation • Lip-sync • Scene planning
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="text-[11px] font-semibold text-zinc-500">
            Project
          </div>
          <select
            className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm"
            value={project.id}
            onChange={(e) => onSelectProject(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <Button size="sm" variant="secondary" onClick={onNewProject}>
            <Icon name="spark" /> New
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex flex-wrap gap-1 rounded-xl border border-zinc-200 bg-white p-1">
            <TabButton active={tab === "studio"} onClick={() => setTab("studio")}>
              <Icon name="gear" /> Studio
            </TabButton>
            <TabButton active={tab === "jobs"} onClick={() => setTab("jobs")}>
              <Icon name="video" /> Jobs
            </TabButton>
            <TabButton active={tab === "assets"} onClick={() => setTab("assets")}>
              <Icon name="wave" /> Assets
            </TabButton>
            <TabButton active={tab === "backend"} onClick={() => setTab("backend")}>
              <Icon name="grid" /> Backend
            </TabButton>
            <TabButton active={tab === "pricing"} onClick={() => setTab("pricing")}>
              <Icon name="spark" /> Pricing
            </TabButton>
          </div>
        </div>

        <div className="sm:w-56">
          <Input
            value={project.name}
            onChange={(e) => onRename(e.target.value)}
            placeholder="Project name"
          />
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "inline-flex h-8 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors " +
        (active
          ? "bg-zinc-900 text-white"
          : "text-zinc-700 hover:bg-zinc-100")
      }
      type="button"
    >
      {children}
    </button>
  );
}

function LipSyncPanel({
  mode,
  onMode,
  ttsText,
  onTtsText,
  voice,
  onVoice,
  audioAsset,
  onUpload,
  onClearAudio,
}: {
  mode: LipSyncMode;
  onMode: (m: LipSyncMode) => void;
  ttsText: string;
  onTtsText: (t: string) => void;
  voice: string;
  onVoice: (v: string) => void;
  audioAsset?: Asset;
  onUpload: (file: File) => void;
  onClearAudio: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <ModeButton
          active={mode === "off"}
          label="Off"
          sub="No dialog"
          onClick={() => onMode("off")}
        />
        <ModeButton
          active={mode === "tts"}
          label="TTS"
          sub="Type dialogue"
          onClick={() => onMode("tts")}
        />
        <ModeButton
          active={mode === "upload"}
          label="Upload"
          sub="Use audio"
          onClick={() => onMode("upload")}
        />
      </div>

      {mode === "tts" && (
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Voice">
              <Select value={voice} onChange={(e) => onVoice(e.target.value)}>
                <option value="Nova">Nova</option>
                <option value="Orion">Orion</option>
                <option value="Juniper">Juniper</option>
                <option value="Atlas">Atlas</option>
              </Select>
            </Field>
            <Field label="Pacing" hint="Prototype">
              <Select defaultValue="natural">
                <option value="natural">Natural</option>
                <option value="fast">Fast</option>
                <option value="slow">Slow</option>
              </Select>
            </Field>
          </div>
          <Field label="Dialogue" hint="Used for viseme alignment.">
            <Textarea
              value={ttsText}
              onChange={(e) => onTtsText(e.target.value)}
              placeholder="Type the lines to be spoken…"
            />
          </Field>
        </div>
      )}

      {mode === "upload" && (
        <div className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-zinc-500">
              Upload a WAV/MP3 to drive lip sync. (UI prototype — file is not processed.)
            </div>
            <label className="inline-flex">
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUpload(f);
                  e.currentTarget.value = "";
                }}
              />
              <span>
                <Button variant="secondary" size="sm">
                  <Icon name="wave" /> Upload audio
                </Button>
              </span>
            </label>
          </div>

          {audioAsset ? (
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3">
              <div>
                <div className="text-sm font-semibold text-zinc-900">
                  {audioAsset.name}
                </div>
                <div className="text-xs text-zinc-500">
                  {audioAsset.mime || "audio"}
                  {typeof audioAsset.size === "number"
                    ? ` • ${(audioAsset.size / 1024 / 1024).toFixed(2)} MB`
                    : ""}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClearAudio}>
                Remove
              </Button>
            </div>
          ) : (
            <div className="text-xs text-zinc-500">No audio attached yet.</div>
          )}
        </div>
      )}

      {mode === "off" && (
        <div className="text-xs text-zinc-500">
          Lip-sync is currently disabled. Use{" "}
          <span className="font-semibold text-zinc-700">TTS</span> or{" "}
          <span className="font-semibold text-zinc-700">Upload</span> if your video has dialogue/singing.
        </div>
      )}
    </div>
  );
}

function ModeButton({
  active,
  label,
  sub,
  onClick,
}: {
  active: boolean;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      className={
        "rounded-2xl border p-3 text-left transition-colors " +
        (active
          ? "border-indigo-300 bg-indigo-50"
          : "border-zinc-200 bg-white hover:bg-zinc-50")
      }
      onClick={onClick}
      type="button"
    >
      <div className="text-sm font-semibold text-zinc-900">{label}</div>
      <div className="text-xs text-zinc-500">{sub}</div>
    </button>
  );
}

function PipelinePanel({
  job,
  onCancel,
  onExport,
}: {
  job?: GenerationJob;
  onCancel: () => void;
  onExport: (job: GenerationJob) => void;
}) {
  if (!job) {
    return (
      <Card title="Pipeline" subtitle="Start a job to see stages">
        <div className="text-sm text-zinc-700">
          Generate a video to populate the pipeline. Stages will update smoothly as if a real worker is running.
        </div>
      </Card>
    );
  }

  const statusTone =
    job.status === "complete"
      ? "emerald"
      : job.status === "failed"
        ? "rose"
        : job.status === "canceled"
          ? "amber"
          : "indigo";

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          Pipeline
          <Badge tone={statusTone as any}>{job.status}</Badge>
        </div>
      }
      subtitle={`Created ${formatTime(job.createdAt)} • Updated ${formatTime(job.updatedAt)}`}
      right={
        <div className="flex items-center gap-2">
          {(job.status === "running" || job.status === "queued") && (
            <Button size="sm" variant="danger" onClick={onCancel}>
              Cancel
            </Button>
          )}
          {job.status === "complete" && (
            <Button size="sm" variant="primary" onClick={() => onExport(job)}>
              Export manifest
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-600">
            <div className="font-semibold">Overall</div>
            <div>
              {formatPct(job.progress)} • ETA{" "}
              <span className="font-semibold text-zinc-900">
                {formatDuration(job.etaSec)}
              </span>
            </div>
          </div>
          <ProgressBar value={job.progress} />
        </div>

        <div className="space-y-2">
          {job.stages.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-zinc-200 bg-white p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={
                      "inline-flex h-6 w-6 items-center justify-center rounded-lg " +
                      (s.status === "done"
                        ? "bg-emerald-100 text-emerald-700"
                        : s.status === "running"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-zinc-100 text-zinc-600")
                    }
                  >
                    {s.status === "done" ? (
                      <Icon name="check" />
                    ) : s.status === "running" ? (
                      <Icon name="spark" />
                    ) : (
                      <Icon name="grid" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">
                      {s.label}
                    </div>
                    <div className="text-[11px] text-zinc-500">{s.status}</div>
                  </div>
                </div>
                <div className="text-xs font-semibold text-zinc-700">
                  {formatPct(s.progress)}
                </div>
              </div>
              <div className="mt-2">
                <ProgressBar value={s.progress} />
              </div>
            </div>
          ))}
        </div>

        <Divider label="Logs" />
        <div className="max-h-48 overflow-auto rounded-2xl border border-zinc-200 bg-black p-3">
          <div className="space-y-2 font-mono text-[11px] text-zinc-200">
            {job.logs.slice(-30).map((l, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-zinc-500">
                  {new Date(l.t).toLocaleTimeString()}
                </span>
                <span
                  className={
                    l.level === "error"
                      ? "text-rose-300"
                      : l.level === "warn"
                        ? "text-amber-300"
                        : "text-indigo-200"
                  }
                >
                  [{l.level}]
                </span>
                <span>{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function ScenesPanel({
  job,
  fallbackSettings,
}: {
  job?: GenerationJob;
  fallbackSettings: GenerationSettings;
}) {
  const scenes = job?.scenes;
  const total =
    scenes?.reduce((a, s) => a + s.durationSec, 0) ??
    Math.round(fallbackSettings.lengthMinutes * 60);

  return (
    <Card title="Scene plan" subtitle={`~${Math.round(total / 60)} min total`}>
      <div className="space-y-2">
        {scenes?.length ? (
          <div className="space-y-2">
            {scenes.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-zinc-200 bg-white p-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">
                      {s.title}
                    </div>
                    <div className="text-xs text-zinc-600">{s.description}</div>
                  </div>
                  <Badge tone="zinc">{formatDuration(s.durationSec)}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-zinc-700">
            Scenes will appear after you start a job. (They’re derived from your prompt + length.)
          </div>
        )}
      </div>
    </Card>
  );
}

function JobsList({
  jobs,
  activeJobId,
  onSelect,
  onClearCompleted,
}: {
  jobs: GenerationJob[];
  activeJobId?: string;
  onSelect: (id: string) => void;
  onClearCompleted: () => void;
}) {
  return (
    <Card
      title="Jobs"
      subtitle="Your recent generations"
      right={
        <Button
          size="sm"
          variant="secondary"
          onClick={onClearCompleted}
          disabled={
            !jobs.some(
              (j) =>
                j.status === "complete" ||
                j.status === "canceled" ||
                j.status === "failed"
            )
          }
        >
          Clear finished
        </Button>
      }
    >
      <div className="space-y-2">
        {jobs.length === 0 ? (
          <div className="text-sm text-zinc-700">
            No jobs yet. Start generation in Studio.
          </div>
        ) : (
          jobs.map((j) => (
            <button
              key={j.id}
              className={
                "w-full rounded-2xl border p-3 text-left transition-colors " +
                (activeJobId === j.id
                  ? "border-indigo-300 bg-indigo-50"
                  : "border-zinc-200 bg-white hover:bg-zinc-50")
              }
              onClick={() => onSelect(j.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-900">
                    Job {j.id.slice(-6)}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {formatTime(j.createdAt)} • {j.settings.lengthMinutes.toFixed(1)}m • {j.settings.aspectRatio} • {j.settings.quality} • {j.backendMode ?? "local"}
                  </div>
                </div>
                <Badge
                  tone={
                    j.status === "complete"
                      ? "emerald"
                      : j.status === "running"
                        ? "amber"
                        : j.status === "canceled"
                          ? "rose"
                          : "zinc"
                  }
                >
                  {j.status}
                </Badge>
              </div>
              <div className="mt-2">
                <ProgressBar value={j.progress} />
              </div>
            </button>
          ))
        )}
      </div>
    </Card>
  );
}

function AssetsView({
  assets,
  onUploadAudio,
}: {
  assets: Asset[];
  onUploadAudio: (f: File) => void;
}) {
  return (
    <Card
      title="Assets"
      subtitle="Upload audio to drive lip-sync"
      right={
        <label>
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUploadAudio(f);
              e.currentTarget.value = "";
            }}
          />
          <span>
            <Button size="sm" variant="secondary">
              <Icon name="wave" /> Upload audio
            </Button>
          </span>
        </label>
      }
    >
      <div className="space-y-2">
        {assets.length === 0 ? (
          <div className="text-sm text-zinc-700">No assets yet.</div>
        ) : (
          assets.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-zinc-200 bg-white p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-900">
                    {a.name}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {a.type}
                    {a.mime ? ` • ${a.mime}` : ""}
                    {typeof a.size === "number"
                      ? ` • ${(a.size / 1024 / 1024).toFixed(2)} MB`
                      : ""}
                  </div>
                </div>
                <Badge tone="zinc">{formatTime(a.createdAt)}</Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function exportJob(job: GenerationJob, project: Project) {
  const manifest = {
    app: "VeoForge Studio (prototype)",
    exportedAt: new Date().toISOString(),
    project: {
      id: project.id,
      name: project.name,
    },
    job: {
      id: job.id,
      status: job.status,
      backendMode: job.backendMode ?? "local",
      settings: job.settings,
      scenes: job.scenes,
      stages: job.stages,
      result: job.result,
      note: job.result?.exportNote,
    },
  };
  downloadJson(
    `veoforge_${project.name.replace(/\s+/g, "_")}_${job.id.slice(-6)}.manifest.json`,
    manifest
  );
}
