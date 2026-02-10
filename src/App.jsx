import { useState, useEffect, useCallback } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isOwnerUnlocked, setIsOwnerUnlocked] = useState(false);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [ownerCode, setOwnerCode] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [transformIntensity, setTransformIntensity] = useState(8);
  const [selectedPreset, setSelectedPreset] = useState('legendary-powerhouse');
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformComplete, setTransformComplete] = useState(false);
  const [studioMode, setStudioMode] = useState('studio');
  const [isRecording, setIsRecording] = useState(false);
  const [beatPrompt, setBeatPrompt] = useState('');
  const [bpm, setBpm] = useState(120);
  const [beatGenerated, setBeatGenerated] = useState(false);
  const [isPlayingBeat, setIsPlayingBeat] = useState(false);
  const [drumPattern, setDrumPattern] = useState({
    kick: [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false],
    snare: [false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false],
    hihat: [true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true],
    clap: [false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,true],
  });
  const [songPrompt, setSongPrompt] = useState('');
  const [generatedLyrics, setGeneratedLyrics] = useState('');
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const [coachMode, setCoachMode] = useState('warmup');
  const [selectedSong, setSelectedSong] = useState(null);
  const [karaokeScore, setKaraokeScore] = useState(0);
  const [audioContext, setAudioContext] = useState(null);

  useEffect(() => {
    const unlocked = localStorage.getItem('ownerUnlocked');
    if (unlocked === 'true') setIsOwnerUnlocked(true);
    const initAudio = () => {
      if (!audioContext) setAudioContext(new (window.AudioContext || window.webkitAudioContext)());
    };
    document.addEventListener('click', initAudio, { once: true });
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'O') {
        e.preventDefault();
        setShowOwnerModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [audioContext]);

  const playSound = useCallback((type) => {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.setValueAtTime(type === 'kick' ? 150 : type === 'snare' ? 200 : type === 'hihat' ? 800 : 523, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }, [audioContext]);

  const handleOwnerUnlock = () => {
    if (ownerCode === 'LEGENDARY-OWNER-2024') {
      setIsOwnerUnlocked(true);
      localStorage.setItem('ownerUnlocked', 'true');
      setShowOwnerModal(false);
      setOwnerCode('');
      playSound('success');
      alert('🎉 Lifetime Access Unlocked! You now have FREE access forever!');
    } else {
      alert('❌ Invalid code. Please try again.');
    }
  };

  const handlePayment = (plan) => {
    if (isOwnerUnlocked && plan === 'lifetime') {
      alert('✅ You already have FREE Lifetime access!');
      return;
    }
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const processPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      playSound('success');
    }, 2000);
  };

  const generateBeat = () => {
    if (!beatPrompt.trim()) { alert('Please describe the beat!'); return; }
    setBeatGenerated(false);
    setTimeout(() => {
      setDrumPattern({
        kick: Array(16).fill(false).map((_, i) => i % 4 === 0),
        snare: Array(16).fill(false).map((_, i) => i === 4 || i === 12),
        hihat: Array(16).fill(false).map(() => Math.random() > 0.3),
        clap: Array(16).fill(false).map((_, i) => i === 4 || i === 12),
      });
      setBeatGenerated(true);
      playSound('success');
    }, 1500);
  };

  const playBeat = () => {
    if (isPlayingBeat) { setIsPlayingBeat(false); return; }
    setIsPlayingBeat(true);
    let step = 0;
    const interval = setInterval(() => {
      Object.keys(drumPattern).forEach(drum => {
        if (drumPattern[drum][step]) playSound(drum);
      });
      step = (step + 1) % 16;
    }, (60 / bpm) * 250);
    setTimeout(() => { clearInterval(interval); setIsPlayingBeat(false); }, 10000);
  };

  const generateLyrics = () => {
    if (!songPrompt.trim()) { alert('Please describe your song!'); return; }
    setIsGeneratingLyrics(true);
    setTimeout(() => {
      setGeneratedLyrics(`[Verse 1]\n${songPrompt.includes('love') ? 'Every moment with you feels like a dream\nYour eyes light up everything it seems' : 'Standing at the crossroads of my life\nReady to rise above the strife'}\n\n[Chorus]\n${songPrompt.includes('love') ? "You're my everything, my heart, my soul\nWith you by my side, I feel whole" : "I'm unstoppable, unbreakable\nMy spirit is unmistakable"}\n\n[Verse 2]\n${songPrompt.includes('love') ? "Through the storms and sunshine, you're my light\nHolding your hand, everything feels right" : "Every setback is a setup for success\nI'm gonna give it nothing less than my best"}\n\n[Bridge]\n${songPrompt.includes('love') ? "I'll love you till the end of time\nForever yours, forever mine" : "This is my moment, this is my time\nVictory is mine, I'm in my prime"}`);
      setIsGeneratingLyrics(false);
      playSound('success');
    }, 2000);
  };

  const transformVoice = () => {
    setIsTransforming(true);
    setTransformComplete(false);
    setTimeout(() => { setIsTransforming(false); setTransformComplete(true); playSound('success'); }, 3000);
  };

  const handleTabChange = useCallback((tab) => { setActiveTab(tab); setMobileMenuOpen(false); }, []);

  const styles = {
    app: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f0a1a 0%, #1a0a2e 50%, #0a0a14 100%)', color: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
    header: { background: 'rgba(10, 10, 20, 0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(147, 51, 234, 0.3)', padding: '15px 20px', position: 'sticky', top: 0, zIndex: 100 },
    headerContent: { maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' },
    logo: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
    logoIcon: { width: '40px', height: '40px', background: 'linear-gradient(135deg, #9333ea, #ec4899)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
    logoText: { fontSize: '18px', fontWeight: 'bold', background: 'linear-gradient(135deg, #9333ea, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    nav: { display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' },
    navButton: { padding: '8px 16px', background: 'transparent', color: '#aaa', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
    navButtonActive: { background: 'linear-gradient(135deg, #9333ea, #ec4899)', color: 'white' },
    main: { maxWidth: '1400px', margin: '0 auto', padding: '20px' },
    section: { background: 'rgba(20, 10, 30, 0.8)', borderRadius: '20px', padding: '30px', border: '1px solid rgba(147, 51, 234, 0.2)', marginBottom: '20px' },
    title: { fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', background: 'linear-gradient(135deg, #fff, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    subtitle: { color: '#aaa', marginBottom: '30px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' },
    card: { background: 'rgba(30, 20, 50, 0.8)', borderRadius: '15px', padding: '25px', border: '1px solid rgba(147, 51, 234, 0.2)', cursor: 'pointer' },
    button: { padding: '12px 24px', background: 'linear-gradient(135deg, #9333ea, #ec4899)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
    buttonSecondary: { padding: '12px 24px', background: 'rgba(147, 51, 234, 0.2)', color: '#c084fc', border: '1px solid rgba(147, 51, 234, 0.3)', borderRadius: '10px', cursor: 'pointer', fontSize: '16px' },
    input: { width: '100%', padding: '12px 16px', background: 'rgba(30, 20, 50, 0.8)', border: '1px solid rgba(147, 51, 234, 0.3)', borderRadius: '10px', color: 'white', fontSize: '16px', outline: 'none' },
    textarea: { width: '100%', padding: '15px', background: 'rgba(30, 20, 50, 0.8)', border: '1px solid rgba(147, 51, 234, 0.3)', borderRadius: '10px', color: 'white', fontSize: '16px', minHeight: '120px', resize: 'vertical', outline: 'none' },
    slider: { width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(147, 51, 234, 0.3)', cursor: 'pointer' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { background: 'linear-gradient(135deg, #1a0a2e, #0f0a1a)', borderRadius: '20px', padding: '40px', maxWidth: '500px', width: '90%', border: '1px solid rgba(147, 51, 234, 0.3)' },
    footer: { background: 'rgba(10, 10, 20, 0.95)', borderTop: '1px solid rgba(147, 51, 234, 0.3)', padding: '40px 20px', marginTop: '40px' },
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'transform', label: 'Transform', icon: '🎭' },
    { id: 'studio', label: 'Studio', icon: '🎙️' },
    { id: 'beatmaker', label: 'Beats', icon: '🥁' },
    { id: 'songwriter', label: 'Writer', icon: '✍️' },
    { id: 'coach', label: 'Coach', icon: '🎓' },
    { id: 'karaoke', label: 'Karaoke', icon: '🎤' },
    { id: 'stems', label: 'Stems', icon: '🎛️' },
    { id: 'podcast', label: 'Podcast', icon: '🎧' },
    { id: 'presets', label: 'Presets', icon: '⭐' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
  ];

  const transformPresets = [
    { id: 'legendary-powerhouse', name: 'Legendary Powerhouse', level: '20x', icon: '🎤' },
    { id: 'soul-icon', name: 'Soul Icon', level: '20x', icon: '👑' },
    { id: 'stadium-anthem', name: 'Stadium Anthem', level: '19x', icon: '⚡' },
    { id: 'gospel-fire', name: 'Gospel Fire', level: '20x', icon: '🔥' },
    { id: 'modern-rnb', name: 'Modern R&B', level: '18x', icon: '💜' },
    { id: 'pop-superstar', name: 'Pop Superstar', level: '17x', icon: '🌟' },
  ];

  const karaokeSongs = [
    { id: 1, title: 'Perfect Night', artist: 'Studio Sessions', difficulty: 'Easy', duration: '3:42' },
    { id: 2, title: 'Summer Love', artist: 'The Dreamers', difficulty: 'Easy', duration: '3:15' },
    { id: 3, title: 'Midnight Soul', artist: 'Velvet Voice', difficulty: 'Medium', duration: '4:20' },
    { id: 4, title: 'Power Ballad', artist: 'Epic Singers', difficulty: 'Hard', duration: '5:10' },
    { id: 5, title: 'Gospel Glory', artist: 'Soul Choir', difficulty: 'Hard', duration: '4:45' },
    { id: 6, title: 'Vocal Olympics', artist: 'The Legends', difficulty: 'Expert', duration: '4:30' },
  ];

  const vocalPresets = [
    { id: 1, name: 'Soulful Legend', category: 'Legendary', description: 'Rich, powerful soul voice' },
    { id: 2, name: 'Smooth Operator', category: 'Legendary', description: 'Silky smooth R&B tone' },
    { id: 3, name: 'Stage Ready', category: 'Live', description: 'Optimized for live performance' },
    { id: 4, name: 'Radio Ready', category: 'Studio', description: 'Broadcast-polished sound' },
    { id: 5, name: 'Warm Broadcast', category: 'Podcast', description: 'Professional podcast voice' },
    { id: 6, name: 'Crystal Clarity', category: 'Podcast', description: 'Ultra-clear speech' },
  ];

  const podcastSfx = [
    { id: 1, name: 'Intro Music', icon: '🎵' },
    { id: 2, name: 'Outro Music', icon: '🎬' },
    { id: 3, name: 'Transition', icon: '✨' },
    { id: 4, name: 'Ding', icon: '🔔' },
    { id: 5, name: 'Applause', icon: '👏' },
    { id: 6, name: 'Laughter', icon: '😂' },
  ];

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo} onClick={() => handleTabChange('home')}>
            <div style={styles.logoIcon}>🎤</div>
            <div>
              <div style={styles.logoText}>THE STUDIO</div>
              <div style={{ fontSize: '10px', color: '#888' }}>IN YOUR POCKET</div>
            </div>
          </div>
          <nav style={styles.nav}>
            {tabs.slice(0, 6).map(tab => (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)} style={{ ...styles.navButton, ...(activeTab === tab.id ? styles.navButtonActive : {}) }}>
                {tab.icon} {tab.label}
              </button>
            ))}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={styles.navButton}>⋯ More</button>
          </nav>
        </div>
        {mobileMenuOpen && (
          <div style={{ position: 'absolute', top: '70px', right: '20px', background: 'rgba(20, 10, 30, 0.98)', borderRadius: '15px', padding: '15px', border: '1px solid rgba(147, 51, 234, 0.3)', zIndex: 200 }}>
            {tabs.slice(6).map(tab => (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)} style={{ display: 'block', width: '100%', padding: '10px 20px', background: activeTab === tab.id ? 'linear-gradient(135deg, #9333ea, #ec4899)' : 'transparent', color: activeTab === tab.id ? 'white' : '#aaa', border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', marginBottom: '5px' }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main style={styles.main}>
        {activeTab === 'home' && (
          <div>
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#000', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px' }}>🏆 GRAMMY-LEVEL</div>
              <h1 style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '20px', lineHeight: 1.2 }}>
                Transform Any Voice Into A<br />
                <span style={{ background: 'linear-gradient(135deg, #9333ea, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Legendary Performance</span>
              </h1>
              <p style={{ fontSize: '18px', color: '#aaa', maxWidth: '600px', margin: '0 auto 30px' }}>AI-powered vocal enhancement that makes your voice 10-20x better. Unrecognizable. Professional. Industry-ready.</p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => handleTabChange('transform')} style={styles.button}>🎭 Transform Your Voice</button>
                <button onClick={() => handleTabChange('beatmaker')} style={styles.buttonSecondary}>🥁 Make Beats</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginBottom: '40px' }}>
              {[{ label: 'Vocals Transformed', value: '2.4M+', icon: '🎤' }, { label: 'Beats Created', value: '890K+', icon: '🥁' }, { label: 'Songs Written', value: '450K+', icon: '✍️' }, { label: 'User Rating', value: '4.9/5', icon: '⭐' }].map((stat, i) => (
                <div key={i} style={styles.card}>
                  <div style={{ fontSize: '24px', marginBottom: '5px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c084fc' }}>{stat.value}</div>
                  <div style={{ color: '#888', fontSize: '12px' }}>{stat.label}</div>
                </div>
              ))}
            </div>
            <div style={styles.section}>
              <h2 style={styles.title}>What You Can Do</h2>
              <p style={styles.subtitle}>Everything you need to create professional music</p>
              <div style={styles.grid}>
                {[{ icon: '🎭', title: 'Voice Transformer', desc: 'Make your voice unrecognizable' }, { icon: '🎙️', title: 'Vocal Studio', desc: 'Live, studio, and podcast modes' }, { icon: '🥁', title: 'AI Beatmaker', desc: 'Create pro beats with prompts' }, { icon: '✍️', title: 'AI Songwriter', desc: 'Write radio-ready lyrics' }, { icon: '🎓', title: 'Vocal Coach', desc: 'Training and challenges' }, { icon: '🎤', title: 'Karaoke Mode', desc: 'Sing along with scoring' }].map((feature, i) => (
                  <div key={i} style={styles.card}>
                    <div style={{ fontSize: '36px', marginBottom: '15px' }}>{feature.icon}</div>
                    <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>{feature.title}</h3>
                    <p style={{ color: '#888', fontSize: '14px' }}>{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transform' && (
          <div style={styles.section}>
            <h2 style={styles.title}>🎭 Voice Transformer</h2>
            <p style={styles.subtitle}>Make your voice 10-20x better and completely unrecognizable</p>
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '15px' }}>Choose a Preset</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {transformPresets.map(preset => (
                  <button key={preset.id} onClick={() => setSelectedPreset(preset.id)} style={{ padding: '15px 20px', background: selectedPreset === preset.id ? 'linear-gradient(135deg, #9333ea, #ec4899)' : 'rgba(30, 20, 50, 0.8)', border: selectedPreset === preset.id ? 'none' : '1px solid rgba(147, 51, 234, 0.3)', borderRadius: '12px', color: 'white', cursor: 'pointer' }}>
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>{preset.icon}</div>
                    <div style={{ fontWeight: 'bold' }}>{preset.name}</div>
                    <div style={{ fontSize: '12px', color: '#22c55e' }}>{preset.level} Better</div>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '15px' }}>Intensity: <span style={{ color: '#c084fc' }}>{transformIntensity}/10</span></h3>
              <input type="range" min="1" max="10" value={transformIntensity} onChange={(e) => setTransformIntensity(Number(e.target.value))} style={styles.slider} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={transformVoice} disabled={isTransforming} style={{ ...styles.button, padding: '20px 60px', fontSize: '20px', opacity: isTransforming ? 0.7 : 1 }}>
                {isTransforming ? '✨ Transforming...' : '✨ TRANSFORM MY VOICE'}
              </button>
              {transformComplete && (
                <div style={{ marginTop: '30px', padding: '30px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '15px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎉</div>
                  <h3 style={{ color: '#22c55e', fontSize: '24px' }}>Transformation Complete!</h3>
                  <p style={{ color: '#888' }}>Your voice is now {transformIntensity * 2}x better!</p>
                  <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                    <button style={styles.button}>▶️ Play Result</button>
                    <button style={styles.buttonSecondary}>📥 Download</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'studio' && (
          <div style={styles.section}>
            <h2 style={styles.title}>🎙️ Vocal Studio</h2>
            <p style={styles.subtitle}>Professional processing for every situation</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
              {[{ id: 'live', label: 'Live Performance', icon: '⚡' }, { id: 'studio', label: 'Studio Recording', icon: '🎚️' }, { id: 'podcast', label: 'Podcast', icon: '🎙️' }].map(mode => (
                <button key={mode.id} onClick={() => setStudioMode(mode.id)} style={{ flex: 1, minWidth: '150px', padding: '20px', background: studioMode === mode.id ? 'linear-gradient(135deg, #9333ea, #ec4899)' : 'rgba(30, 20, 50, 0.8)', border: 'none', borderRadius: '15px', color: 'white', cursor: 'pointer' }}>
                  <div style={{ fontSize: '28px', marginBottom: '5px' }}>{mode.icon}</div>
                  <div style={{ fontWeight: 'bold' }}>{mode.label}</div>
                </button>
              ))}
            </div>
            <div style={{ background: 'rgba(30, 20, 50, 0.8)', borderRadius: '15px', padding: '30px', textAlign: 'center' }}>
              <button onClick={() => setIsRecording(!isRecording)} style={{ width: '80px', height: '80px', borderRadius: '50%', background: isRecording ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #9333ea, #ec4899)', border: 'none', cursor: 'pointer', fontSize: '32px' }}>
                {isRecording ? '⏹️' : '🎤'}
              </button>
              <p style={{ marginTop: '15px', color: '#888' }}>{isRecording ? '🔴 Recording...' : 'Click to start recording'}</p>
            </div>
          </div>
        )}

        {activeTab === 'beatmaker' && (
          <div style={styles.section}>
            <h2 style={styles.title}>🥁 AI Beatmaker</h2>
            <p style={styles.subtitle}>Describe your beat and let AI create it</p>
            <textarea placeholder="Describe your beat... e.g., 'hard trap beat with 808s and fast hi-hats'" value={beatPrompt} onChange={(e) => setBeatPrompt(e.target.value)} style={styles.textarea} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '20px 0' }}>
              {['Trap', 'Boom Bap', 'R&B', 'Lo-Fi', 'Drill', 'Gospel'].map(style => (
                <button key={style} onClick={() => setBeatPrompt(style.toLowerCase() + ' beat')} style={styles.button
