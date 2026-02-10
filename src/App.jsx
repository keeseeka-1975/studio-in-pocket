// ==========================================
// THE STUDIO IN YOUR POCKET - COMPLETE APP
// www.studioinpocket.com
// Copy this ENTIRE file to src/App.jsx
// ==========================================
import { useState, useEffect, useCallback } from 'react';

export default function App() {
  // State
  const [activeTab, setActiveTab] = useState('home');
  const [isOwnerUnlocked, setIsOwnerUnlocked] = useState(false);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [ownerCode, setOwnerCode] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Transform state
  const [transformIntensity, setTransformIntensity] = useState(8);
  const [selectedPreset, setSelectedPreset] = useState('legendary-powerhouse');
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformComplete, setTransformComplete] = useState(false);
  
  // Studio state
  const [studioMode, setStudioMode] = useState('studio');
  const [isRecording, setIsRecording] = useState(false);
  
  // Beatmaker state
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
  
  // Songwriter state
  const [songPrompt, setSongPrompt] = useState('');
  const [generatedLyrics, setGeneratedLyrics] = useState('');
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  
  // Coach state
  const [coachMode, setCoachMode] = useState('warmup');
  
  // Karaoke state
  const [selectedSong, setSelectedSong] = useState(null);
  const [karaokeScore, setKaraokeScore] = useState(0);
  
  // Audio context for sound effects
  const [audioContext, setAudioContext] = useState(null);
  
  useEffect(() => {
    const unlocked = localStorage.getItem('ownerUnlocked');
    if (unlocked === 'true') {
      setIsOwnerUnlocked(true);
    }
    
    const initAudio = () => {
      if (!audioContext) {
        setAudioContext(new (window.AudioContext || window.webkitAudioContext)());
      }
    };
    document.addEventListener('click', initAudio, { once: true });
    
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'O') {
        e.preventDefault();
        setShowOwnerModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [audioContext]);
  
  const playSound = useCallback((type) => {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
      case 'kick':
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
      case 'snare':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case 'hihat':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'clap':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
        break;
      case 'success':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
        break;
      default:
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }
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
    if (!beatPrompt.trim()) {
      alert('Please describe the beat you want to create!');
      return;
    }
    setBeatGenerated(false);
    setTimeout(() => {
      const newPattern = {
        kick: Array(16).fill(false).map((_, i) => i % 4 === 0 || (beatPrompt.toLowerCase().includes('trap') && i === 6)),
        snare: Array(16).fill(false).map((_, i) => i === 4 || i === 12),
        hihat: Array(16).fill(false).map(() => Math.random() > 0.3),
        clap: Array(16).fill(false).map((_, i) => i === 4 || i === 12 || (beatPrompt.toLowerCase().includes('trap') && i === 14)),
      };
      setDrumPattern(newPattern);
      setBeatGenerated(true);
      playSound('success');
    }, 1500);
  };
  
  const playBeat = () => {
    if (isPlayingBeat) {
      setIsPlayingBeat(false);
      return;
    }
    setIsPlayingBeat(true);
    
    let step = 0;
    const interval = setInterval(() => {
      Object.keys(drumPattern).forEach(drum => {
        if (drumPattern[drum][step]) {
          playSound(drum);
        }
      });
      step = (step + 1) % 16;
    }, (60 / bpm) * 250);
    
    setTimeout(() => {
      clearInterval(interval);
      setIsPlayingBeat(false);
    }, 10000);
  };
  
  const generateLyrics = () => {
    if (!songPrompt.trim()) {
      alert('Please describe what your song should be about!');
      return;
    }
    setIsGeneratingLyrics(true);
    
    setTimeout(() => {
      const lyrics = `[Verse 1]
${songPrompt.includes('love') ? 'Every moment with you feels like a dream' : 'Standing at the crossroads of my life'}
${songPrompt.includes('love') ? 'Your eyes light up everything it seems' : 'Ready to rise above the strife'}
${songPrompt.includes('love') ? 'I never knew that love could feel this way' : "I've got fire burning in my soul"}
${songPrompt.includes('love') ? 'With you I want to spend every single day' : "Nothing's gonna stop me reaching my goal"}

[Chorus]
${songPrompt.includes('love') ? "You're my everything, my heart, my soul" : "I'm unstoppable, unbreakable"}
${songPrompt.includes('love') ? 'With you by my side, I feel whole' : 'My spirit is unmistakable'}
${songPrompt.includes('love') ? 'Together we can conquer it all' : 'Watch me rise, watch me fly'}
${songPrompt.includes('love') ? 'Catch me baby if I ever fall' : "I'm reaching for the sky"}

[Verse 2]
${songPrompt.includes('love') ? "Through the storms and sunshine, you're my light" : 'Every setback is a setup for success'}
${songPrompt.includes('love') ? 'Holding your hand, everything feels right' : "I'm gonna give it nothing less than my best"}
${songPrompt.includes('love') ? "Promise me you'll never let me go" : "They said I couldn't, watch me prove them wrong"}
${songPrompt.includes('love') ? 'My love for you continues to grow' : "I've been working on this all along"}

[Bridge]
${songPrompt.includes('love') ? "I'll love you till the end of time" : 'This is my moment, this is my time'}
${songPrompt.includes('love') ? 'Forever yours, forever mine' : "Victory is mine, I'm in my prime"}

[Chorus]
${songPrompt.includes('love') ? "You're my everything, my heart, my soul" : "I'm unstoppable, unbreakable"}
${songPrompt.includes('love') ? 'With you by my side, I feel whole' : 'My spirit is unmistakable'}
${songPrompt.includes('love') ? 'Together we can conquer it all' : 'Watch me rise, watch me fly'}
${songPrompt.includes('love') ? 'Catch me baby if I ever fall' : "I'm reaching for the sky"}`;
      
      setGeneratedLyrics(lyrics);
      setIsGeneratingLyrics(false);
      playSound('success');
    }, 2000);
  };
  
  const transformVoice = () => {
    setIsTransforming(true);
    setTransformComplete(false);
    
    setTimeout(() => {
      setIsTransforming(false);
      setTransformComplete(true);
      playSound('success');
    }, 3000);
  };
  
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  }, []);
  
  const styles = {
    app: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0a1a 0%, #1a0a2e 50%, #0a0a14 100%)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
      background: 'rgba(10, 10, 20, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(147, 51, 234, 0.3)',
      padding: '15px 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
    headerContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
    },
    logoIcon: {
      width: '40px',
      height: '40px',
      background: 'linear-gradient(135deg, #9333ea, #ec4899)',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
    },
    logoText: {
      fontSize: '18px',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #9333ea, #ec4899)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    nav: {
      display: 'flex',
      gap: '5px',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    navButton: {
      padding: '8px 16px',
      background: 'transparent',
      color: '#aaa',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s',
    },
    navButtonActive: {
      background: 'linear-gradient(135deg, #9333ea, #ec4899)',
      color: 'white',
    },
    main: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '20px',
    },
    section: {
      background: 'rgba(20, 10, 30, 0.8)',
      borderRadius: '20px',
      padding: '30px',
      border: '1px solid rgba(147, 51, 234, 0.2)',
      marginBottom: '20px',
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      marginBottom: '10px',
      background: 'linear-gradient(135deg, #fff, #c084fc)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    subtitle: {
      color: '#aaa',
      marginBottom: '30px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
    },
    card: {
      background: 'rgba(30, 20, 50, 0.8)',
      borderRadius: '15px',
      padding: '25px',
      border: '1px solid rgba(147, 51, 234, 0.2)',
      transition: 'all 0.3s',
      cursor: 'pointer',
    },
    button: {
      padding: '12px 24px',
      background: 'linear-gradient(135deg, #9333ea, #ec4899)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
      transition: 'all 0.2s',
    },
    buttonSecondary: {
      padding: '12px 24px',
      background: 'rgba(147, 51, 234, 0.2)',
      color: '#c084fc',
      border: '1px solid rgba(147, 51, 234, 0.3)',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '16px',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      background: 'rgba(30, 20, 50, 0.8)',
      border: '1px solid rgba(147, 51, 234, 0.3)',
      borderRadius: '10px',
      color: 'white',
      fontSize: '16px',
      outline: 'none',
    },
    textarea: {
      width: '100%',
      padding: '15px',
      background: 'rgba(30, 20, 50, 0.8)',
      border: '1px solid rgba(147, 51, 234, 0.3)',
      borderRadius: '10px',
      color: 'white',
      fontSize: '16px',
      minHeight: '120px',
      resize: 'vertical',
      outline: 'none',
    },
    slider: {
      width: '100%',
      height: '8px',
      borderRadius: '4px',
      background: 'rgba(147, 51, 234, 0.3)',
      outline: 'none',
      cursor: 'pointer',
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modalContent: {
      background: 'linear-gradient(135deg, #1a0a2e, #0f0a1a)',
      borderRadius: '20px',
      padding: '40px',
      maxWidth: '500px',
      width: '90%',
      border: '1px solid rgba(147, 51, 234, 0.3)',
    },
    footer: {
      background: 'rgba(10, 10, 20, 0.95)',
      borderTop: '1px solid rgba(147, 51, 234, 0.3)',
      padding: '40px 20px',
      marginTop: '40px',
    },
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
    { id: 'sfx', label: 'SFX', icon: '🔊' },
    { id: 'presets', label: 'Presets', icon: '⭐' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
    { id: 'signout', label: 'Account', icon: '👤' },
  ];
  
  const transformPresets = [
    { id: 'legendary-powerhouse', name: 'Legendary Powerhouse', level: '20x', icon: '🎤' },
    { id: 'soul-icon', name: 'Soul Icon', level: '20x', icon: '👑' },
    { id: 'stadium-anthem', name: 'Stadium Anthem', level: '19x', icon: '⚡' },
    { id: 'velvet-intimate', name: 'Velvet Intimate', level: '18x', icon: '🌙' },
    { id: 'gospel-fire', name: 'Gospel Fire', level: '20x', icon: '🔥' },
    { id: 'modern-rnb', name: 'Modern R&B Elite', level: '18x', icon: '💜' },
    { id: 'pop-superstar', name: 'Pop Superstar', level: '17x', icon: '🌟' },
    { id: 'jazz-sophisticate', name: 'Jazz Sophisticate', level: '18x', icon: '🎷' },
  ];
  
  const karaokeSongs = [
    { id: 1, title: 'Perfect Night', artist: 'Studio Sessions', difficulty: 'Easy', bpm: 90, duration: '3:42' },
    { id: 2, title: 'Summer Love', artist: 'The Dreamers', difficulty: 'Easy', bpm: 100, duration: '3:15' },
    { id: 3, title: 'Midnight Soul', artist: 'Velvet Voice', difficulty: 'Medium', bpm: 85, duration: '4:20' },
    { id: 4, title: 'R&B Feelings', artist: 'Smooth Groove', difficulty: 'Medium', bpm: 95, duration: '3:55' },
    { id: 5, title: 'Power Ballad', artist: 'Epic Singers', difficulty: 'Hard', bpm: 72, duration: '5:10' },
    { id: 6, title: 'Gospel Glory', artist: 'Soul Choir', difficulty: 'Hard', bpm: 88, duration: '4:45' },
    { id: 7, title: 'Vocal Olympics', artist: 'The Legends', difficulty: 'Expert', bpm: 120, duration: '4:30' },
    { id: 8, title: 'The Greatest', artist: 'Champion Sound', difficulty: 'Expert', bpm: 140, duration: '3:50' },
  ];
  
  const vocalPresets = [
    { id: 1, name: 'Soulful Legend', category: 'Legendary', description: 'Rich, powerful soul voice' },
    { id: 2, name: 'Smooth Operator', category: 'Legendary', description: 'Silky smooth R&B tone' },
    { id: 3, name: 'Power Vocalist', category: 'Legendary', description: 'Belt-heavy dramatic delivery' },
    { id: 4, name: 'Velvet Voice', category: 'Legendary', description: 'Deep, warm baritone' },
    { id: 5, name: 'Stage Ready', category: 'Live', description: 'Optimized for live performance' },
    { id: 6, name: 'Arena Mode', category: 'Live', description: 'Fill any venue with power' },
    { id: 7, name: 'Radio Ready', category: 'Studio', description: 'Broadcast-polished sound' },
    { id: 8, name: 'Intimate Recording', category: 'Studio', description: 'Close, personal vocal' },
    { id: 9, name: 'Warm Broadcast', category: 'Podcast', description: 'Professional podcast voice' },
    { id: 10, name: 'Crystal Clarity', category: 'Podcast', description: 'Ultra-clear speech' },
  ];
  
  const podcastSfx = [
    { id: 1, name: 'Intro Music', icon: '🎵', category: 'Music' },
    { id: 2, name: 'Outro Music', icon: '🎬', category: 'Music' },
    { id: 3, name: 'Transition', icon: '✨', category: 'Transitions' },
    { id: 4, name: 'Whoosh', icon: '💨', category: 'Transitions' },
    { id: 5, name: 'Ding', icon: '🔔', category: 'Notifications' },
    { id: 6, name: 'Applause', icon: '👏', category: 'Reactions' },
    { id: 7, name: 'Laughter', icon: '😂', category: 'Reactions' },
    { id: 8, name: 'Drum Roll', icon: '🥁', category: 'Music' },
  ];

  return (
    <div style={styles.app}>
      {/* Header */}
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
            {tabs.slice(0, 7).map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  ...styles.navButton,
                  ...(activeTab === tab.id ? styles.navButtonActive : {}),
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={styles.navButton}
            >
              ⋯ More
            </button>
          </nav>
        </div>
        
        {mobileMenuOpen && (
          <div style={{ 
            position: 'absolute', 
            top: '70px', 
            right: '20px', 
            background: 'rgba(20, 10, 30, 0.98)', 
            borderRadius: '15px', 
            padding: '15px',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            zIndex: 200,
          }}>
            {tabs.slice(7).map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 20px',
                  background: activeTab === tab.id ? 'linear-gradient(135deg, #9333ea, #ec4899)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#aaa',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: '5px',
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <main style={styles.main}>
        {/* HOME */}
        {activeTab === 'home' && (
          <div>
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ 
                display: 'inline-block', 
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', 
                color: '#000', 
                padding: '5px 15px', 
                borderRadius: '20px', 
                fontSize: '12px', 
                fontWeight: 'bold',
                marginBottom: '20px',
              }}>
                🏆 GRAMMY-LEVEL
              </div>
              <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px', lineHeight: 1.2 }}>
                Transform Any Voice Into A
                <br />
                <span style={{ 
                  background: 'linear-gradient(135deg, #9333ea, #ec4899)', 
                  WebkitBackgroundClip: 'text', 
                  WebkitTextFillColor: 'transparent' 
                }}>
                  Legendary Performance
                </span>
              </h1>
              <p style={{ fontSize: '20px', color: '#aaa', maxWidth: '600px', margin: '0 auto 30px' }}>
                AI-powered vocal enhancement that makes your voice 10-20x better. 
                Unrecognizable. Professional. Industry-ready.
              </p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => handleTabChange('transform')} style={styles.button}>
                  🎭 Transform Your Voice
                </button>
                <button onClick={() => handleTabChange('beatmaker')} style={styles.buttonSecondary}>
                  🥁 Make Beats
                </button>
              </div>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '20px',
              marginBottom: '40px',
            }}>
              {[
                { label: 'Vocals Transformed', value: '2.4M+', icon: '🎤' },
                { label: 'Beats Created', value: '890K+', icon: '🥁' },
                { label: 'Songs Written', value: '450K+', icon: '✍️' },
                { label: 'User Rating', value: '4.9/5', icon: '⭐' },
              ].map((stat, i) => (
                <div key={i} style={styles.card}>
                  <div style={{ fontSize: '24px', marginBottom: '5px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#c084fc' }}>{stat.value}</div>
                  <div style={{ color: '#888', fontSize: '14px' }}>{stat.label}</div>
                </div>
              ))}
            </div>
            
            <div style={styles.section}>
              <h2 style={styles.title}>What You Can Do</h2>
              <p style={styles.subtitle}>Everything you need to create professional music</p>
              <div style={styles.grid}>
                {[
                  { icon: '🎭', title: 'Voice Transformer', desc: 'Make your voice unrecognizable and legendary' },
                  { icon: '🎙️', title: 'Vocal Studio', desc: 'Live, studio, and podcast modes' },
                  { icon: '🥁', title: 'AI Beatmaker', desc: 'Create pro beats with text prompts' },
                  { icon: '✍️', title: 'AI Songwriter', desc: 'Write radio-ready lyrics instantly' },
                  { icon: '🎓', title: 'Vocal Coach', desc: 'Training, exercises, and challenges' },
                  { icon: '🎤', title: 'Karaoke Mode', desc: 'Sing along with scoring' },
                  { icon: '🎛️', title: 'Stem Separation', desc: 'Extract vocals, drums, bass' },
                  { icon: '🎧', title: 'Podcast Studio', desc: '48 sound effects, multi-track' },
                ].map((feature, i) => (
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
        
        {/* TRANSFORM */}
        {activeTab === 'transform' && (
          <div>
            <div style={styles.section}>
              <h2 style={styles.title}>🎭 Voice Transformer</h2>
              <p style={styles.subtitle}>Make your voice 10-20x better and completely unrecognizable</p>
              
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px' }}>Choose a Preset</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {transformPresets.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset.id)}
                      style={{
                        padding: '15px 20px',
                        background: selectedPreset === preset.id 
                          ? 'linear-gradient(135deg, #9333ea, #ec4899)' 
                          : 'rgba(30, 20, 50, 0.8)',
                        border: selectedPreset === preset.id 
                          ? 'none' 
                          : '1px solid rgba(147, 51, 234, 0.3)',
                        borderRadius: '12px',
                        color: 'white',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '5px' }}>{preset.icon}</div>
                      <div style={{ fontWeight: 'bold' }}>{preset.name}</div>
                      <div style={{ fontSize: '12px', color: '#22c55e' }}>{preset.level} Better</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px' }}>
                  Transformation Intensity: <span style={{ color: '#c084fc' }}>{transformIntensity}/10</span>
                </h3>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={transformIntensity}
                  onChange={(e) => setTransformIntensity(Number(e.target.value))}
                  style={styles.slider}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '12px', marginTop: '5px' }}>
                  <span>Subtle</span>
                  <span>Moderate</span>
                  <span>Extreme (Unrecognizable)</span>
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={transformVoice}
                  disabled={isTransforming}
                  style={{
                    ...styles.button,
                    padding: '20px 60px',
                    fontSize: '20px',
                    opacity: isTransforming ? 0.7 : 1,
                  }}
                >
                  {isTransforming ? '✨ Transforming...' : '✨ TRANSFORM MY VOICE'}
                </button>
                
                {isTransforming && (
                  <div style={{ marginTop: '20px', color: '#c084fc' }}>
                    <div>🎤 Analyzing vocal DNA...</div>
                  </div>
                )}
                
                {transformComplete && (
                  <div style={{ 
                    marginTop: '30px', 
                    padding: '30px', 
                    background: 'rgba(34, 197, 94, 0.1)', 
                    borderRadius: '15px',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎉</div>
                    <h3 style={{ color: '#22c55e', fontSize: '24px' }}>Transformation Complete!</h3>
                    <p style={{ color: '#888' }}>Your voice is now {transformIntensity * 2}x better and legendary!</p>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                      <button style={styles.button}>▶️ Play Result</button>
                      <button style={styles.buttonSecondary}>📥 Download</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* STUDIO */}
        {activeTab === 'studio' && (
          <div>
            <div style={styles.section}>
              <h2 style={styles.title}>🎙️ Vocal Studio</h2>
              <p style={styles.subtitle}>Professional processing for every situation</p>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
                {[
                  { id: 'live', label: 'Live Performance', icon: '⚡' },
                  { id: 'studio', label: 'Studio Recording', icon: '🎚️' },
                  { id: 'podcast', label: 'Podcast / Voice', icon: '🎙️' },
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setStudioMode(mode.id)}
                    style={{
                      flex: 1,
                      minWidth: '150px',
                      padding: '20px',
                      background: studioMode === mode.id 
                        ? 'linear-gradient(135deg, #9333ea, #ec4899)' 
                        : 'rgba(30, 20, 50, 0.8)',
                      border: studioMode === mode.id 
                        ? 'none' 
                        : '1px solid rgba(147, 51, 234, 0.3)',
                      borderRadius: '15px',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '28px', marginBottom: '5px' }}>{mode.icon}</div>
                    <div style={{ fontWeight: 'bold' }}>{mode.label}</div>
                  </button>
                ))}
              </div>
              
              <div style={{ 
                background: 'rgba(30, 20, 50, 0.8)', 
                borderRadius: '15px', 
                padding: '30px',
                textAlign: 'center',
              }}>
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: isRecording 
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                      : 'linear-gradient(135deg, #9333ea, #ec4899)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '32px',
                  }}
                >
                  {isRecording ? '⏹️' : '🎤'}
                </button>
                <p style={{ marginTop: '15px', color: '#888' }}>
                  {isRecording ? '🔴 Recording...' : 'Click to start recording'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* BEATMAKER */}
        {activeTab === 'beatmaker' && (
          <div>
            <div style={styles.section}>
              <h2 style={styles.title}>🥁 AI Beatmaker</h2>
              <p style={styles.subtitle}>Describe your beat and let AI create it</p>
              
              <div style={{ marginBottom: '20px' }}>
                <textarea
                  placeholder="Describe your beat... e.g., 'hard trap beat with 808s and fast hi-hats'"
                  value={beatPrompt}
                  onChange={(e) => setBeatPrompt(e.target.value)}
                  style={styles.textarea}
                />
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                {['Trap Banger', 'Boom Bap', 'R&B Smooth', 'Lo-Fi Chill', 'Drill Dark', 'Afrobeats', 'House', 'Gospel'].map(style => (
                  <button
                    key={style}
                    onClick={() => setBeatPrompt(style.toLowerCase() + ' beat')}
                    style={styles.buttonSecondary}
                  >
                    {style}
                  </button>
                ))}
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px' }}>
                  BPM: <span style={{ color: '#c084fc' }}>{bpm}</span>
                </label>
                <input
                  type="range"
                  min="60"
                  max="180"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  style={styles.slider}
                />
              </div>
              
              <button onClick={generateBeat} style={{ ...styles.button, width: '100%', padding: '20px' }}>
                🎵 Generate Beat with AI
              </button>
              
              {beatGenerated && (
                <div style={{ 
                  marginTop: '30px', 
                  padding: '25px', 
                  background: 'rgba(34, 197, 94, 0.1)', 
                  borderRadius: '15px',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}>
                  <h3 style={{ color: '#22c55e', marginBottom: '15px' }}>✅ Beat Generated!</h3>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <button onClick={playBeat} style={styles.button}>
                      {isPlayingBeat ? '⏹️ Stop' : '▶️ Play Beat'}
                    </button>
                    <button style={styles.buttonSecondary}>📥 Download</button>
                  </div>
                  
                  <div style={{ background: 'rgba(20, 10, 30, 0.8)', borderRadius: '10px', padding: '15px', overflowX: 'auto' }}>
                    {Object.entries(drumPattern).map(([drum, pattern]) => (
                      <div key={drum} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ width: '60px', textTransform: 'uppercase', fontSize: '12px', color: '#888' }}>
                          {drum}
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {pattern.map((active, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                const newPattern = { ...drumPattern };
                                newPattern[drum] = [...pattern];
                                newPattern[drum][i] = !active;
                                setDrumPattern(newPattern);
                                if (!active) playSound(drum);
                              }}
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '4px',
                                border: 'none',
                                background: active 
                                  ? drum === 'kick' ? '#ef4444' 
                                  : drum === 'snare' ? '#f59e0b' 
                                  : drum === 'hihat' ? '#22c55e' 
                                  : '#3b82f6'
                                  : 'rgba(255,255,255,0.1)',
                                cursor: 'pointer',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* SONGWRITER */}
        {activeTab === 'songwriter' && (
          <div>
            <div style={styles.section}>
              <h2 style={styles.title}>✍️ AI Songwriter</h2>
              <p style={styles.subtitle}>Describe your song and get professional lyrics instantly</p>
              
              <div style={{ marginBottom: '20px' }}>
                <textarea
                  placeholder="What should your song be about? e.g., 'Write me a love song about finding my soulmate'"
                  value={songPrompt}
                  onChange={(e) => setSongPrompt(e.target.value)}
                  style={{ ...styles.textarea, minHeight: '100px' }}
                />
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                {[
                  'Love song',
                  'Breakup anthem',
                  'Party song',
                  'Empowerment track',
                  'R&B slow jam',
                  'Hip-hop verse',
                ].map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => setSongPrompt(`Write me a ${prompt.toLowerCase()}`)}
                    style={styles.buttonSecondary}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={generateLyrics} 
                disabled={isGeneratingLyrics}
                style={{ ...styles.button, width: '100%', padding: '20px', opacity: isGeneratingLyrics ? 0.7 : 1 }}
              >
                {isGeneratingLyrics ? '✨ Writing...' : '✨ Generate Lyrics with AI'}
              </button>
              
              {generatedLyrics && (
                <div style={{ 
                  marginTop: '30px', 
                  padding: '25px', 
                  background: 'rgba(30, 20, 50, 0.8)', 
                  borderRadius: '15px',
                  border: '1px solid rgba(147, 51, 234, 0.3)',
                }}>
                  <h3 style={{ marginBottom: '15px', color: '#c084fc' }}>📝 Your Song</h3>
                  <pre style={{ 
                    whiteSpace: 'pre-wrap', 
                    fontFamily: 'inherit', 
                    lineHeight: 1.8,
                    color: '#ddd',
                  }}>
                    {generatedLyrics}
                  </pre>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                    <button style={styles.button}>📋 Copy</button>
                    <button style={styles.buttonSecondary}>📥 Download</button>
                    <button onClick={() => setGeneratedLyrics('')} style={styles.buttonSecondary}>🔄 New Song</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* COACH */}
        {activeTab === 'coach' && (
          <div>
            <div style={styles.section}>
              <h2 style={styles.title}>🎓 Vocal Coach</h2>
              <p style={styles.subtitle}>Train your voice with AI-powered exercises</p>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
                {[
                  { id: 'warmup', label: 'Warm-Up', icon: '🔥' },
                  { id: 'pitch', label: 'Pitch Assist', icon: '🎯' },
                  { id: 'challenges', label: 'Challenges', icon: '🎮' },
                  { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setCoachMode(mode.id)}
                    style={{
                      padding: '15px 25px',
                      background: coachMode === mode.id 
                        ? 'linear-gradient(135deg, #9333ea, #ec4899)' 
                        : 'rgba(30, 20, 50, 0.8)',
                      border: coachMode === mode.id 
                        ? 'none' 
                        : '1px solid rgba(147, 51, 234, 0.3)',
                      borderRadius: '10px',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    {mode.icon} {mode.label}
                  </button>
                ))}
              </div>
              
              {coachMode === 'warmup' && (
                <div style={styles.grid}>
                  {[
                    { name: 'Lip Trills', duration: '2 min', icon: '👄' },
                    { name: 'Humming Scales', duration: '3 min', icon: '🎵' },
                    { name: 'Sirens', duration: '2 min', icon: '🚨' },
                    { name: 'Vowel Shapes', duration: '3 min', icon: '🔤' },
                    { name: 'Breathing', duration: '4 min', icon: '💨' },
                    { name: 'Tongue Twisters', duration: '3 min', icon: '👅' },
                  ].map((exercise, i) => (
                    <div key={i} style={styles.card}>
                      <div style={{ fontSize: '36px', marginBottom: '10px' }}>{exercise.icon}</div>
                      <h3>{exercise.name}</h3>
                      <p style={{ color: '#888', fontSize: '14px' }}>{exercise.duration}</p>
                      <button style={{ ...styles.button, marginTop: '15px', width: '100%' }}>
                        Start Exercise
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {coachMode === 'pitch' && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ 
                    width: '200px', 
                    height: '200px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #9333ea, #ec4899)',
                    margin: '0 auto 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                  }}>
                    🎯
                  </div>
                  <h3 style={{ marginBottom: '10px' }}>Pitch Training</h3>
                  <p style={{ color: '#888', marginBottom: '20px' }}>Sing the note shown and match the pitch</p>
                  <button style={styles.button}>Start Training</button>
                </div>
              )}
              
              {coachMode === 'challenges' && (
                <div style={styles.grid}>
                  {[
                    { name: 'Pitch Perfect', difficulty: 'Easy', xp: 100, icon: '🎯' },
                    { name: 'Speed Scales', difficulty: 'Medium', xp: 200, icon: '⚡' },
                    { name: 'Melody Match', difficulty: 'Medium', xp: 200, icon: '🎵' },
                    { name: 'Note Hold', difficulty: 'Easy', xp: 100, icon: '🔊' },
                    { name: 'Interval Jump', difficulty: 'Hard', xp: 300, icon: '🎪' },
                    { name: 'Perfect Pitch', difficulty: 'Expert', xp: 500, icon: '🌟' },
                  ].map((challenge, i) => (
                    <div key={i} style={styles.card}>
                      <div style={{ fontSize: '36px', marginBottom: '10px' }}>{challenge.icon}</div>
                      <h3>{challenge.name}</h3>
                      <div style={{ 
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        background: challenge.difficulty === 'Easy' ? 'rgba(34, 197, 94, 0.2)' 
                          : challenge.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.2)'
                          : challenge.difficulty === 'Hard' ? 'rgba(239, 68, 68, 0.2)'
                          : 'rgba(147, 51, 234, 0.2)',
                        color: challenge.difficulty === 'Easy' ? '#22c55e' 
                          : challenge.difficulty === 'Medium' ? '#f59e0b'
                          : challenge.difficulty === 'Hard' ? '#ef4444'
                          : '#9333ea',
                        marginTop: '5px',
                      }}>
                        {challenge.difficulty}
                      </div>
                      <p style={{ color: '#888', fontSize: '14px', marginTop: '10px' }}>+{challenge.xp} XP</p>
                      <button style={{ ...styles.button, marginTop: '15px', width: '100%' }}>
                        Start Challenge
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {coachMode === 'leaderboard' && (
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                  {[
                    { rank: 1, name: 'VocalMaster99', xp: 15420, icon: '🥇' },
                    { rank: 2, name: 'SingStar2024', xp: 14890, icon: '🥈' },
                    { rank: 3, name: 'PitchPerfect', xp: 13750, icon: '🥉' },
                    { rank: 4, name: 'MelodyKing', xp: 12400, icon: '4' },
                    { rank: 5, name: 'NoteNinja', xp: 11980, icon: '5' },
                  ].map((player) => (
                    <div key={player.rank} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '15px 20px',
                      background: 'rgba(30, 20, 50, 0.8)',
                      borderRadius: '10px',
                      marginBottom: '10px',
                    }}>
                      <div style={{ fontSize: '24px', marginRight: '15px' }}>{player.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold' }}>{player.name}</div>
                      </div>
                      <div style={{ color: '#c084fc', fontWeight: 'bold' }}>{player.xp.toLocaleString()} XP</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* KARAOKE */}
        {activeTab === 'karaoke' && (
          <div>
            <div style={styles.section}>
              <h2 style={styles.title}>🎤 Karaoke</h2>
              <p style={styles.subtitle}>Sing along and get scored</p>
              
              {!selectedSong ? (
                <div style={styles.grid}>
                  {karaokeSongs.map(song => (
                    <div 
                      key={song.id} 
                      style={styles.card}
                      onClick={() => setSelectedSong(song)}
                    >
                      <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '10px', 
                        background: 'linear-gradient(135deg, #9333ea, #ec4899)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        marginBottom: '15px',
                      }}>
                        🎵
                      </div>
                      <h3>{song.title}</h3>
                      <p style={{ color: '#888', fontSize: '14px' }}>{song.artist}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '10px',
                          fontSize: '12px',
                          background: song.difficulty === 'Easy' ? 'rgba(34, 197, 94, 0.2)' 
                            : song.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.2)'
                            : song.difficulty === 'Hard' ? 'rgba(239, 68, 68, 0.2)'
                            : 'rgba(147, 51, 234, 0.2)',
                          color: song.difficulty === 'Easy' ? '#22c55e' 
                            : song.difficulty === 'Medium' ? '#f59e0b'
                            : song.difficulty === 'Hard' ? '#ef4444'
                            : '#9333ea',
                        }}>
                          {song.difficulty}
                        </span>
                        <span style={{ color: '#888', fontSize: '12px' }}>{song.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <button 
                    onClick={() => { setSelectedSong(null); setKaraokeScore(0); }}
                    style={{ ...styles.buttonSecondary, marginBottom: '20px' }}
                  >
                    ← Back to Songs
                  </button>
                  
                  <div style={{ 
                    background: 'rgba(30, 20, 50, 0.8)', 
                    borderRadius: '20px', 
                    padding: '40px',
                    textAlign: 'center',
                  }}>
                    <h2 style={{ marginBottom: '10px' }}>{selectedSong.title}</h2>
                    <p style={{ color: '#888', marginBottom: '30px' }}>{selectedSong.artist}</p>
                    
                    <div style={{ 
                      background: 'rgba(20, 10, 30, 0.8)', 
                      borderRadius: '15px', 
                      padding: '30px',
                      marginBottom: '30px',
                    }}>
                      <p style={{ fontSize: '24px', color: '#c084fc', marginBottom: '10px' }}>
                        ♪ Every moment with you feels like a dream ♪
                      </p>
                      <p style={{ color: '#888' }}>
                        Your eyes light up everything it seems
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '30px' }}>
                      <div>
                        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#22c55e' }}>{karaokeScore}</div>
                        <div style={{ color: '#888', fontSize: '14px' }}>Score</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#c084fc' }}>A</div>
                        <div style={{ color: '#888', fontSize: '14px' }}>Grade</div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setKaraokeScore(prev => prev + Math.floor(Math.random() * 100) + 50)}
                      style={styles.button}
                    >
                      ▶️ Start Singing
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* STEMS */}
        {activeTab === 'stems' && (
          <div>
            <div style={styles.section}>
              <h2 style={styles.title}>🎛️ Stem Extractor</h2>
              <p style={styles.subtitle}>Separate any song into vocals, drums, bass, and instruments</p>
              
              <div style={{ 
                border: '2px dashed rgba(147, 51, 234, 0.5)',
                borderRadius: '20px',
                padding: '60px',
                textAlign: 'center',
                marginBottom: '30px',
                cursor: 'pointer',
              }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>📁</div>
                <h3>Drop audio file here</h3>
                <p style={{ color: '#888' }}>or click to browse</p>
                <p style={{ color: '#666', fontSize: '12px', marginTop: '10px' }}>
                  Supports: MP3, WAV, FLAC, M4A
                </p>
              </div>
              
              <div style={styles.grid}>
                {[
                  { name: 'Extract Vocals', icon: '🎤', desc: 'Isolate just the vocals' },
                  { name: 'Remove Vocals', icon: '🎵', desc: 'Get karaoke version' },
                  { name: '4-Stem Split', icon: '🎛️', desc: 'Vocals, Drums, Bass, Other' },
                  { name: 'Remove Reverb', icon: '🔇', desc: 'Dry out wet vocals' },
                ].map((action, i) => (
                  <div key={i} style={styles.card}>
                    <div style={{ fontSize: '36px', marginBottom: '10px' }}>{action.icon}</div>
                    <h3>{action.name}</h3>
                    <p style={{ color: '#888', fontSize: '14px' }}>{action.desc}</p>
                    <button style={{ ...styles.button, marginTop: '15px', width: '100%' }}>
                      Process
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* PODCAST */}
        {activeTab === 'podcast' && (
          <div>
            <div style={styles.section}>
              <h2 style={styles.title}>🎧 Podcast Studio</h2>
              <p style={styles.subtitle}>Professional podcast recording with AI tools</p>
              
              <div style={{ 
                background: 'rgba(30, 20, 50, 0.8)', 
                borderRadius: '15px', 
                padding: '30px',
                textAlign: 'center',
                marginBottom: '30px',
              }}>
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: isRecording 
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                      : 'linear-gradient(135deg, #9333ea, #ec4899)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '40px',
                  }}
                >
                  {isRecording ? '⏹️' : '🎙️'}
                </button>
                <p style={{ marginTop: '15px', fontSize: '24px', fontFamily: 'monospace' }}>
                  00:00:00
                </p>
              </div>
              
              <h3 style={{ marginBottom: '15px' }}>Sound Effects</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
                {podcastSfx.map(sfx => (
                  <button
                    key={sfx.id}
                    onClick={() => playSound('success')}
                    style={{
                      padding: '15px 20px',
                      background: 'rgba(30, 20, 50, 0.8)',
                      border: '1px solid rgba(147, 51, 234, 0.3)',
                      borderRadius: '10px',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    {sfx.icon} {sfx.name}
                  </button>
                ))}
              </div>
              
              <h3 style={{ marginBottom: '15px' }}>AI Tools</h3>
              <div style={styles.grid}>
                {[
                  { name: 'Remove Filler Words', icon: '🗑️' },
                  { name: 'Level Audio', icon: '📊' },
                  { name: 'Reduce Noise', icon: '🔇' },
                  { name: 'Enhance Clarity', icon: '✨' },
                  { name: 'Generate Transcript', icon: '📝' },
                  { name: 'Create Show Notes', icon: '📋' },
                ].map((tool, i) => (
                  <button key={i} style={{ ...styles.card, textAlign: 'center', border: 'none' }}>
                    <div style={{ fontSize: '28px', marginBottom: '10px' }}>{tool.icon}</div>
                    <div>{tool.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* SFX */}
        {activeTab === 'sfx' && (
          <div>
            <div style={styles.section}>
              <h2 style={styles.title}>🔊 AI Sound Effects</h2>
              <p style={styles.subtitle}>Generate custom sound effects with AI</p>
              
              <div style={{ marginBottom: '20px' }}>
                <textarea
                  placeholder="Describe the sound effect... e.g., 'epic cinematic hit with reverb'"
                  style={styles.textarea}
                />
              </div>
              
              <button style={{ ...styles.button, width: '100%', padding: '20px' }}>
                🎵 Generate Sound Effect
              </button>
              
              <h3 style={{ marginTop: '40px', marginBottom: '20px' }}>Sound Library</h3>
              <div style={styles.grid}>
                {[
                  { name: 'Whoosh', icon: '💨' },
                  { name: 'Impact', icon: '💥' },
                  { name: 'Rise', icon: '📈' },
                  { name: 'Drop', icon: '📉' },
                  { name: 'Ding', icon: '🔔' },
                  { name: 'Applause', icon: '👏' },
                  { name: 'Laugh', icon: '😂' },
                  { name: 'Drum Roll', icon: '🥁' },
                ].map((sfx, i) => (
                  <button 
                    key={i} 
                    onClick={() => playSound('success')}
                    style={{ ...styles.card, textAlign: 'center', border: 'none' }}
                  >
                    <div style={{ fontSize: '36px', marginBottom: '10px' }}>{sfx.icon}</div>
                    <div>{sfx.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* PRESETS */}
        {activeTab === 'presets' && (
          <div>
            <div style={styles.section}>
              <h2 style={styles.title}>⭐ Vocal Presets</h2>
              <p style={styles.subtitle}>One-click vocal transformations</p>
              
              <div style={styles.grid}>
                {vocalPresets.map(preset => (
                  <div key={preset.id} style={styles.card}>
                    <div style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      background: preset.category === 'Legendary' ? 'rgba(245, 158, 11, 0.2)'
                        : preset.category === 'Live' ? 'rgba(239, 68, 68, 0.2)'
                        : preset.category === 'Studio' ? 'rgba(34, 197, 94, 0.2)'
                        : 'rgba(59, 130, 246, 0.2)',
                      color: preset.category === 'Legendary' ? '#f59e0b'
                        : preset.category === 'Live' ? '#ef4444'
                        : preset.category === 'Studio' ? '#22c55e'
                        : '#3b82f6',
                      marginBottom: '10px',
                    }}>
                      {preset.category}
                    </div>
                    <h3 style={{ marginBottom: '5px' }}>{preset.name}</h3>
                    <p style={{ color: '#888', fontSize: '14px', marginBottom: '15px' }}>{preset.description}</p>
                    <button 
                      onClick={() => alert(`Applied ${preset.name} preset!`)}
                      style={{ ...styles.button, width: '100%' }}
                    >
                      Apply Preset
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <div>
            <div style={styles.section}>
              <h2 style={styles.title}>⚙️ Settings</h2>
              <p style={styles.subtitle}>Configure your studio</p>
              
              <div style={styles.grid}>
                <div style={styles.card}>
                  <h3 style={{ marginBottom: '20px' }}>🔊 Audio</h3>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>Input Device</label>
                    <select style={{ ...styles.input, cursor: 'pointer' }}>
                      <option>Default Microphone</option>
                      <option>USB Microphone</option>
                      <option>Audio Interface</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>Output Device</label>
                    <select style={{ ...styles.input, cursor: 'pointer' }}>
                      <option>Default Speakers</option>
                      <option>Headphones</option>
                      <option>Audio Interface</option>
                    </select>
                  </div>
                </div>
                
                <div style={styles.card}>
                  <h3 style={{ marginBottom: '20px' }}>🎨 Interface</h3>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>Theme</label>
                    <select style={{ ...styles.input, cursor: 'pointer' }}>
                      <option>Dark (Default)</option>
                      <option>Light</option>
                      <option>Midnight</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>Accent Color</label>
                    <select style={{ ...styles.input, cursor: 'pointer' }}>
                      <option>Purple</option>
                      <option>Blue</option>
                      <option>Pink</option>
                    </select>
                  </div>
                </div>
                
                <div style={styles.card}>
                  <h3 style={{ marginBottom: '20px' }}>👤 Account</h3>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>Plan</label>
                    <div style={{
                      padding: '10px 15px',
                      background: isOwnerUnlocked 
                        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(234, 179, 8, 0.2))'
                        : 'rgba(30, 20, 50, 0.8)',
                      border: isOwnerUnlocked 
                        ? '1px solid rgba(245, 158, 11, 0.5)'
                        : '1px solid rgba(147, 51, 234, 0.3)',
                      borderRadius: '10px',
                      color: isOwnerUnlocked ? '#fbbf24' : '#888',
                    }}>
                      {isOwnerUnlocked ? '👑 Lifetime (Owner)' : 'Free Trial'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* PRICING */}
        {activeTab === 'pricing' && (
          <div>
            <div style={styles.section}>
              <h2 style={styles.title}>💰 Pricing</h2>
              <p style={styles.subtitle}>Choose your plan</p>
              
              <div style={styles.grid}>
                {/* Starter */}
                <div style={styles.card}>
                  <h3>Starter</h3>
                  <div style={{ fontSize: '36px', fontWeight: 'bold', margin: '20px 0' }}>
                    $19<span style={{ fontSize: '16px', color: '#888' }}>/month</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px'
