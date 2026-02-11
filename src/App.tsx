import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Mic,
  Music,
  Music2,
  Radio,
  Play,
  Square,
  Zap,
  Wand2,
  Sparkles,
  Headphones,
  Drums,
  PanelTop,
  Library,
  Trophy,
  Gauge,
  Waves,
  Settings,
  CreditCard,
  User,
  Disc,
  Download,
  Heart,
  X
} from "lucide-react";
// Tabs
const tabs = [
  { id: "home", label: "Home", icon: <PanelTop size={16} /> },
  { id: "studio", label: "Studio", icon: <Mic size={16} /> },
  { id: "beatmaker", label: "Beatmaker", icon: <Drums size={16} /> },
  { id: "songwriter", label: "Songwriter", icon: <Sparkles size={16} /> },
  { id: "karaoke", label: "Karaoke", icon: <Music2 size={16} /> },
  { id: "stems", label: "Stems", icon: <Waves size={16} /> },
  { id: "podcast", label: "Podcast", icon: <Radio size={16} /> },
  { id: "presets", label: "Presets", icon: <Library size={16} /> },
  { id: "pricing", label: "Pricing", icon: <CreditCard size={16} /> },
];
const vocalPresets = [
  { id: "legendary-power", name: "Legendary Power", category: "Legendary", desc: "Rich, powerful soul vocal" },
  { id: "smooth-rnb", name: "Smooth R&B", category: "Legendary", desc: "Silky modern R&B" },
  { id: "arena", name: "Arena Mode", category: "Live", desc: "Big stage presence" },
  { id: "radio", name: "Radio Ready", category: "Studio", desc: "Broadcast polish" },
  { id: "intimate", name: "Intimate Talk", category: "Podcast", desc: "Close, warm voice" },
];
const karaokeSongs = [
  { id: 1, title: "Perfect Night", artist: "Studio Sessions", difficulty: "Easy", bpm: 90, duration: "3:42" },
  { id: 2, title: "Midnight Soul", artist: "Velvet Voice", difficulty: "Medium", bpm: 85, duration: "4:20" },
  { id: 3, title: "Power Ballad", artist: "Epic Singers", difficulty: "Hard", bpm: 72, duration: "5:10" },
  { id: 4, title: "Vocal Olympics", artist: "The Legends", difficulty: "Expert", bpm: 120, duration: "4:30" },
];
type TabId = typeof tabs[number]["id"];
export function App() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [ownerUnlocked, setOwnerUnlocked] = useState<boolean>(() => localStorage.getItem("ownerUnlocked") === "true");
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [ownerCode, setOwnerCode] = useState("");
  // Studio state
  const [isRecording, setIsRecording] = useState(false);
  const [studioStatus, setStudioStatus] = useState("Idle");
  // Beatmaker state
  const [beatPrompt, setBeatPrompt] = useState("");
  const [bpm, setBpm] = useState(120);
  const [beatPattern, setBeatPattern] = useState({
    kick: Array(16).fill(false).map((_, i) => i % 4 === 0),
    snare: Array(16).fill(false).map((_, i) => i === 4 || i === 12),
    hihat: Array(16).fill(false).map((_, i) => i % 2 === 0),
  });
  const [isBeatPlaying, setIsBeatPlaying] = useState(false);
  const beatInterval = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  // Songwriter state
  const [songPrompt, setSongPrompt] = useState("");
  const [lyrics, setLyrics] = useState<string>("");
  const [generatingLyrics, setGeneratingLyrics] = useState(false);
  // Karaoke state
  const [selectedSong, setSelectedSong] = useState<number | null>(null);
  const [karaokeScore, setKaraokeScore] = useState(0);
  const ensureAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };
  const playDrum = useCallback((type: "kick" | "snare" | "hihat") => {
    const ctx = ensureAudio();
    const now = ctx.currentTime;
    if (type === "kick") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === "snare") {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      noise.connect(gain).connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.2);
    } else {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 7000;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      noise.connect(filter).connect(gain).connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.05);
    }
  }, []);
  const toggleBeat = () => {
    if (isBeatPlaying) {
      if (beatInterval.current) clearInterval(beatInterval.current);
      beatInterval.current = null;
      setIsBeatPlaying(false);
      return;
    }
    setIsBeatPlaying(true);
    let step = 0;
    const stepMs = (60 / bpm) * 250; // 16th notes
    beatInterval.current = window.setInterval(() => {
      Object.entries(beatPattern).forEach(([drum, pattern]) => {
        if (pattern[step]) playDrum(drum as "kick" | "snare" | "hihat");
      });
      step = (step + 1) % 16;
    }, stepMs);
  };
  useEffect(() => {
    return () => {
      if (beatInterval.current) clearInterval(beatInterval.current);
    };
  }, []);
  const handleGenerateLyrics = () => {
    if (!songPrompt.trim()) {
      alert("Give me a topic for the song.");
      return;
    }
    setGeneratingLyrics(true);
    setTimeout(() => {
      setLyrics(
        `VERSE 1\n${songPrompt} in every line we sing\nFeel the fire that the melodies bring\n\nCHORUS\nWe rise, we shine, we own the night\nEvery heartbeat syncs with the light\n\nBRIDGE\nHold on, the sky is opening wide\nThis is our anthem, our moment, our ride`
      );
      setGeneratingLyrics(false);
    }, 1200);
  };
  const applyPreset = (id: string) => {
    alert(`Preset "${id}" applied!`);
  };
  const unlockOwner = () => {
    if (ownerCode === "LEGENDARY-OWNER-2024") {
      setOwnerUnlocked(true);
      localStorage.setItem("ownerUnlocked", "true");
      setShowOwnerModal(false);
      setOwnerCode("");
      alert("🎉 Lifetime access unlocked!");
    } else alert("Invalid code");
  };
  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 20,
  };
  return (
    <div style={{ minHeight: "100vh", background: "#0b0a12", color: "white" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(9,9,16,0.9)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
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
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Mic size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, letterSpacing: 0.5 }}>THE STUDIO</div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>IN YOUR POCKET</div>
            </div>
          </div>
          <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background:
                    activeTab === tab.id
                      ? "linear-gradient(135deg,#8b5cf6,#ec4899)"
                      : "transparent",
                  color: activeTab === tab.id ? "white" : "#cbd5e1",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px", display: "grid", gap: 24 }}>
        {/* HOME */}
        {activeTab === "home" && (
          <div>
            <h1
              style={{
                fontSize: 42,
                fontWeight: 800,
                marginBottom: 12,
                background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Sound Legendary. Anywhere.
            </h1>
            <p style={{ color: "#cbd5e1", maxWidth: 640, marginBottom: 24 }}>
              An AI-powered vocal enhancer, voice changer, beatmaker, and songwriter that makes any voice unrecognizable, legendary, and industry-ready.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
              <button
                type="button"
                onClick={() => setActiveTab("studio")}
                style={{
                  padding: "14px 22px",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Start Creating
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("pricing")}
                style={{
                  padding: "14px 22px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "transparent",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                View Plans
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
              {["10-20x Better Vocals", "300M+ Creators", "<5ms Latency", "100+ Presets"].map((stat) => (
                <div key={stat} style={{ ...cardStyle }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#8b5cf6" }}>{stat}</div>
                  <div style={{ color: "#94a3b8", fontSize: 13 }}>Industry-ready performance</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* STUDIO */}
        {activeTab === "studio" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "#cbd5e1", fontSize: 13 }}>Mode</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{studioStatus}</div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsRecording((r) => !r);
                    setStudioStatus((s) => (s === "Recording" ? "Idle" : "Recording"));
                  }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    border: "none",
                    background: isRecording ? "#ef4444" : "#8b5cf6",
                    color: "white",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <Mic size={20} />
                </button>
                <button
                  type="button"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    border: "none",
                    background: "#22c55e",
                    color: "white",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <Play size={20} />
                </button>
                <button
                  type="button"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    border: "none",
                    background: "#475569",
                    color: "white",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <Square size={18} />
                </button>
              </div>
            </div>
            <div style={{ ...cardStyle }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
                {["Auto-Tune", "Reverb", "Delay", "Compressor", "Noise Gate", "Limiter"].map((ctrl) => (
                  <div key={ctrl} style={{ padding: 12, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
                    <div style={{ color: "white", marginBottom: 8 }}>{ctrl}</div>
                    <input type="range" min={0} max={100} defaultValue={50} style={{ width: "100%" }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* BEATMAKER */}
        {activeTab === "beatmaker" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ ...cardStyle }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Drums size={18} />
                <div style={{ fontWeight: 700 }}>AI Beatmaker</div>
              </div>
              <textarea
                value={beatPrompt}
                onChange={(e) => setBeatPrompt(e.target.value)}
                placeholder="Describe your beat (e.g., hard trap with 808s)"
                style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "#0b0a12", color: "white", minHeight: 90, marginBottom: 12 }}
              />
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                {["Trap", "Boom Bap", "R&B", "Lo-Fi", "House"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setBeatPrompt(g + " beat with your style")}
                    style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "white", cursor: "pointer" }}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12 }}>
                <label style={{ color: "#cbd5e1" }}>BPM: {bpm}</label>
                <input type="range" min={60} max={180} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
                <button type="button" onClick={toggleBeat} style={{ marginLeft: "auto", padding: "10px 14px", borderRadius: 10, border: "none", background: isBeatPlaying ? "#ef4444" : "#22c55e", color: "white", fontWeight: 700, cursor: "pointer" }}>
                  {isBeatPlaying ? "Stop" : "Play"} Beat
                </button>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {Object.entries(beatPattern).map(([drum, pattern]) => (
                  <div key={drum} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 50, color: "#cbd5e1", fontSize: 12 }}>{drum.toUpperCase()}</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {pattern.map((step, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setBeatPattern((prev) => ({
                              ...prev,
                              [drum]: prev[drum].map((v, idx) => (idx === i ? !v : v)),
                            }));
                            if (!step) playDrum(drum as "kick" | "snare" | "hihat");
                          }}
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            border: "none",
                            background: step ? "#8b5cf6" : "#1f2937",
                            cursor: "pointer",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* SONGWRITER */}
        {activeTab === "songwriter" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ ...cardStyle }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Sparkles size={18} />
                <div style={{ fontWeight: 700 }}>AI Songwriter (ChatGPT-style)</div>
              </div>
              <textarea
                value={songPrompt}
                onChange={(e) => setSongPrompt(e.target.value)}
                placeholder="Describe your song: mood, story, style..."
                style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "#0b0a12", color: "white", minHeight: 90, marginBottom: 12 }}
              />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {["Love song", "Breakup", "Party", "Empowerment", "Hip-hop verse", "Gospel"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSongPrompt(p)}
                    style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "white", cursor: "pointer" }}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleGenerateLyrics}
                disabled={generatingLyrics}
                style={{ padding: "12px 16px", borderRadius: 10, border: "none", background: generatingLyrics ? "#475569" : "linear-gradient(135deg,#8b5cf6,#ec4899)", color: "white", fontWeight: 700, cursor: generatingLyrics ? "not-allowed" : "pointer" }}
              >
                {generatingLyrics ? "Writing..." : "Generate Lyrics"}
              </button>
            </div>
            {lyrics && (
              <div style={{ ...cardStyle }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Music size={18} />
                  <div style={{ fontWeight: 700 }}>Lyrics</div>
                </div>
                <pre style={{ whiteSpace: "pre-wrap", color: "#e2e8f0", lineHeight: 1.6 }}>{lyrics}</pre>
              </div>
            )}
          </div>
        )}
        {/* KARAOKE */}
        {activeTab === "karaoke" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ ...cardStyle }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Music2 size={18} />
                <div style={{ fontWeight: 700 }}>Karaoke Library</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
                {karaokeSongs.map((song) => (
                  <button
                    key={song.id}
                    type="button"
                    onClick={() => {
                      setSelectedSong(song.id);
                      setKaraokeScore(Math.floor(Math.random() * 3000) + 7000);
                    }}
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      border: selectedSong === song.id ? "2px solid #8b5cf6" : "1px solid rgba(255,255,255,0.06)",
                      background: selectedSong === song.id ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)",
                      textAlign: "left",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{song.title}</div>
                    <div style={{ color: "#cbd5e1", fontSize: 13 }}>{song.artist}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8, fontSize: 12, color: "#94a3b8" }}>
                      <span>{song.difficulty}</span>
                      <span>{song.duration}</span>
                      <span>{song.bpm} BPM</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {selectedSong && (
              <div style={{ ...cardStyle, textAlign: "center" }}>
                <h3 style={{ marginBottom: 8 }}>Score</h3>
                <div style={{ fontSize: 38, fontWeight: 800, color: "#22c55e", marginBottom: 12 }}>{karaokeScore}</div>
                <button
                  type="button"
                  onClick={() => setSelectedSong(null)}
                  style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "rgba(255,255,255,0.08)", color: "white", cursor: "pointer" }}
                >
                  Back to songs
                </button>
              </div>
            )}
          </div>
        )}
        {/* STEMS */}
        {activeTab === "stems" && (
          <div style={{ ...cardStyle }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Waves size={18} />
              <div style={{ fontWeight: 700 }}>Stem Extractor</div>
            </div>
            <p style={{ color: "#cbd5e1", marginBottom: 12 }}>Upload a track to split vocals, drums, bass, and instruments.</p>
            <button type="button" style={{ padding: "12px 16px", borderRadius: 10, border: "1px dashed rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.03)", color: "white", cursor: "pointer" }}>
              Upload Audio
            </button>
          </div>
        )}
        {/* PODCAST */}
        {activeTab === "podcast" && (
          <div style={{ ...cardStyle }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Radio size={18} />
              <div style={{ fontWeight: 700 }}>Podcast Studio</div>
            </div>
            <p style={{ color: "#cbd5e1", marginBottom: 12 }}>Record multi-track, auto-level, generate transcripts & show notes.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" style={{ padding: "12px 16px", borderRadius: 10, border: "none", background: "#ef4444", color: "white", cursor: "pointer" }}>
                Record
              </button>
              <button type="button" style={{ padding: "12px 16px", borderRadius: 10, border: "none", background: "#22c55e", color: "white", cursor: "pointer" }}>
                Play
              </button>
              <button type="button" style={{ padding: "12px 16px", borderRadius: 10, border: "none", background: "rgba(255,255,255,0.1)", color: "white", cursor: "pointer" }}>
                Export MP3
              </button>
            </div>
          </div>
        )}
        {/* PRESETS */}
        {activeTab === "presets" && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Vocal Presets</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
              {vocalPresets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  style={{
                    ...cardStyle,
                    textAlign: "left",
                    cursor: "pointer",
                    border: "1px solid rgba(139,92,246,0.3)",
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#cbd5e1", marginBottom: 10 }}>{p.category}</div>
                  <div style={{ color: "#94a3b8", fontSize: 13 }}>{p.desc}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    <span style={{ color: "#ec4899" }}>
                      <Heart size={14} />
                    </span>
                    <span style={{ color: "#22c55e" }}>
                      <Download size={14} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {/* PRICING */}
        {activeTab === "pricing" && (
          <div style={{ display: "grid", gap: 16 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800 }}>Pricing</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
              {[
                { name: "Starter", price: "$19/mo", features: ["Vocal enhancement", "Auto-Tune", "Basic presets", "Podcast mode"], badge: "" },
                { name: "Pro", price: "$49/mo", features: ["Full vocal changer", "Live+Studio modes", "Full beatmaker", "AI songwriter"], badge: "MOST POPULAR" },
                { name: "Lifetime", price: ownerUnlocked ? "FREE" : "$299 one-time", features: ["Everything unlocked", "Future updates", "Commercial rights"], badge: ownerUnlocked ? "OWNER" : "" },
              ].map((plan) => (
                <div key={plan.name} style={{ ...cardStyle, border: "1px solid rgba(255,255,255,0.1)" }}>
                  {plan.badge && (
                    <div style={{ background: "#22c55e", color: "white", display: "inline-block", padding: "4px 10px", borderRadius: 999, fontSize: 12, marginBottom: 8 }}>
                      {plan.badge}
                    </div>
                  )}
                  <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>{plan.name}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>{plan.price}</div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#cbd5e1", fontSize: 14, marginBottom: 12 }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ marginBottom: 6 }}>✓ {f}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => {
                      if (plan.name === "Lifetime" && ownerUnlocked) {
                        alert("Owner access already unlocked!");
                      } else {
                        setShowPaymentModal(true);
                        setSelectedPlan(plan.name);
                      }
                    }}
                    style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#8b5cf6,#ec4899)", color: "white", fontWeight: 700, cursor: "pointer" }}
                  >
                    {plan.name === "Lifetime" && ownerUnlocked ? "Access Granted" : "Choose Plan"}
                  </button>
                </div>
              ))}
            </div>
            <p style={{ color: "#6b7280" }}>Press Ctrl+Shift+O to unlock owner access.</p>
          </div>
        )}
      </main>
      {showOwnerModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "grid", placeItems: "center", zIndex: 100 }}>
          <div style={{ width: 360, background: "#0b0a12", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20, position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowOwnerModal(false)}
              style={{ position: "absolute", top: 10, right: 10, border: "none", background: "none", color: "#cbd5e1", cursor: "pointer" }}
            >
              <X size={18} />
            </button>
            <h3 style={{ marginBottom: 12 }}>Owner Access</h3>
            <input
              type="password"
              value={ownerCode}
              onChange={(e) => setOwnerCode(e.target.value)}
              placeholder="Enter code"
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "#0b0a12", color: "white", marginBottom: 12 }}
            />
            <button
              type="button"
              onClick={unlockOwner}
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "white", fontWeight: 700, cursor: "pointer" }}
            >
              Unlock
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
