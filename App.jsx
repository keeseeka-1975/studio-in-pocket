import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * THE STUDIO IN YOUR POCKET — clean App.jsx
 * - No external icon libs required (icons are inline SVG)
 * - Beatmaker play actually plays (Web Audio) + stop works
 * - Studio record actually records mic (MediaRecorder) + playback works
 * - Songwriter is ChatGPT-style (local “AI” demo generator)
 * - All tiles/cards are real <button type="button"> (clickable)
 */

/* ----------------------------- Simple SVG Icons ---------------------------- */

function Icon({ name, size = 18 }) {
  const s = size;
  const common = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
  const stroke = { stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

  switch (name) {
    case "mic":
      return (
        <svg {...common}>
          <path {...stroke} d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z" />
          <path {...stroke} d="M19 11a7 7 0 0 1-14 0" />
          <path {...stroke} d="M12 18v3" />
          <path {...stroke} d="M8 21h8" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <path {...stroke} d="M8 5v14l11-7-11-7Z" />
        </svg>
      );
    case "stop":
      return (
        <svg {...common}>
          <rect {...stroke} x="7" y="7" width="10" height="10" rx="2" />
        </svg>
      );
    case "disc":
      return (
        <svg {...common}>
          <circle {...stroke} cx="12" cy="12" r="9" />
          <circle {...stroke} cx="12" cy="12" r="2" />
        </svg>
      );
    case "sparkles":
      return (
        <svg {...common}>
          <path {...stroke} d="M12 2l1.2 4.2L17.5 8l-4.3 1.8L12 14l-1.2-4.2L6.5 8l4.3-1.8L12 2Z" />
          <path {...stroke} d="M19 13l.8 2.7L23 17l-3.2 1.3L19 21l-.8-2.7L15 17l3.2-1.3L19 13Z" />
        </svg>
      );
    case "drums":
      return (
        <svg {...common}>
          <path {...stroke} d="M4 10c0-3.3 3.6-6 8-6s8 2.7 8 6-3.6 6-8 6-8-2.7-8-6Z" />
          <path {...stroke} d="M4 10v5c0 3.3 3.6 6 8 6s8-2.7 8-6v-5" />
          <path {...stroke} d="M7 8l-3-3" />
          <path {...stroke} d="M17 8l3-3" />
        </svg>
      );
    case "library":
      return (
        <svg {...common}>
          <path {...stroke} d="M7 4h12v16H7" />
          <path {...stroke} d="M5 6h2v14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
        </svg>
      );
    case "radio":
      return (
        <svg {...common}>
          <path {...stroke} d="M4 11a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7Z" />
          <path {...stroke} d="M8 9l10-4" />
          <path {...stroke} d="M7 16h.01" />
          <path {...stroke} d="M11 16h.01" />
          <path {...stroke} d="M15 16h.01" />
          <path {...stroke} d="M19 16h.01" />
        </svg>
      );
    case "waves":
      return (
        <svg {...common}>
          <path {...stroke} d="M3 12c2.5-3 5.5-3 8 0s5.5 3 8 0 2.5-3 5 0" />
          <path {...stroke} d="M3 6c2.5-3 5.5-3 8 0s5.5 3 8 0 2.5-3 5 0" />
          <path {...stroke} d="M3 18c2.5-3 5.5-3 8 0s5.5 3 8 0 2.5-3 5 0" />
        </svg>
      );
    case "creditcard":
      return (
        <svg {...common}>
          <rect {...stroke} x="3" y="6" width="18" height="12" rx="2" />
          <path {...stroke} d="M3 10h18" />
          <path {...stroke} d="M7 15h4" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <path {...stroke} d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
          <path
            {...stroke}
            d="M19.4 15a8 8 0 0 0 .1-1 8 8 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-1.7-1l-.3-2.6H9l-.3 2.6a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.4L4.6 13a8 8 0 0 0-.1 1 8 8 0 0 0 .1 1l-2 1.6 2 3.4 2.4-1c.5.4 1.1.8 1.7 1l.3 2.6h6l.3-2.6c.6-.2 1.2-.6 1.7-1l2.4 1 2-3.4-2-1.6Z"
          />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path {...stroke} d="M18 6L6 18" />
          <path {...stroke} d="M6 6l12 12" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle {...stroke} cx="12" cy="12" r="9" />
        </svg>
      );
  }
}

/* --------------------------------- Styles -------------------------------- */

const bg = "#0b0a12";
const panel = "rgba(255,255,255,0.035)";
const border = "rgba(255,255,255,0.08)";
const textDim = "#cbd5e1";
const textFaint = "#94a3b8";
const grad = "linear-gradient(135deg,#8b5cf6,#ec4899)";

function cardStyle(extra = {}) {
  return {
    background: panel,
    border: `1px solid ${border}`,
    borderRadius: 16,
    padding: 18,
    ...extra,
  };
}

function btnStyle(kind = "primary") {
  if (kind === "primary") {
    return {
      background: grad,
      border: "none",
      color: "white",
      fontWeight: 800,
      borderRadius: 12,
      padding: "12px 16px",
      cursor: "pointer",
    };
  }
  if (kind === "danger") {
    return {
      background: "#ef4444",
      border: "none",
      color: "white",
      fontWeight: 800,
      borderRadius: 12,
      padding: "12px 16px",
      cursor: "pointer",
    };
  }
  return {
    background: "transparent",
    border: `1px solid ${border}`,
    color: "white",
    fontWeight: 800,
    borderRadius: 12,
    padding: "12px 16px",
    cursor: "pointer",
  };
}

/* ----------------------------- Audio: Drums ------------------------------- */

function ensureAudioContext(ref) {
  if (!ref.current) {
    ref.current = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ref.current.state === "suspended") ref.current.resume();
  return ref.current;
}

function playKick(ctx) {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(140, t);
  osc.frequency.exponentialRampToValueAtTime(55, t + 0.12);
  gain.gain.setValueAtTime(0.9, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.5);
}

function playSnare(ctx) {
  const t = ctx.currentTime;
  const len = Math.floor(ctx.sampleRate * 0.18);
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 1400;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.55, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

  noise.connect(filter).connect(gain).connect(ctx.destination);
  noise.start(t);
  noise.stop(t + 0.2);
}

function playHat(ctx) {
  const t = ctx.currentTime;
  const len = Math.floor(ctx.sampleRate * 0.045);
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 6500;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.22, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

  noise.connect(filter).connect(gain).connect(ctx.destination);
  noise.start(t);
  noise.stop(t + 0.05);
}

/* --------------------------- Audio: Studio Record -------------------------- */

async function getMicStream() {
  return await navigator.mediaDevices.getUserMedia({ audio: true });
}

/* ------------------------------- Song “AI” ------------------------------- */

function generateProLyrics({ prompt, genre, mood }) {
  // Deterministic-ish local generator (demo). Replace with real API later.
  const p = (prompt || "").trim();
  const g = genre || "R&B";
  const m = mood || "Emotional";

  const hook =
    m === "Romantic"
      ? "I don’t want a moment— I want the whole life"
      : m === "Hype"
        ? "Turn it up, let it hit like a headline"
        : m === "Dark"
          ? "I been talking to the shadows in the moonlight"
          : "I’ve been trying to hold my heart in the floodlight";

  const themeLine =
    p.length > 0
      ? `Theme: ${p}`
      : "Theme: redemption, love, and the cost of becoming";

  return `TITLE: ${p ? p.slice(0, 40) : "Untitled"} (${g}, ${m})
${themeLine}

[VERSE 1]
I keep my pain in a velvet case, don’t let it show
Smile on the surface, but the real me is moving slow
If you can read between the lines, you’ll see the truth
I’m learning how to breathe again— I’m bulletproof

[PRE-CHORUS]
Say my name like you mean it
Hold me close, I can feel it
Every scar got a reason
Every night got a ceiling

[CHORUS / HOOK]
${hook}
If you ride for me, I’ma ride for you— no lie
We can make the broken beautiful, watch it come alive

[VERSE 2]
I used to chase what was loud, now I’m drawn to what is real
A love that doesn’t need a stage to prove the way it feels
If the world turns cold, we’ll light it with our hands
No perfect story— just a promise we can stand

[BRIDGE]
If I fall, don’t let me fade
If you run, I’ll still be brave
We don’t need to imitate— we elevate

[FINAL CHORUS]
${hook}
If you ride for me, I’ma ride for you— no lie
We can make the broken beautiful, watch it come alive`;
}

/* ---------------------------------- App ---------------------------------- */

export default function App() {
  const tabs = useMemo(
    () => [
      { id: "home", label: "Home", icon: "disc" },
      { id: "studio", label: "Studio", icon: "mic" },
      { id: "beatmaker", label: "Beatmaker", icon: "drums" },
      { id: "songwriter", label: "Songwriter", icon: "sparkles" },
      { id: "karaoke", label: "Karaoke", icon: "disc" },
      { id: "stems", label: "Stems", icon: "waves" },
      { id: "podcast", label: "Podcast", icon: "radio" },
      { id: "presets", label: "Presets", icon: "library" },
      { id: "pricing", label: "Pricing", icon: "creditcard" },
      { id: "settings", label: "Settings", icon: "settings" },
    ],
    []
  );

  const [activeTab, setActiveTab] = useState("home");

  /* Owner access */
  const [ownerUnlocked, setOwnerUnlocked] = useState(() => localStorage.getItem("ownerUnlocked") === "true");
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [ownerCode, setOwnerCode] = useState("");

  /* Beatmaker */
  const audioRef = useRef(null);
  const beatTimerRef = useRef(null);
  const [beatPrompt, setBeatPrompt] = useState("");
  const [bpm, setBpm] = useState(120);
  const [isBeatPlaying, setIsBeatPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [beatPattern, setBeatPattern] = useState(() => ({
    kick: Array.from({ length: 16 }, (_, i) => i % 4 === 0),
    snare: Array.from({ length: 16 }, (_, i) => i === 4 || i === 12),
    hihat: Array.from({ length: 16 }, (_, i) => i % 2 === 0),
  }));

  const stopBeat = useCallback(() => {
    if (beatTimerRef.current) {
      clearInterval(beatTimerRef.current);
      beatTimerRef.current = null;
    }
    setIsBeatPlaying(false);
    setCurrentStep(0);
  }, []);

  const playBeat = useCallback(() => {
    const ctx = ensureAudioContext(audioRef);

    // Toggle stop
    if (isBeatPlaying) {
      stopBeat();
      return;
    }

    // Start
    setIsBeatPlaying(true);
    let step = 0;
    setCurrentStep(0);

    const stepMs = (60 / bpm) * 250; // 16th notes
    beatTimerRef.current = setInterval(() => {
      setCurrentStep(step);

      if (beatPattern.kick[step]) playKick(ctx);
      if (beatPattern.snare[step]) playSnare(ctx);
      if (beatPattern.hihat[step]) playHat(ctx);

      step = (step + 1) % 16;
    }, stepMs);
  }, [bpm, beatPattern, isBeatPlaying, stopBeat]);

  const generateBeat = useCallback(() => {
    const p = beatPrompt.toLowerCase();
    const isTrap = p.includes("trap") || p.includes("808") || p.includes("drill");
    const isHouse = p.includes("house") || p.includes("techno");
    const isLofi = p.includes("lofi") || p.includes("lo-fi") || p.includes("chill");

    const next = {
      kick: Array(16).fill(false),
      snare: Array(16).fill(false),
      hihat: Array(16).fill(false),
    };

    // Kick
    if (isHouse) {
      for (let i = 0; i < 16; i += 4) next.kick[i] = true; // 4-on-floor
    } else if (isTrap) {
      [0, 3, 6, 8, 11, 12, 14].forEach((i) => (next.kick[i] = true));
    } else if (isLofi) {
      [0, 6, 8, 12].forEach((i) => (next.kick[i] = true));
    } else {
      [0, 4, 8, 12].forEach((i) => (next.kick[i] = true));
    }

    // Snare
    [4, 12].forEach((i) => (next.snare[i] = true));
    if (isTrap) next.snare[12] = true;

    // Hats
    if (isTrap) {
      for (let i = 0; i < 16; i++) next.hihat[i] = true;
      // add “rolls”
      next.hihat[7] = true;
      next.hihat[15] = true;
    } else if (isHouse) {
      for (let i = 2; i < 16; i += 4) next.hihat[i] = true;
      for (let i = 6; i < 16; i += 8) next.hihat[i] = true;
    } else if (isLofi) {
      for (let i = 0; i < 16; i += 2) next.hihat[i] = Math.random() > 0.15;
    } else {
      for (let i = 0; i < 16; i += 2) next.hihat[i] = true;
    }

    setBeatPattern(next);
  }, [beatPrompt]);

  useEffect(() => {
    return () => stopBeat();
  }, [stopBeat]);

  /* Studio record/play + visualization */
  const [studioStatus, setStudioStatus] = useState("Idle");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState("");
  const mediaRecorderRef = useRef(null);
  const micStreamRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Visualizer
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(0);

  const startVisualizer = useCallback((stream) => {
    const ctx = ensureAudioContext(audioRef);
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    analyserRef.current = analyser;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext("2d");

    const buffer = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(buffer);

      const w = canvas.width;
      const h = canvas.height;
      c.clearRect(0, 0, w, h);

      // background
      c.fillStyle = "rgba(255,255,255,0.03)";
      c.fillRect(0, 0, w, h);

      // bars
      const bars = 64;
      const step = Math.floor(buffer.length / bars);
      for (let i = 0; i < bars; i++) {
        const v = buffer[i * step] / 255;
        const barH = v * (h - 18);
        const x = (i / bars) * w;
        const bw = w / bars - 2;

        // gradient-ish bars
        c.fillStyle = `rgba(139,92,246,${0.25 + v * 0.7})`;
        c.fillRect(x, h - barH, bw, barH);
      }

      // label
      c.fillStyle = "rgba(236,72,153,0.9)";
      c.font = "12px system-ui";
      c.fillText("Real-time spectrum (mic monitor)", 12, 18);
    };

    draw();
  }, []);

  const stopVisualizer = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    analyserRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    try {
      // Stop previous URL
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      setRecordedUrl("");
      recordedChunksRef.current = [];

      const stream = await getMicStream();
      micStreamRef.current = stream;

      startVisualizer(stream);

      const rec = new MediaRecorder(stream);
      mediaRecorderRef.current = rec;

      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      rec.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
      };

      rec.start();
      setIsRecording(true);
      setStudioStatus("Recording");
    } catch (e) {
      alert("Microphone permission denied or unavailable.");
      setStudioStatus("Idle");
    }
  }, [recordedUrl, startVisualizer]);

  const stopRecording = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    mediaRecorderRef.current = null;

    const stream = micStreamRef.current;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;

    stopVisualizer();

    setIsRecording(false);
    setStudioStatus("Idle");
  }, [stopVisualizer]);

  const playRecording = useCallback(() => {
    if (!recordedUrl) {
      alert("Record something first.");
      return;
    }
    const a = new Audio(recordedUrl);
    a.play();
    setStudioStatus("Playing");
    a.onended = () => setStudioStatus("Idle");
  }, [recordedUrl]);

  /* Songwriter ChatGPT-like */
  const [songPrompt, setSongPrompt] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [generatingLyrics, setGeneratingLyrics] = useState(false);
  const [genre, setGenre] = useState("R&B");
  const [mood, setMood] = useState("Emotional");

  const handleGenerateLyrics = useCallback(() => {
    if (!songPrompt.trim()) {
      alert("Describe the song you want (topic + vibe + references).");
      return;
    }
    setGeneratingLyrics(true);
    setLyrics("");
    setTimeout(() => {
      setLyrics(generateProLyrics({ prompt: songPrompt, genre, mood }));
      setGeneratingLyrics(false);
    }, 900);
  }, [songPrompt, genre, mood]);

  /* Presets (32+) */
  const presets = useMemo(() => {
    const legendary = Array.from({ length: 8 }, (_, i) => ({
      id: `legendary-${i + 1}`,
      name: [
        "Legendary Powerhouse",
        "Soul Icon",
        "Velvet Authority",
        "Stadium Lead",
        "Neo-Soul Gold",
        "Gospel Fire",
        "Cinematic Angel",
        "Future Pop Star",
      ][i],
      category: "Legendary",
      desc: "Massive presence • clarity • harmonic depth",
    }));

    const live = Array.from({ length: 12 }, (_, i) => ({
      id: `live-${i + 1}`,
      name: [
        "Stage Ready",
        "Arena Mode",
        "Festival Energy",
        "Club Tight",
        "Streaming Clean",
        "Gaming Voice",
        "In-Ear Monitor",
        "Feedback Guard",
        "Limiter Safe",
        "Wide Stereo Live",
        "Acoustic Set",
        "Talkback Pro",
      ][i],
      category: "Live",
      desc: "Low latency • stage-safe limiter • controlled power",
    }));

    const studio = Array.from({ length: 12 }, (_, i) => ({
      id: `studio-${i + 1}`,
      name: [
        "Radio Ready",
        "Chart Topper",
        "Intimate Booth",
        "Analog Warmth",
        "Crystal Air",
        "Modern R&B",
        "Pop Polish",
        "Vintage Soul",
        "Dark Trap Vox",
        "Bright Pop Vox",
        "Tube Saturation",
        "Master Chain",
      ][i],
      category: "Studio",
      desc: "Full FX chain • precision control • premium polish",
    }));

    const podcast = Array.from({ length: 4 }, (_, i) => ({
      id: `podcast-${i + 1}`,
      name: ["Warm Broadcast", "Crystal Clarity", "Intimate Talk", "Narration Pro"][i],
      category: "Podcast",
      desc: "De-esser • leveling • warm tone",
    }));

    return [...legendary, ...live, ...studio, ...podcast];
  }, []);

  const [presetFilter, setPresetFilter] = useState("All");
  const visiblePresets = presets.filter((p) => presetFilter === "All" || p.category === presetFilter);

  const applyPreset = useCallback((id) => {
    alert(`Preset applied: ${id}`);
  }, []);

  /* Karaoke (44 songs) */
  const karaokeSongs = useMemo(() => {
    const mk = (id, title, artist, difficulty, bpm, duration) => ({ id, title, artist, difficulty, bpm, duration });
    const list = [];
    let id = 1;

    const easy = [
      ["Perfect Night", "Studio Sessions", 90, "3:42"],
      ["Summer Love", "The Dreamers", 100, "3:15"],
      ["Golden Hour", "Sunset Club", 92, "3:28"],
      ["Easy Groove", "Pocket Band", 84, "2:58"],
      ["City Lights", "Neon Pop", 105, "3:12"],
      ["Sweet Harmony", "Choir Lane", 88, "3:44"],
    ];
    easy.forEach((s) => list.push(mk(id++, s[0], s[1], "Easy", s[2], s[3])));

    const medium = [
      ["Midnight Soul", "Velvet Voice", 85, "4:20"],
      ["R&B Feelings", "Smooth Groove", 95, "3:55"],
      ["Neon Dreams", "Late Drive", 110, "3:30"],
      ["Heart On Fire", "Moonlight", 78, "4:02"],
      ["Stay With Me", "Blue Room", 90, "3:40"],
      ["Better Days", "Sunrise", 98, "3:25"],
      ["Ocean Eyes", "Tide", 86, "3:51"],
      ["Run It Back", "Tempo", 120, "3:18"],
      ["Soft Rain", "Lo-Fi Lane", 82, "2:59"],
      ["Back Again", "Second Verse", 96, "3:36"],
      ["Hold The Line", "Signal", 104, "3:22"],
      ["Keep It Real", "Truth", 92, "3:10"],
    ];
    medium.forEach((s) => list.push(mk(id++, s[0], s[1], "Medium", s[2], s[3])));

    const hard = [
      ["Power Ballad", "Epic Singers", 72, "5:10"],
      ["Gospel Glory", "Soul Choir", 88, "4:45"],
      ["Jazz Nights", "Blue Quartet", 76, "4:12"],
      ["Rock Anthem", "Stadium Co.", 132, "3:49"],
      ["Soul Fire", "Classic Gold", 94, "4:05"],
      ["Electric Love", "Voltage", 124, "3:33"],
      ["High Notes", "Skylight", 108, "3:57"],
      ["Run The World", "Momentum", 126, "3:21"],
      ["Break The Spell", "Mystic", 80, "4:18"],
      ["Heartbreaker", "Silver", 118, "3:44"],
      ["No More Tears", "Midnight", 84, "4:26"],
      ["Take Control", "Command", 100, "3:58"],
    ];
    hard.forEach((s) => list.push(mk(id++, s[0], s[1], "Hard", s[2], s[3])));

    const expert = [
      ["Vocal Olympics", "The Legends", 120, "4:30"],
      ["The Greatest", "Champion Sound", 140, "3:50"],
      ["Impossible Dream", "High Wire", 128, "4:08"],
      ["Showstopper", "Main Stage", 150, "3:46"],
      ["Vocal Masterpiece", "Elite", 136, "4:02"],
      ["Runs & Riffs", "Adlib City", 110, "3:56"],
      ["Belter’s Peak", "Summit", 98, "4:11"],
      ["Chord Chase", "Harmony Lab", 104, "4:00"],
      ["Tempo Storm", "Fast Lane", 160, "3:12"],
      ["Precision", "Pitch King", 130, "3:48"],
      ["Falsetto Sky", "Airwave", 112, "3:59"],
      ["Final Boss", "Ultra", 170, "3:05"],
      ["Legend Mode", "Maxed", 145, "3:34"],
      ["Perfect Pitch", "Gold Ear", 125, "4:20"],
    ];
    expert.forEach((s) => list.push(mk(id++, s[0], s[1], "Expert", s[2], s[3])));

    return list.slice(0, 44);
  }, []);

  const [karaokeFilter, setKaraokeFilter] = useState("All");
  const [selectedSongId, setSelectedSongId] = useState(null);

  const filteredSongs = karaokeSongs.filter((s) => karaokeFilter === "All" || s.difficulty === karaokeFilter);

  /* Podcast “AI” tools (demo) */
  const [podcastTranscript, setPodcastTranscript] = useState("");
  const [podcastNotes, setPodcastNotes] = useState("");

  const generateTranscript = () => {
    setPodcastTranscript("Generating transcript...");
    setTimeout(() => {
      setPodcastTranscript(
        "00:00 Intro — Welcome to the show.\n02:15 Main topic — building legendary vocals.\n08:40 Tips — mic technique, clarity, compression.\n14:05 Wrap up — export stems and publish."
      );
    }, 900);
  };

  const generateShowNotes = () => {
    setPodcastNotes("Generating show notes...");
    setTimeout(() => {
      setPodcastNotes(
        "- Key takeaways: presence chain, low-latency live settings, safe limiter.\n- Chapters: Intro / Main / Tips / Wrap\n- Links: Presets, Beatmaker, Export settings."
      );
    }, 900);
  };

  /* Pricing */
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [processingPay, setProcessingPay] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  /* Owner modal shortcut */
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "O" || e.key === "o")) {
        e.preventDefault();
        setShowOwnerModal(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const unlockOwner = () => {
    if (ownerCode === "LEGENDARY-OWNER-2024") {
      setOwnerUnlocked(true);
      localStorage.setItem("ownerUnlocked", "true");
      setOwnerCode("");
      setShowOwnerModal(false);
      alert("Owner Lifetime unlocked ✅");
    } else {
      alert("Invalid code");
    }
  };

  /* ------------------------------- Layout UI ------------------------------ */

  return (
    <div style={{ minHeight: "100vh", background: bg, color: "white" }}>
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(9,9,16,0.9)",
          borderBottom: `1px solid ${border}`,
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("home")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: grad,
                display: "grid",
                placeItems: "center",
              }}
            >
              <Icon name="mic" size={18} />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 900, letterSpacing: 0.5 }}>THE STUDIO</div>
              <div style={{ fontSize: 11, color: textFaint }}>IN YOUR POCKET</div>
            </div>
          </button>

          <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 12px",
                  borderRadius: 12,
                  border: `1px solid ${border}`,
                  background: activeTab === t.id ? grad : "transparent",
                  color: activeTab === t.id ? "white" : textDim,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                <Icon name={t.icon} />
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px", display: "grid", gap: 18 }}>
        {/* HOME */}
        {activeTab === "home" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={cardStyle({ padding: 22 })}>
              <div style={{ display: "inline-flex", gap: 8, alignItems: "center", padding: "6px 10px", borderRadius: 999, background: "rgba(139,92,246,0.12)", border: `1px solid rgba(139,92,246,0.25)`, color: "#c4b5fd", fontWeight: 800, fontSize: 12 }}>
                GRAMMY‑LEVEL ENGINE
              </div>

              <h1
                style={{
                  fontSize: 44,
                  fontWeight: 950,
                  marginTop: 10,
                  marginBottom: 10,
                  lineHeight: 1.05,
                  background: grad,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Sound legendary. Anywhere.
              </h1>
              <p style={{ color: textDim, maxWidth: 760, fontSize: 16, lineHeight: 1.6 }}>
                Studio, your one stop audio workspace — voice changer, vocal designer, AI singing generator, beatmaker, stem tools, podcast tools, and export-ready stems in seconds.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
                <button type="button" onClick={() => setActiveTab("studio")} style={btnStyle("primary")}>
                  Open Studio
                </button>
                <button type="button" onClick={() => setActiveTab("beatmaker")} style={btnStyle("secondary")}>
                  Build a Beat
                </button>
                <button type="button" onClick={() => setActiveTab("songwriter")} style={btnStyle("secondary")}>
                  Write Lyrics
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
              {[
                { k: "10–20x Presence", v: "Massive vocal presence + polish" },
                { k: "Real-time Tools", v: "Beat playback + mic record + spectrum" },
                { k: "Stems Fast", v: "Export-ready stems in seconds" },
                { k: "Pro Workflow", v: "Live / Studio / Podcast ready" },
              ].map((x) => (
                <div key={x.k} style={cardStyle()}>
                  <div style={{ fontWeight: 900, fontSize: 18, color: "#c4b5fd" }}>{x.k}</div>
                  <div style={{ color: textFaint, marginTop: 6, lineHeight: 1.5 }}>{x.v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STUDIO */}
        {activeTab === "studio" && (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={cardStyle({ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" })}>
              <div>
                <div style={{ color: textFaint, fontSize: 12 }}>Status</div>
                <div style={{ fontWeight: 950, fontSize: 18 }}>{studioStatus}</div>
                <div style={{ color: textDim, fontSize: 13, marginTop: 6 }}>
                  Record your mic (real) • visualize spectrum (real) • play back (real)
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                {!isRecording ? (
                  <button type="button" onClick={startRecording} style={{ ...btnStyle("primary"), display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <Icon name="mic" /> Record
                  </button>
                ) : (
                  <button type="button" onClick={stopRecording} style={{ ...btnStyle("danger"), display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <Icon name="stop" /> Stop
                  </button>
                )}

                <button type="button" onClick={playRecording} style={{ ...btnStyle("secondary"), display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Icon name="play" /> Play Take
                </button>
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontWeight: 900 }}>Real-Time Audio Visualization</div>
                <div style={{ color: textFaint, fontSize: 12 }}>Mic monitor (frequency bars)</div>
              </div>

              <div style={{ width: "100%", overflow: "hidden", borderRadius: 14, border: `1px solid ${border}` }}>
                <canvas ref={canvasRef} width={1100} height={180} style={{ width: "100%", height: 180, display: "block" }} />
              </div>

              <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
                {["Auto-Tune", "Formant", "Pitch Shift", "Reverb", "Delay", "Compression", "Noise Gate", "Saturation"].map((label) => (
                  <div key={label} style={{ padding: 12, borderRadius: 14, border: `1px solid ${border}`, background: "rgba(0,0,0,0.2)" }}>
                    <div style={{ fontWeight: 800, color: "white" }}>{label}</div>
                    <input type="range" min={0} max={100} defaultValue={35} style={{ width: "100%", marginTop: 10 }} />
                    <div style={{ color: textFaint, fontSize: 12, marginTop: 6 }}>Demo control (UI ready for DSP)</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ fontWeight: 900, marginBottom: 10 }}>Export</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" style={btnStyle("secondary")}>Export WAV</button>
                <button type="button" style={btnStyle("secondary")}>Export MP3</button>
                <button type="button" style={btnStyle("secondary")}>Export STEMS</button>
              </div>
              <div style={{ color: textFaint, fontSize: 12, marginTop: 8 }}>
                (Export buttons are UI placeholders unless you add a backend file pipeline.)
              </div>
            </div>
          </div>
        )}

        {/* BEATMAKER */}
        {activeTab === "beatmaker" && (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={cardStyle()}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Icon name="drums" />
                <div style={{ fontWeight: 950, fontSize: 18 }}>AI Beatmaker</div>
                <div style={{ marginLeft: "auto", color: textFaint, fontSize: 12 }}>Step: {currentStep + 1}/16</div>
              </div>

              <textarea
                value={beatPrompt}
                onChange={(e) => setBeatPrompt(e.target.value)}
                placeholder='Describe your beat (e.g. "hard trap beat with 808s and fast hats")'
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 12,
                  border: `1px solid ${border}`,
                  background: "rgba(0,0,0,0.25)",
                  color: "white",
                  minHeight: 90,
                  outline: "none",
                }}
              />

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                {["Trap", "Boom Bap", "R&B", "Lo‑Fi", "House", "Drill"].map((g) => (
                  <button key={g} type="button" onClick={() => setBeatPrompt(`${g} beat with your style`)} style={btnStyle("secondary")}>
                    {g}
                  </button>
                ))}
                <button type="button" onClick={generateBeat} style={{ ...btnStyle("primary"), marginLeft: "auto" }}>
                  Generate
                </button>
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 12 }}>
                <div style={{ color: textDim, fontWeight: 900 }}>BPM: {bpm}</div>
                <input type="range" min={60} max={180} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
                <button type="button" onClick={playBeat} style={isBeatPlaying ? btnStyle("danger") : btnStyle("primary")}>
                  {isBeatPlaying ? "Stop" : "Play"}
                </button>
                <button type="button" onClick={stopBeat} style={btnStyle("secondary")}>
                  <Icon name="stop" /> Reset
                </button>
              </div>
            </div>

            <div style={cardStyle()}>
              {[
                ["kick", "#ef4444"],
                ["snare", "#f59e0b"],
                ["hihat", "#22c55e"],
              ].map(([drum, color]) => (
                <div key={drum} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 60, fontSize: 12, color: textFaint, textTransform: "uppercase", fontWeight: 900 }}>{drum}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {beatPattern[drum].map((on, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setBeatPattern((prev) => ({
                            ...prev,
                            [drum]: prev[drum].map((v, i) => (i === idx ? !v : v)),
                          }));
                          // preview on enable
                          if (!on) {
                            const ctx = ensureAudioContext(audioRef);
                            if (drum === "kick") playKick(ctx);
                            if (drum === "snare") playSnare(ctx);
                            if (drum === "hihat") playHat(ctx);
                          }
                        }}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 8,
                          border: `1px solid ${border}`,
                          background: on ? color : "rgba(255,255,255,0.05)",
                          cursor: "pointer",
                          outline: idx === currentStep && isBeatPlaying ? "2px solid rgba(236,72,153,0.8)" : "none",
                        }}
                        aria-label={`${drum} step ${idx + 1}`}
                        title={`${drum} step ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ color: textFaint, fontSize: 12, marginTop: 6 }}>
                Tip: click pads to toggle steps. Press Play to hear the loop.
              </div>
            </div>
          </div>
        )}

        {/* SONGWRITER */}
        {activeTab === "songwriter" && (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={cardStyle()}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Icon name="sparkles" />
                <div style={{ fontWeight: 950, fontSize: 18 }}>AI Songwriter (ChatGPT‑style)</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <label style={{ display: "grid", gap: 6, color: textDim, fontWeight: 800, fontSize: 12 }}>
                  Genre
                  <select value={genre} onChange={(e) => setGenre(e.target.value)} style={{ padding: 10, borderRadius: 12, background: "rgba(0,0,0,0.25)", color: "white", border: `1px solid ${border}` }}>
                    {["R&B", "Pop", "Hip-Hop", "Soul", "Gospel", "Rock", "Country"].map((x) => (
                      <option key={x} value={x}>{x}</option>
                    ))}
                  </select>
                </label>

                <label style={{ display: "grid", gap: 6, color: textDim, fontWeight: 800, fontSize: 12 }}>
                  Mood
                  <select value={mood} onChange={(e) => setMood(e.target.value)} style={{ padding: 10, borderRadius: 12, background: "rgba(0,0,0,0.25)", color: "white", border: `1px solid ${border}` }}>
                    {["Emotional", "Romantic", "Hype", "Dark", "Hopeful", "Nostalgic"].map((x) => (
                      <option key={x} value={x}>{x}</option>
                    ))}
                  </select>
                </label>
              </div>

              <textarea
                value={songPrompt}
                onChange={(e) => setSongPrompt(e.target.value)}
                placeholder='Describe the song like ChatGPT: "Write a soulful R&B song about leaving home, with a catchy hook and vivid imagery..."'
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 12,
                  border: `1px solid ${border}`,
                  background: "rgba(0,0,0,0.25)",
                  color: "white",
                  minHeight: 110,
                  outline: "none",
                }}
              />

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                {["Love slow jam", "Breakup anthem", "Empowerment", "Club banger", "Gospel lift", "Rap verse + hook"].map((p) => (
                  <button key={p} type="button" onClick={() => setSongPrompt(p)} style={btnStyle("secondary")}>
                    {p}
                  </button>
                ))}
                <button type="button" onClick={handleGenerateLyrics} disabled={generatingLyrics} style={{ ...btnStyle("primary"), marginLeft: "auto", opacity: generatingLyrics ? 0.7 : 1 }}>
                  {generatingLyrics ? "Writing…" : "Generate"}
                </button>
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ fontWeight: 950, marginBottom: 10 }}>Output</div>
              {lyrics ? (
                <pre style={{ whiteSpace: "pre-wrap", color: "#e2e8f0", lineHeight: 1.65, margin: 0 }}>{lyrics}</pre>
              ) : (
                <div style={{ color: textFaint }}>Generate lyrics to see them here.</div>
              )}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                <button type="button" onClick={() => navigator.clipboard.writeText(lyrics || "")} style={btnStyle("secondary")}>
                  Copy
                </button>
                <button type="button" onClick={() => setLyrics("")} style={btnStyle("secondary")}>
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* KARAOKE */}
        {activeTab === "karaoke" && (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={cardStyle()}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 950, fontSize: 18 }}>Karaoke Library (44)</div>
                  <div style={{ color: textFaint, fontSize: 12 }}>Click a song to open practice mode</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["All", "Easy", "Medium", "Hard", "Expert"].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setKaraokeFilter(f)}
                      style={{
                        ...btnStyle("secondary"),
                        padding: "10px 12px",
                        background: karaokeFilter === f ? "rgba(139,92,246,0.18)" : "transparent",
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
              {filteredSongs.map((song) => (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => {
                    setSelectedSongId(song.id);
                  }}
                  style={{
                    ...cardStyle({
                      cursor: "pointer",
                      textAlign: "left",
                      border: selectedSongId === song.id ? "2px solid rgba(139,92,246,0.9)" : `1px solid ${border}`,
                    }),
                  }}
                >
                  <div style={{ fontWeight: 950 }}>{song.title}</div>
                  <div style={{ color: textDim, fontSize: 13, marginTop: 4 }}>{song.artist}</div>
                  <div style={{ display: "flex", gap: 10, marginTop: 10, color: textFaint, fontSize: 12, flexWrap: "wrap" }}>
                    <span>{song.difficulty}</span>
                    <span>{song.duration}</span>
                    <span>{song.bpm} BPM</span>
                  </div>
                </button>
              ))}
            </div>

            {selectedSongId && (
              <div style={cardStyle({ textAlign: "center" })}>
                <div style={{ fontWeight: 950, fontSize: 16 }}>Practice Mode</div>
                <div style={{ color: textFaint, marginTop: 6 }}>Scoring is demo-based (no pitch tracking yet).</div>
                <div style={{ fontSize: 44, fontWeight: 950, color: "#22c55e", marginTop: 10 }}>{Math.floor(7000 + Math.random() * 2500)}</div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
                  <button type="button" onClick={() => setSelectedSongId(null)} style={btnStyle("secondary")}>
                    Back to library
                  </button>
                  <button type="button" onClick={() => setKaraokeScore((s) => s + 100)} style={btnStyle("primary")}>
                    Start Singing
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEMS */}
        {activeTab === "stems" && (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={cardStyle()}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name="waves" />
                <div style={{ fontWeight: 950, fontSize: 18 }}>Vocal / Stem Tools</div>
              </div>
              <p style={{ color: textDim, marginTop: 10, lineHeight: 1.6 }}>
                UI-ready tools: Vocal isolator, remove instrumentals, remove reverb/echo, stem splitter, export stems.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                <button type="button" style={btnStyle("secondary")}>Upload Audio</button>
                <button type="button" style={btnStyle("secondary")}>Extract Vocals</button>
                <button type="button" style={btnStyle("secondary")}>Remove Vocals (Karaoke)</button>
                <button type="button" style={btnStyle("primary")}>Export STEMS</button>
              </div>
              <div style={{ color: textFaint, fontSize: 12, marginTop: 8 }}>
                These are placeholders until you connect a real separation backend (Demucs/Spleeter/etc.).
              </div>
            </div>
          </div>
        )}

        {/* PODCAST */}
        {activeTab === "podcast" && (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={cardStyle()}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name="radio" />
                <div style={{ fontWeight: 950, fontSize: 18 }}>Podcast Studio</div>
              </div>
              <p style={{ color: textDim, marginTop: 10, lineHeight: 1.6 }}>
                Auto-leveling, transcript generation, and show notes (demo UI).
              </p>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                <button type="button" style={btnStyle("danger")}>Record</button>
                <button type="button" style={btnStyle("primary")}>Play</button>
                <button type="button" style={btnStyle("secondary")}>Auto-Level</button>
                <button type="button" onClick={generateTranscript} style={btnStyle("secondary")}>Generate Transcript</button>
                <button type="button" onClick={generateShowNotes} style={btnStyle("secondary")}>AI Show Notes</button>
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ fontWeight: 950, marginBottom: 10 }}>Transcript</div>
              <pre style={{ whiteSpace: "pre-wrap", margin: 0, color: "#e2e8f0", lineHeight: 1.6 }}>
                {podcastTranscript || "Click “Generate Transcript” to create a transcript."}
              </pre>
            </div>

            <div style={cardStyle()}>
              <div style={{ fontWeight: 950, marginBottom: 10 }}>Show Notes</div>
              <pre style={{ whiteSpace: "pre-wrap", margin: 0, color: "#e2e8f0", lineHeight: 1.6 }}>
                {podcastNotes || "Click “AI Show Notes” to create notes + chapters."}
              </pre>
            </div>
          </div>
        )}

        {/* PRESETS */}
        {activeTab === "presets" && (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={cardStyle({ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 })}>
              <div>
                <div style={{ fontWeight: 950, fontSize: 18 }}>Presets Library (32)</div>
                <div style={{ color: textFaint, fontSize: 12 }}>Click a preset to apply it</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["All", "Legendary", "Live", "Studio", "Podcast"].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setPresetFilter(f)}
                    style={{
                      ...btnStyle("secondary"),
                      padding: "10px 12px",
                      background: presetFilter === f ? "rgba(139,92,246,0.18)" : "transparent",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
              {visiblePresets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  style={cardStyle({
                    cursor: "pointer",
                    textAlign: "left",
                    border: "1px solid rgba(139,92,246,0.25)",
                  })}
                >
                  <div style={{ fontWeight: 950 }}>{p.name}</div>
                  <div style={{ color: "#c4b5fd", fontSize: 12, fontWeight: 900, marginTop: 6 }}>{p.category}</div>
                  <div style={{ color: textFaint, fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>{p.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PRICING */}
        {activeTab === "pricing" && (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={cardStyle()}>
              <div style={{ fontWeight: 950, fontSize: 22 }}>Pricing</div>
              <div style={{ color: textFaint, marginTop: 6 }}>Press Ctrl+Shift+O for owner unlock.</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
              {[
                { name: "Starter", price: "$19/mo", features: ["Vocal enhancement", "Auto-Tune UI", "Basic presets", "Podcast mode UI"] },
                { name: "Pro", price: "$49/mo", features: ["Voice changer UI", "Live + Studio UI", "Beatmaker", "Songwriter"] },
                { name: "Lifetime", price: ownerUnlocked ? "FREE (Owner)" : "$299 one-time", features: ["Everything unlocked", "Future updates", "Commercial rights"] },
              ].map((plan) => (
                <div key={plan.name} style={cardStyle({ border: plan.name === "Pro" ? "2px solid rgba(139,92,246,0.9)" : `1px solid ${border}` })}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                    <div style={{ fontWeight: 950, fontSize: 18 }}>{plan.name}</div>
                    <div style={{ fontWeight: 950, fontSize: 22 }}>{plan.price}</div>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "12px 0", color: textDim, lineHeight: 1.8 }}>
                    {plan.features.map((f) => (
                      <li key={f}>✓ {f}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => {
                      if (plan.name === "Lifetime" && ownerUnlocked) {
                        alert("Owner Lifetime is already active ✅");
                        return;
                      }
                      setSelectedPlan(plan.name);
                      setShowPayment(true);
                      setPaySuccess(false);
                    }}
                    style={btnStyle("primary")}
                  >
                    {plan.name === "Lifetime" && ownerUnlocked ? "Access Granted" : "Choose Plan"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={cardStyle()}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name="settings" />
                <div style={{ fontWeight: 950, fontSize: 18 }}>Settings</div>
              </div>
              <div style={{ color: textDim, marginTop: 10, lineHeight: 1.6 }}>
                Device routing + AI quality + UI preferences (demo).
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12, marginTop: 12 }}>
                <div style={cardStyle({ background: "rgba(0,0,0,0.2)" })}>
                  <div style={{ fontWeight: 900 }}>Audio</div>
                  <div style={{ color: textFaint, marginTop: 6, fontSize: 13 }}>Input/Output devices • buffer • latency</div>
                </div>
                <div style={cardStyle({ background: "rgba(0,0,0,0.2)" })}>
                  <div style={{ fontWeight: 900 }}>AI</div>
                  <div style={{ color: textFaint, marginTop: 6, fontSize: 13 }}>Fast / Balanced / Maximum</div>
                </div>
                <div style={cardStyle({ background: "rgba(0,0,0,0.2)" })}>
                  <div style={{ fontWeight: 900 }}>Interface</div>
                  <div style={{ color: textFaint, marginTop: 6, fontSize: 13 }}>Theme • accent • animations</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${border}`, padding: "26px 20px", color: textFaint }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>© {new Date().getFullYear()} Studio AI Labs</div>
          <div>studioinpocket.com</div>
        </div>
      </footer>

      {/* Owner Modal */}
      {showOwnerModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.72)",
            display: "grid",
            placeItems: "center",
            zIndex: 200,
            padding: 16,
          }}
          onClick={() => setShowOwnerModal(false)}
        >
          <div
            style={cardStyle({
              width: 420,
              maxWidth: "100%",
              position: "relative",
              padding: 18,
            })}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowOwnerModal(false)}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "transparent",
                border: "none",
                color: textDim,
                cursor: "pointer",
              }}
              aria-label="Close"
            >
              <Icon name="x" />
            </button>

            <div style={{ fontWeight: 950, fontSize: 18 }}>Owner Access</div>
            <div style={{ color: textFaint, marginTop: 6 }}>Enter your code to unlock Lifetime for FREE (local device).</div>

            <input
              type="password"
              value={ownerCode}
              onChange={(e) => setOwnerCode(e.target.value)}
              placeholder="LEGENDARY-OWNER-2024"
              style={{
                width: "100%",
                marginTop: 12,
                padding: 12,
                borderRadius: 12,
                border: `1px solid ${border}`,
                background: "rgba(0,0,0,0.25)",
                color: "white",
                outline: "none",
              }}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button type="button" onClick={() => setShowOwnerModal(false)} style={btnStyle("secondary")}>
                Cancel
              </button>
              <button type="button" onClick={unlockOwner} style={btnStyle("primary")}>
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal (demo UI) */}
      {showPayment && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.72)",
            display: "grid",
            placeItems: "center",
            zIndex: 200,
            padding: 16,
          }}
          onClick={() => {
            setShowPayment(false);
            setPaySuccess(false);
          }}
        >
          <div
            style={cardStyle({
              width: 520,
              maxWidth: "100%",
              position: "relative",
              padding: 18,
            })}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setShowPayment(false);
                setPaySuccess(false);
              }}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "transparent",
                border: "none",
                color: textDim,
                cursor: "pointer",
              }}
              aria-label="Close"
            >
              <Icon name="x" />
            </button>

            {!paySuccess ? (
              <>
                <div style={{ fontWeight: 950, fontSize: 18 }}>Checkout — {selectedPlan}</div>
                <div style={{ color: textFaint, marginTop: 6 }}>Demo payment UI (connect Stripe to make real).</div>

                <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                  <input placeholder="Email" style={{ padding: 12, borderRadius: 12, border: `1px solid ${border}`, background: "rgba(0,0,0,0.25)", color: "white" }} />
                  <input placeholder="Card Number" style={{ padding: 12, borderRadius: 12, border: `1px solid ${border}`, background: "rgba(0,0,0,0.25)", color: "white" }} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <input placeholder="MM/YY" style={{ padding: 12, borderRadius: 12, border: `1px solid ${border}`, background: "rgba(0,0,0,0.25)", color: "white" }} />
                    <input placeholder="CVC" style={{ padding: 12, borderRadius: 12, border: `1px solid ${border}`, background: "rgba(0,0,0,0.25)", color: "white" }} />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={processingPay}
                  onClick={() => {
                    setProcessingPay(true);
                    setTimeout(() => {
                      setProcessingPay(false);
                      setPaySuccess(true);
                    }, 900);
                  }}
                  style={{ ...btnStyle("primary"), marginTop: 14, width: "100%", opacity: processingPay ? 0.7 : 1 }}
                >
                  {processingPay ? "Processing…" : "Pay Now"}
                </button>

                <div style={{ color: textFaint, fontSize: 12, marginTop: 10, textAlign: "center" }}>
                  🔒 Secure checkout (demo)
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "16px 6px" }}>
                <div style={{ fontWeight: 950, fontSize: 22, color: "#22c55e" }}>Success!</div>
                <div style={{ color: textDim, marginTop: 6 }}>You’re all set. Start creating.</div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPayment(false);
                    setPaySuccess(false);
                    setActiveTab("studio");
                  }}
                  style={{ ...btnStyle("primary"), marginTop: 14 }}
                >
                  Go to Studio
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
