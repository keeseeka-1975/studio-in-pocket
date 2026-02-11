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

// add near your component state
const beatIntervalRef = useRef(null);

const playBeat = () => {
  // stop if already playing
  if (isPlayingBeat) {
    setIsPlayingBeat(false);
    if (beatIntervalRef.current) {
      clearInterval(beatIntervalRef.current);
      beatIntervalRef.current = null;
    }
    return;
  }

  // start playing
  setIsPlayingBeat(true);
  let step = 0;
  const stepMs = (60 / bpm) * 250; // 16th-note step duration

  beatIntervalRef.current = setInterval(() => {
    Object.keys(drumPattern).forEach((drum) => {
      if (drumPattern[drum]?.[step]) {
        playSound(drum);
      }
    });
    step = (step + 1) % 16;
  }, stepMs);
};

// optional: stop automatically after 10 seconds
useEffect(() => {
  if (!isPlayingBeat) return;
  const t = setTimeout(() => {
    if (beatIntervalRef.current) {
      clearInterval(beatIntervalRef.current);
      beatIntervalRef.current = null;
    }
    setIsPlayingBeat(false);
  }, 10000);
  return () => clearTimeout(t);
}, [isPlayingBeat]);
