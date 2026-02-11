import { useState } from 'react';

type Tab = 'home' | 'studio' | 'beatmaker' | 'songwriter' | 'karaoke' | 'presets' | 'pricing' | 'coach' | 'stems' | 'podcast';

// Audio Context for sound effects
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Sound effect generator using Web Audio API
const playSound = (type: string) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  switch(type) {
    case 'intro': {
      // Epic intro - rising synth
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.5);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
      osc.start(now);
      osc.stop(now + 1);
      break;
    }
    case 'outro': {
      // Outro - descending tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 1);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
      osc.start(now);
      osc.stop(now + 1.2);
      break;
    }
    case 'transition': {
      // Swoosh transition
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(5000, now + 0.2);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.4);
      osc.frequency.setValueAtTime(150, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
      break;
    }
    case 'applause': {
      // Simulated applause using noise
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin(i / bufferSize * Math.PI);
      }
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      filter.type = 'bandpass';
      filter.frequency.value = 2000;
      filter.Q.value = 0.5;
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 2);
      source.start(now);
      break;
    }
    case 'laugh': {
      // Ha-ha-ha laugh pattern
      for (let i = 0; i < 4; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400 - i * 30, now + i * 0.15);
        osc.frequency.exponentialRampToValueAtTime(300 - i * 20, now + i * 0.15 + 0.1);
        gain.gain.setValueAtTime(0.2, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.12);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.15);
      }
      break;
    }
    case 'ding': {
      // Bell ding
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const gain2 = ctx.createGain();
      osc.connect(gain);
      osc2.connect(gain2);
      gain.connect(ctx.destination);
      gain2.connect(ctx.destination);
      osc.type = 'sine';
      osc2.type = 'sine';
      osc.frequency.value = 880;
      osc2.frequency.value = 1320;
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      gain2.gain.setValueAtTime(0.15, now);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.8);
      osc2.stop(now + 0.6);
      break;
    }
    case 'horn': {
      // Air horn
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc.frequency.value = 440;
      osc2.frequency.value = 554;
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.setValueAtTime(0.4, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.5);
      osc2.stop(now + 0.5);
      break;
    }
    case 'drum': {
      // Drum roll
      for (let i = 0; i < 16; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.value = 150;
        const time = now + i * 0.05;
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);
        osc.start(time);
        osc.stop(time + 0.05);
      }
      // Final hit
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = 80;
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }, 800);
      break;
    }
    default:
      // Default beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 440;
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
  }
};

// Play beat sound
const playBeatSound = (type: string) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  switch(type) {
    case 'kick': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    }
    case 'snare': {
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseGain.gain.setValueAtTime(0.5, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      noise.start(now);
      break;
    }
    case 'hihat': {
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 8000;
      const gain = ctx.createGain();
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      noise.start(now);
      break;
    }
  }
};

type PlanType = {
  name: string;
  price: string;
  amount: number;
} | null;

// Voice style presets (inspired by legendary artists without using their names)
const voiceStyles = [
  { id: 'soulful-diva', name: 'Soulful Diva', desc: 'Powerful, soaring vocals with rich vibrato', icon: '👑' },
  { id: 'neo-soul-queen', name: 'Neo-Soul Queen', desc: 'Smooth, jazzy, emotionally rich tone', icon: '🎷' },
  { id: 'classic-soul-king', name: 'Classic Soul King', desc: 'Deep, velvety baritone with warmth', icon: '🎩' },
  { id: 'modern-rnb-star', name: 'Modern R&B Star', desc: 'Contemporary runs and ad-libs', icon: '✨' },
  { id: 'powerhouse-belter', name: 'Powerhouse Belter', desc: 'Belt-heavy, dramatic delivery', icon: '🔥' },
  { id: 'silky-smooth', name: 'Silky Smooth', desc: 'Buttery, romantic crooner style', icon: '🌙' },
  { id: 'gospel-legend', name: 'Gospel Legend', desc: 'Church-inspired runs and power', icon: '⛪' },
  { id: 'raspy-soul', name: 'Raspy Soul', desc: 'Textured, emotional grit', icon: '🎸' },
];

// Lyric templates for AI generation
const generateLyrics = (topic: string, _genre: string, mood: string, _structure: string) => {
  const verses: { [key: string]: { verse1: string[], chorus: string[], verse2: string[], bridge: string[] } } = {
    'love-romantic': {
      verse1: [
        `Every moment with you feels like a dream,`,
        `Your eyes shine brighter than the moonlight beam,`,
        `I never knew that love could feel this way,`,
        `But here you are, you take my breath away.`
      ],
      chorus: [
        `You're my everything, my heart, my soul,`,
        `With you beside me, I feel whole,`,
        `Together we can reach the sky,`,
        `This love will never, ever die.`
      ],
      verse2: [
        `Through every storm, you hold me tight,`,
        `You are my day, you are my night,`,
        `No matter what the world may say,`,
        `I'll love you more with every day.`
      ],
      bridge: [
        `When the world gets cold and dark,`,
        `You're the fire, you're the spark,`,
        `I'll give you all I have to give,`,
        `For you, I truly want to live.`
      ]
    },
    'heartbreak-sad': {
      verse1: [
        `Empty rooms echo with your name,`,
        `Nothing here will ever be the same,`,
        `I'm holding onto fading memories,`,
        `Wishing you were still here with me.`
      ],
      chorus: [
        `Broken pieces of my heart,`,
        `Scattered since we fell apart,`,
        `I'm learning how to breathe again,`,
        `But I still feel the pain within.`
      ],
      verse2: [
        `Pictures on the wall remind me still,`,
        `Of the love we had, the void to fill,`,
        `Time moves slow when you're not here,`,
        `Fighting back another tear.`
      ],
      bridge: [
        `Maybe someday I'll be free,`,
        `From this ghost of you and me,`,
        `Until then I'll find my way,`,
        `Learning to face another day.`
      ]
    },
    'empowerment-energetic': {
      verse1: [
        `I'm standing tall, I won't back down,`,
        `Took off the weight, removed the crown,`,
        `They said I couldn't, now I'm here,`,
        `Nothing left for me to fear.`
      ],
      chorus: [
        `I'm unstoppable, I'm on fire,`,
        `Climbing higher, reaching higher,`,
        `No one's gonna hold me back,`,
        `I'm on the right track, no looking back!`
      ],
      verse2: [
        `Every scar made me this strong,`,
        `Proved them all completely wrong,`,
        `This is my time, my moment now,`,
        `I'll show the world exactly how.`
      ],
      bridge: [
        `Rise up, stand up, find your voice,`,
        `This is your life, make your choice,`,
        `Be the fire, be the light,`,
        `Own your power, own the night!`
      ]
    },
    'party-happy': {
      verse1: [
        `The beat drops and we lose control,`,
        `Tonight we're letting go of soul,`,
        `Hands up high, feel the bass,`,
        `Every worry, we erase.`
      ],
      chorus: [
        `Dance all night until the sun comes up,`,
        `Fill your heart, fill your cup,`,
        `This is our time, our moment to shine,`,
        `Everything is feeling so divine!`
      ],
      verse2: [
        `City lights are calling our name,`,
        `Nothing's ever gonna be the same,`,
        `Move your body, feel the vibe,`,
        `This is how we come alive.`
      ],
      bridge: [
        `Turn it up, don't stop the beat,`,
        `Feel the rhythm in your feet,`,
        `Tonight we're living like we're free,`,
        `This is who we're meant to be!`
      ]
    }
  };

  // Find best matching template
  let key = 'love-romantic'; // default
  const topicLower = topic.toLowerCase();
  const moodLower = mood.toLowerCase();
  
  if (topicLower.includes('heartbreak') || topicLower.includes('breakup') || moodLower === 'sad') {
    key = 'heartbreak-sad';
  } else if (topicLower.includes('power') || topicLower.includes('strong') || moodLower === 'energetic') {
    key = 'empowerment-energetic';
  } else if (topicLower.includes('party') || topicLower.includes('dance') || moodLower === 'happy') {
    key = 'party-happy';
  }

  const template = verses[key];
  
  // Customize with user's topic
  let customizedLyrics = {
    verse1: [...template.verse1],
    chorus: [...template.chorus],
    verse2: [...template.verse2],
    bridge: [...template.bridge]
  };

  // Replace generic words with topic-specific ones if topic is specific
  if (topic && topic.length > 3) {
    const words = topic.split(' ');
    if (words.length > 0) {
      // Insert topic reference into lyrics
      customizedLyrics.verse1[0] = `${topic}, it's all I think about,`;
    }
  }

  return customizedLyrics;
};

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [ownerUnlocked, setOwnerUnlocked] = useState(false);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  
  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Payment form state
  const [email, setEmail] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  // Songwriter state - Advanced ChatGPT-like interface
  const [songTopic, setSongTopic] = useState('');
  const [songGenre, setSongGenre] = useState('R&B');
  const [songMood, setSongMood] = useState('Romantic');
  const [songStructure, setSongStructure] = useState('verse-chorus');
  const [generatedLyrics, setGeneratedLyrics] = useState<{ verse1: string[], chorus: string[], verse2: string[], bridge: string[] } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Advanced AI Songwriter Chat
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', content: string, type?: string}[]>([
    { role: 'ai', content: "👋 Hey! I'm your AI Songwriting Partner. I can help you write professional, radio-ready songs from scratch. Tell me what you want to create - a love ballad, party anthem, heartbreak song, or anything else!", type: 'greeting' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [songwriterMode, setSongwriterMode] = useState<'chat' | 'structured'>('chat');
  const [currentSong, setCurrentSong] = useState<{title: string, sections: {type: string, lines: string[]}[]}>({ title: '', sections: [] });
  const [rhymeScheme, setRhymeScheme] = useState('ABAB');
  const [songKey, setSongKey] = useState('C Major');
  const [songTempo, setSongTempo] = useState('Medium');
  const [emotionalArc, setEmotionalArc] = useState('building');

  // Studio state
  const [studioMode, setStudioMode] = useState('Studio Recording');
  const [selectedVoiceStyle, setSelectedVoiceStyle] = useState<string | null>(null);
  const [voiceChangerEnabled, setVoiceChangerEnabled] = useState(false);
  const [liveCorrection, setLiveCorrection] = useState(true);

  // Vocal Coach state
  const [coachExercise, setCoachExercise] = useState('breathing');
  const [exerciseActive, setExerciseActive] = useState(false);
  const [pitchScore, setPitchScore] = useState(0);

  // Beatmaker state
  const [beatPrompt, setBeatPrompt] = useState('');
  const [beatGenre, setBeatGenre] = useState('Hip-Hop');
  const [beatBpm, setBeatBpm] = useState(120);
  const [generatedBeat, setGeneratedBeat] = useState<{name: string, bpm: number, key: string} | null>(null);
  const [isGeneratingBeat, setIsGeneratingBeat] = useState(false);

  // Karaoke state
  const [selectedSong, setSelectedSong] = useState<{title: string, artist: string, duration: string, bpm: number, difficulty: string} | null>(null);
  const [karaokeFilter, setKaraokeFilter] = useState('All');

  // Stems state
  const [stemsFile, setStemsFile] = useState<string | null>(null);
  const [stemsProcessing, setStemsProcessing] = useState(false);
  const [stemsComplete, setStemsComplete] = useState(false);

  // Podcast state
  const [podcastRecording, setPodcastRecording] = useState(false);
  const [podcastTime, setPodcastTime] = useState(0);

  // Presets state
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [presetCategory, setPresetCategory] = useState('All');

  // Karaoke song library
  const karaokeSongs = [
    { title: 'Perfect Night', artist: 'Soul Legends', duration: '3:45', bpm: 85, difficulty: 'Easy', genre: 'R&B' },
    { title: 'Summer Love', artist: 'Beach Vibes', duration: '3:22', bpm: 110, difficulty: 'Easy', genre: 'Pop' },
    { title: 'Dancing Queen', artist: 'Disco Divas', duration: '3:51', bpm: 101, difficulty: 'Easy', genre: 'Pop' },
    { title: 'Sweet Dreams', artist: 'Night Owls', duration: '4:12', bpm: 95, difficulty: 'Easy', genre: 'Pop' },
    { title: 'Island Vibes', artist: 'Caribbean Soul', duration: '3:38', bpm: 92, difficulty: 'Easy', genre: 'Reggae' },
    { title: 'Country Heart', artist: 'Nashville Stars', duration: '4:05', bpm: 88, difficulty: 'Easy', genre: 'Country' },
    { title: 'Midnight Soul', artist: 'Urban Dreams', duration: '4:22', bpm: 78, difficulty: 'Medium', genre: 'R&B' },
    { title: 'R&B Feelings', artist: 'Smooth Grooves', duration: '4:01', bpm: 82, difficulty: 'Medium', genre: 'R&B' },
    { title: 'Golden Hour', artist: 'Sunset Collective', duration: '3:55', bpm: 98, difficulty: 'Medium', genre: 'Pop' },
    { title: 'City Lights', artist: 'Metro Sound', duration: '3:48', bpm: 115, difficulty: 'Medium', genre: 'Pop' },
    { title: 'Ocean Eyes', artist: 'Blue Wave', duration: '3:32', bpm: 90, difficulty: 'Medium', genre: 'Indie' },
    { title: 'Neon Dreams', artist: 'Synth Masters', duration: '4:15', bpm: 128, difficulty: 'Medium', genre: 'Electronic' },
    { title: 'Power Ballad', artist: 'Rock Legends', duration: '5:12', bpm: 72, difficulty: 'Hard', genre: 'Rock' },
    { title: 'Gospel Glory', artist: 'Heavenly Choir', duration: '4:45', bpm: 85, difficulty: 'Hard', genre: 'Gospel' },
    { title: 'Jazz Nights', artist: 'Smooth Jazz Trio', duration: '5:30', bpm: 95, difficulty: 'Hard', genre: 'Jazz' },
    { title: 'Rock Anthem', artist: 'Stadium Kings', duration: '4:38', bpm: 140, difficulty: 'Hard', genre: 'Rock' },
    { title: 'Soul Fire', artist: 'Flame Singers', duration: '4:25', bpm: 88, difficulty: 'Hard', genre: 'Soul' },
    { title: 'Electric Love', artist: 'Voltage', duration: '3:58', bpm: 125, difficulty: 'Hard', genre: 'Electronic' },
    { title: 'Vocal Olympics', artist: 'Whitney Tribute', duration: '5:45', bpm: 92, difficulty: 'Expert', genre: 'R&B' },
    { title: 'The Greatest', artist: 'Legendary Voices', duration: '6:02', bpm: 78, difficulty: 'Expert', genre: 'Soul' },
    { title: 'Legendary', artist: 'Icon Studios', duration: '5:18', bpm: 85, difficulty: 'Expert', genre: 'R&B' },
    { title: 'Impossible Dream', artist: 'Broadway Stars', duration: '4:55', bpm: 75, difficulty: 'Expert', genre: 'Musical' },
    { title: 'Showstopper', artist: 'Diva Collection', duration: '5:32', bpm: 95, difficulty: 'Expert', genre: 'Pop' },
    { title: 'Vocal Masterpiece', artist: 'Studio Elite', duration: '6:15', bpm: 82, difficulty: 'Expert', genre: 'Soul' },
  ];

  // Preset library
  const presetLibrary = [
    { id: 'soulful-legend', name: 'Soulful Legend', category: 'Legendary', color: '#f59e0b', desc: 'Whitney-inspired power' },
    { id: 'smooth-operator', name: 'Smooth Operator', category: 'Legendary', color: '#f59e0b', desc: 'Luther-style velvet' },
    { id: 'power-vocalist', name: 'Power Vocalist', category: 'Legendary', color: '#f59e0b', desc: 'Jazmine-inspired belt' },
    { id: 'velvet-voice', name: 'Velvet Voice', category: 'Legendary', color: '#f59e0b', desc: 'Neo-soul richness' },
    { id: 'stage-ready', name: 'Stage Ready', category: 'Live', color: '#ef4444', desc: 'Concert optimization' },
    { id: 'arena-mode', name: 'Arena Mode', category: 'Live', color: '#ef4444', desc: 'Stadium presence' },
    { id: 'acoustic-live', name: 'Acoustic Live', category: 'Live', color: '#ef4444', desc: 'Intimate venue' },
    { id: 'festival-energy', name: 'Festival Energy', category: 'Live', color: '#ef4444', desc: 'High energy outdoor' },
    { id: 'radio-ready', name: 'Radio Ready', category: 'Studio', color: '#3b82f6', desc: 'Broadcast polish' },
    { id: 'intimate-recording', name: 'Intimate Recording', category: 'Studio', color: '#3b82f6', desc: 'Close-mic warmth' },
    { id: 'cinematic-vocal', name: 'Cinematic Vocal', category: 'Studio', color: '#3b82f6', desc: 'Film soundtrack' },
    { id: 'chart-topper', name: 'Chart Topper', category: 'Studio', color: '#3b82f6', desc: 'Hit song polish' },
    { id: 'warm-broadcast', name: 'Warm Broadcast', category: 'Podcast', color: '#22c55e', desc: 'Rich speech tone' },
    { id: 'crystal-clarity', name: 'Crystal Clarity', category: 'Podcast', color: '#22c55e', desc: 'Ultra-clear speech' },
    { id: 'intimate-talk', name: 'Intimate Talk', category: 'Podcast', color: '#22c55e', desc: 'ASMR-style warmth' },
    { id: 'pro-narrator', name: 'Pro Narrator', category: 'Podcast', color: '#22c55e', desc: 'Audiobook quality' },
  ];

  // Generate beat function
  const handleGenerateBeat = () => {
    if (!beatPrompt.trim()) {
      alert('Please describe the beat you want to create!');
      return;
    }
    setIsGeneratingBeat(true);
    setGeneratedBeat(null);
    
    setTimeout(() => {
      const keys = ['C Major', 'G Major', 'A Minor', 'E Minor', 'D Major', 'F Major'];
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      
      setGeneratedBeat({
        name: `AI Beat - ${beatGenre}`,
        bpm: beatBpm,
        key: randomKey
      });
      setIsGeneratingBeat(false);
    }, 2500);
  };

  // Apply preset function
  const applyPreset = (preset: typeof presetLibrary[0]) => {
    setSelectedPreset(preset.id);
    alert(`✨ Applied "${preset.name}" preset!\n\n${preset.desc}\n\nYour vocal settings have been updated.`);
  };

  // Select karaoke song
  const selectKaraokeSong = (song: typeof karaokeSongs[0]) => {
    setSelectedSong(song);
  };

  // Process stems
  const processStems = () => {
    if (!stemsFile) {
      alert('Please upload an audio file first!');
      return;
    }
    setStemsProcessing(true);
    setStemsComplete(false);
    
    setTimeout(() => {
      setStemsProcessing(false);
      setStemsComplete(true);
    }, 3000);
  };

  // Generate lyrics function
  const handleGenerateLyrics = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const lyrics = generateLyrics(songTopic, songGenre, songMood, songStructure);
      setGeneratedLyrics(lyrics);
      setIsGenerating(false);
    }, 1500);
  };

  // Start vocal exercise
  const startExercise = () => {
    setExerciseActive(true);
    setPitchScore(0);
    // Simulate pitch scoring
    const interval = setInterval(() => {
      setPitchScore(prev => {
        const newScore = prev + Math.floor(Math.random() * 15) + 5;
        if (newScore >= 100) {
          clearInterval(interval);
          setExerciseActive(false);
          return 100;
        }
        return newScore;
      });
    }, 500);
  };
  
  const openPayment = (name: string, price: string, amount: number) => {
    setSelectedPlan({ name, price, amount });
    setShowPaymentModal(true);
    setPaymentSuccess(false);
    setEmail('');
    setCardName('');
    setCardNumber('');
    setExpiry('');
    setCvc('');
  };
  
  const processPayment = () => {
    if (!email || !cardName || !cardNumber || !expiry || !cvc) {
      alert('Please fill in all fields');
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setPaymentSuccess(true);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'O') {
      setShowOwnerModal(true);
    }
  };

  const verifyOwner = () => {
    if (secretCode === 'LEGENDARY-OWNER-2024') {
      setOwnerUnlocked(true);
      setShowOwnerModal(false);
      localStorage.setItem('ownerAccess', 'true');
      alert('🎉 Welcome Owner! Lifetime access unlocked FREE!');
    } else {
      alert('Invalid code');
    }
  };

  const tabs: Tab[] = ['home', 'studio', 'beatmaker', 'songwriter', 'coach', 'karaoke', 'stems', 'podcast', 'presets', 'pricing'];

  return (
    <div 
      onKeyDown={handleKeyDown} 
      tabIndex={0}
      style={{ minHeight: '100vh', background: '#0f0a1a' }}
    >
      {/* Header */}
      <header style={{
        background: 'rgba(15, 10, 26, 0.95)',
        borderBottom: '1px solid #2d1f4a',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>🎤</div>
            <span style={{ fontWeight: 'bold', fontSize: '18px', color: 'white' }}>
              THE STUDIO
            </span>
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: activeTab === tab ? '#8b5cf6' : 'transparent',
                  color: activeTab === tab ? 'white' : '#a0a0a0',
                  fontWeight: activeTab === tab ? 'bold' : 'normal',
                  fontSize: '14px',
                  textTransform: 'capitalize',
                  border: activeTab === tab ? 'none' : '1px solid #3d2f5a',
                  transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HOME */}
        {activeTab === 'home' && (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '16px'
            }}>
              THE STUDIO IN YOUR POCKET
            </h1>
            <p style={{ fontSize: '20px', color: '#a0a0a0', marginBottom: '32px' }}>
              Sound legendary. Anywhere.
            </p>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '48px' }}>
              <button
                onClick={() => setActiveTab('studio')}
                style={{
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                🎤 Start Creating
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                style={{
                  padding: '16px 32px',
                  background: 'transparent',
                  color: 'white',
                  border: '2px solid #8b5cf6',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                View Plans
              </button>
            </div>

            {/* Stats */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
              marginBottom: '48px'
            }}>
              {[
                { value: '10-20x', label: 'Better Vocals' },
                { value: '300M+', label: 'Global Creators' },
                { value: '<5ms', label: 'Latency' },
                { value: '100+', label: 'Presets' }
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid #3d2f5a',
                  borderRadius: '16px',
                  padding: '24px'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6' }}>
                    {stat.value}
                  </div>
                  <div style={{ color: '#a0a0a0' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Features */}
            <h2 style={{ fontSize: '28px', marginBottom: '24px', color: 'white' }}>
              Everything You Need
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {[
                { icon: '🎤', title: 'Vocal Studio', desc: 'Transform your voice with AI' },
                { icon: '🥁', title: 'Beatmaker', desc: 'Create pro beats instantly' },
                { icon: '✍️', title: 'Songwriter', desc: 'AI-powered lyrics' },
                { icon: '🎵', title: 'Karaoke', desc: 'Sing along with scoring' },
                { icon: '🎛️', title: 'Presets', desc: 'One-click transformations' },
                { icon: '🎧', title: 'Live Mode', desc: 'Ultra-low latency' }
              ].map(feature => (
                <div key={feature.title} style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid #3d2f5a',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{feature.icon}</div>
                  <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '8px', color: 'white' }}>
                    {feature.title}
                  </div>
                  <div style={{ color: '#a0a0a0' }}>{feature.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STUDIO */}
        {activeTab === 'studio' && (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px', color: 'white' }}>
              🎙️ Vocal Studio
            </h1>
            
            {/* Mode Selector */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {['Live Performance', 'Studio Recording', 'Podcast'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setStudioMode(mode)}
                  style={{
                    padding: '12px 24px',
                    background: studioMode === mode ? '#8b5cf6' : 'rgba(139, 92, 246, 0.2)',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {mode === 'Live Performance' && '🎤 '}
                  {mode === 'Studio Recording' && '🎧 '}
                  {mode === 'Podcast' && '🎙️ '}
                  {mode}
                </button>
              ))}
            </div>

            {/* Live Correction Toggle */}
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid #22c55e',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ color: '#22c55e', marginBottom: '4px' }}>🎯 Live Voice Correction</h3>
                <p style={{ color: '#a0a0a0', fontSize: '14px' }}>Real-time pitch & tone fixing for {studioMode}</p>
              </div>
              <button
                onClick={() => setLiveCorrection(!liveCorrection)}
                style={{
                  padding: '12px 24px',
                  background: liveCorrection ? '#22c55e' : '#6b7280',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {liveCorrection ? '✓ ACTIVE' : 'OFF'}
              </button>
            </div>

            {/* Voice Changer Section */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
              border: '1px solid #8b5cf6',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ color: 'white', fontSize: '20px', marginBottom: '4px' }}>🎭 Voice Changer</h2>
                  <p style={{ color: '#a0a0a0', fontSize: '14px' }}>Transform your voice in real-time (Live & Studio)</p>
                </div>
                <button
                  onClick={() => setVoiceChangerEnabled(!voiceChangerEnabled)}
                  style={{
                    padding: '12px 24px',
                    background: voiceChangerEnabled ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : '#6b7280',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {voiceChangerEnabled ? '✓ ENABLED' : 'ENABLE'}
                </button>
              </div>

              {/* Voice Style Library */}
              <h3 style={{ color: '#ec4899', marginBottom: '16px' }}>👑 Voice Style Library</h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                {voiceStyles.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedVoiceStyle(style.id)}
                    style={{
                      padding: '16px',
                      background: selectedVoiceStyle === style.id 
                        ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' 
                        : 'rgba(15, 10, 26, 0.8)',
                      border: selectedVoiceStyle === style.id ? '2px solid #ec4899' : '1px solid #3d2f5a',
                      borderRadius: '12px',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{style.icon}</div>
                    <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '4px' }}>{style.name}</div>
                    <div style={{ color: '#a0a0a0', fontSize: '12px' }}>{style.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Waveform */}
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid #3d2f5a',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              height: '120px'
            }}>
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '4px',
                    height: `${20 + Math.random() * 60}px`,
                    background: voiceChangerEnabled 
                      ? 'linear-gradient(180deg, #ec4899, #f59e0b)' 
                      : 'linear-gradient(180deg, #8b5cf6, #ec4899)',
                    borderRadius: '2px'
                  }}
                />
              ))}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', justifyContent: 'center' }}>
              <button style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#ef4444',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer'
              }}>⏺</button>
              <button style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#22c55e',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer'
              }}>▶</button>
              <button style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#6b7280',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer'
              }}>⏹</button>
            </div>

            {/* Sliders */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px'
            }}>
              {[
                'Auto-Tune', 'Pitch Correction', 'Reverb', 'Delay', 
                'Compression', 'Noise Gate', 'De-Esser', 'Saturation',
                'Voice Warmth', 'Harmonic Richness', 'Vibrato Depth', 'Breath Control'
              ].map(control => (
                <div key={control} style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid #3d2f5a',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'white' }}>{control}</span>
                    <span style={{ color: '#8b5cf6' }}>50%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="50"
                    style={{ width: '100%', accentColor: '#8b5cf6' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BEATMAKER */}
        {activeTab === 'beatmaker' && (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>
              🥁 AI Beatmaker
            </h1>
            <p style={{ color: '#a0a0a0', marginBottom: '24px' }}>
              Describe the beat you want and let AI create it for you
            </p>

            {/* AI Prompt Input */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
              border: '2px solid #8b5cf6',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h3 style={{ color: 'white', marginBottom: '16px' }}>🤖 Describe Your Beat</h3>
              <textarea
                value={beatPrompt}
                onChange={(e) => setBeatPrompt(e.target.value)}
                placeholder="Example: Create a hard-hitting trap beat with heavy 808s, crisp hi-hats, and a dark melody. Make it sound like something you'd hear on the radio..."
                style={{
                  width: '100%',
                  padding: '16px',
                  background: '#0f0a1a',
                  border: '2px solid #3d2f5a',
                  borderRadius: '12px',
                  color: 'white',
                  minHeight: '100px',
                  resize: 'vertical',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
              />
              
              {/* Quick Style Buttons */}
              <div style={{ marginTop: '16px' }}>
                <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '12px' }}>Quick Styles:</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { label: '🔥 Trap Banger', prompt: 'Hard trap beat with 808s and aggressive hi-hats' },
                    { label: '🎷 Boom Bap', prompt: 'Classic boom bap with dusty drums and jazzy samples' },
                    { label: '💜 R&B Smooth', prompt: 'Smooth R&B with soft keys and sensual groove' },
                    { label: '☕ Lo-Fi Chill', prompt: 'Relaxing lo-fi with vinyl crackle and mellow piano' },
                    { label: '🌙 Drill Dark', prompt: 'Dark UK drill with sliding 808s and eerie melody' },
                    { label: '🌴 Afrobeats', prompt: 'Afrobeats with bouncy percussion and tropical feel' },
                    { label: '🏠 House', prompt: 'House music with four-on-the-floor and deep bass' },
                    { label: '⛪ Gospel', prompt: 'Uplifting gospel with organ chords and choir feel' }
                  ].map((style, idx) => (
                    <button
                      key={idx}
                      onClick={() => setBeatPrompt(style.prompt)}
                      style={{
                        padding: '10px 16px',
                        background: 'rgba(139, 92, 246, 0.3)',
                        border: '1px solid #8b5cf6',
                        borderRadius: '20px',
                        color: 'white',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Genre & Settings */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {['Hip-Hop', 'Trap', 'R&B', 'Pop', 'Lo-Fi', 'Drill', 'Afrobeats', 'House'].map(genre => (
                <button
                  key={genre}
                  onClick={() => setBeatGenre(genre)}
                  style={{
                    padding: '12px 24px',
                    background: beatGenre === genre ? '#8b5cf6' : 'rgba(139, 92, 246, 0.2)',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: beatGenre === genre ? '2px solid #ec4899' : '1px solid #3d2f5a'
                  }}
                >
                  {genre}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ color: '#a0a0a0', display: 'block', marginBottom: '8px' }}>BPM: {beatBpm}</label>
                <input
                  type="range"
                  min="60"
                  max="180"
                  value={beatBpm}
                  onChange={(e) => setBeatBpm(Number(e.target.value))}
                  style={{ width: '200px', accentColor: '#8b5cf6' }}
                />
              </div>
              <div>
                <label style={{ color: '#a0a0a0', display: 'block', marginBottom: '8px' }}>Key</label>
                <select style={{
                  padding: '12px',
                  background: '#1a1025',
                  border: '1px solid #3d2f5a',
                  borderRadius: '8px',
                  color: 'white'
                }}>
                  <option>C Major</option>
                  <option>A Minor</option>
                  <option>G Major</option>
                  <option>E Minor</option>
                  <option>D Major</option>
                  <option>F Major</option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <button 
              onClick={handleGenerateBeat}
              disabled={isGeneratingBeat}
              style={{
                padding: '20px 48px',
                background: isGeneratingBeat ? '#6b7280' : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                color: 'white',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '18px',
                cursor: isGeneratingBeat ? 'not-allowed' : 'pointer',
                marginBottom: '24px'
              }}
            >
              {isGeneratingBeat ? '⏳ Generating Beat...' : '🤖 Generate Beat with AI'}
            </button>

            {/* Generated Beat Display */}
            {generatedBeat && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))',
                border: '2px solid #22c55e',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ color: '#22c55e', marginBottom: '4px' }}>✅ Beat Generated!</h3>
                    <p style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>{generatedBeat.name}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ background: '#8b5cf6', padding: '6px 12px', borderRadius: '8px', color: 'white', fontSize: '14px' }}>
                      {generatedBeat.bpm} BPM
                    </span>
                    <span style={{ background: '#ec4899', padding: '6px 12px', borderRadius: '8px', color: 'white', fontSize: '14px' }}>
                      {generatedBeat.key}
                    </span>
                  </div>
                </div>
                
                {/* Waveform */}
                <div style={{
                  background: '#0f0a1a',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  height: '60px',
                  marginBottom: '16px'
                }}>
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: '4px',
                        height: `${15 + Math.random() * 35}px`,
                        background: 'linear-gradient(180deg, #22c55e, #16a34a)',
                        borderRadius: '2px'
                      }}
                    />
                  ))}
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button style={{
                    flex: 1,
                    padding: '14px',
                    background: '#22c55e',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}>
                    ▶️ Play Beat
                  </button>
                  <button style={{
                    flex: 1,
                    padding: '14px',
                    background: 'rgba(139, 92, 246, 0.3)',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}>
                    ✏️ Edit in Sequencer
                  </button>
                  <button style={{
                    flex: 1,
                    padding: '14px',
                    background: 'rgba(59, 130, 246, 0.3)',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}>
                    📥 Download
                  </button>
                </div>
              </div>
            )}

            {/* Drum Sequencer */}
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid #3d2f5a',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{ marginBottom: '16px', color: 'white' }}>🥁 Drum Sequencer (Click pads to hear sounds!)</h3>
              {['Kick', 'Snare', 'Hi-Hat', 'Clap', '808', 'Perc'].map((drum, drumIdx) => (
                <div key={drum} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <button 
                    onClick={() => {
                      if (drum === 'Kick' || drum === '808') playBeatSound('kick');
                      else if (drum === 'Snare' || drum === 'Clap') playBeatSound('snare');
                      else playBeatSound('hihat');
                    }}
                    style={{ 
                      width: '60px', 
                      color: '#a0a0a0', 
                      fontSize: '14px',
                      background: 'transparent',
                      border: '1px solid #3d2f5a',
                      borderRadius: '4px',
                      padding: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {drum}
                  </button>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {Array.from({ length: 16 }).map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          const target = e.target as HTMLButtonElement;
                          const isActive = target.style.background === 'rgb(139, 92, 246)';
                          target.style.background = isActive ? '#2d1f4a' : '#8b5cf6';
                          // Play sound when activating
                          if (!isActive) {
                            if (drum === 'Kick' || drum === '808') playBeatSound('kick');
                            else if (drum === 'Snare' || drum === 'Clap') playBeatSound('snare');
                            else playBeatSound('hihat');
                          }
                        }}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '4px',
                          background: (drumIdx === 0 && (i === 0 || i === 8)) || 
                                      (drumIdx === 1 && (i === 4 || i === 12)) ||
                                      (drumIdx === 2 && i % 2 === 0) ? '#8b5cf6' : '#2d1f4a',
                          border: i % 4 === 0 ? '1px solid #ec4899' : '1px solid transparent',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    defaultValue="80"
                    style={{ width: '80px', accentColor: '#8b5cf6' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SONGWRITER - Advanced ChatGPT-like Interface */}
        {activeTab === 'songwriter' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>
                  ✍️ AI Songwriting Studio
                </h1>
                <p style={{ color: '#a0a0a0' }}>
                  Professional ChatGPT-powered songwriting for radio-ready hits
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setSongwriterMode('chat')}
                  style={{
                    padding: '10px 20px',
                    background: songwriterMode === 'chat' ? '#8b5cf6' : 'rgba(139, 92, 246, 0.2)',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  💬 Chat Mode
                </button>
                <button
                  onClick={() => setSongwriterMode('structured')}
                  style={{
                    padding: '10px 20px',
                    background: songwriterMode === 'structured' ? '#8b5cf6' : 'rgba(139, 92, 246, 0.2)',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  📝 Structured Mode
                </button>
              </div>
            </div>

            {songwriterMode === 'chat' ? (
              /* CHAT MODE - Like ChatGPT */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
                {/* Chat Interface */}
                <div style={{
                  background: 'rgba(15, 10, 26, 0.8)',
                  border: '1px solid #3d2f5a',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '600px'
                }}>
                  {/* Chat Header */}
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #3d2f5a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>🎵</div>
                    <div>
                      <div style={{ color: 'white', fontWeight: 'bold' }}>AI Songwriting Partner</div>
                      <div style={{ color: '#22c55e', fontSize: '12px' }}>● Online - Ready to write</div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                      }}>
                        <div style={{
                          maxWidth: '80%',
                          padding: '14px 18px',
                          borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: msg.role === 'user' 
                            ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' 
                            : 'rgba(139, 92, 246, 0.2)',
                          color: 'white',
                          whiteSpace: 'pre-line'
                        }}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isGenerating && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a0a0a0' }}>
                        <div style={{ 
                          display: 'flex', 
                          gap: '4px' 
                        }}>
                          <span style={{ animation: 'pulse 1s infinite' }}>●</span>
                          <span style={{ animation: 'pulse 1s infinite 0.2s' }}>●</span>
                          <span style={{ animation: 'pulse 1s infinite 0.4s' }}>●</span>
                        </div>
                        <span>AI is writing...</span>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div style={{
                    padding: '16px',
                    borderTop: '1px solid #3d2f5a',
                    display: 'flex',
                    gap: '12px'
                  }}>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && chatInput.trim()) {
                          const userMsg = chatInput.trim();
                          setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
                          setChatInput('');
                          setIsGenerating(true);
                          
                          // Simulate AI response
                          setTimeout(() => {
                            let aiResponse = '';
                            const lowerMsg = userMsg.toLowerCase();
                            
                            if (lowerMsg.includes('love') || lowerMsg.includes('romantic')) {
                              aiResponse = `🎵 Here's a romantic verse I wrote for you:\n\n[Verse]\nEvery moment spent with you feels like a dream,\nYour eyes shine brighter than the moonlight's gleam,\nI never knew that love could feel this way,\nBut here you are, you take my breath away.\n\n[Chorus]\nYou're my everything, my heart, my soul,\nWith you beside me, I finally feel whole,\nTogether we can reach beyond the sky,\nThis love we share will never, ever die.\n\n✨ Want me to:\n• Add a bridge?\n• Make it more upbeat?\n• Write verse 2?\n• Change the rhyme scheme?`;
                            } else if (lowerMsg.includes('sad') || lowerMsg.includes('heartbreak') || lowerMsg.includes('breakup')) {
                              aiResponse = `💔 Here's a powerful heartbreak ballad:\n\n[Verse]\nEmpty rooms echo with your name tonight,\nHolding onto memories fading from sight,\nEvery song reminds me of what we had,\nNow these walls hold nothing but feeling sad.\n\n[Chorus]\nBroken pieces of my shattered heart,\nScattered since the day we fell apart,\nI'm learning how to breathe again,\nBut I still feel the ache within.\n\n😢 Would you like me to:\n• Add more emotional depth?\n• Write a hopeful bridge?\n• Make it more dramatic?\n• Add ad-libs and runs?`;
                            } else if (lowerMsg.includes('party') || lowerMsg.includes('dance') || lowerMsg.includes('club')) {
                              aiResponse = `🎉 Let's get this party started!\n\n[Verse]\nThe beat drops and we lose control tonight,\nHands up high, city lights burning bright,\nEvery worry fades into the bass,\nFeel the rhythm take us to another place!\n\n[Chorus]\nDance all night until the sun comes up,\nFill your soul, raise your cup,\nThis is our time, our moment to shine,\nEverything is feeling so divine!\n\n🔥 Want me to:\n• Add a rap verse?\n• Make the hook catchier?\n• Add energy builds?\n• Write a breakdown section?`;
                            } else if (lowerMsg.includes('add') || lowerMsg.includes('more') || lowerMsg.includes('verse 2')) {
                              aiResponse = `✍️ Here's Verse 2 continuing the story:\n\n[Verse 2]\nThrough every storm you held me close and tight,\nYou are my day, my stars, my moonlit night,\nNo matter what the world may try to say,\nI'll love you more with every passing day.\n\nAnd every memory we make is gold,\nA story meant for us, forever to be told,\nYou're the melody in my heart's song,\nWith you is where I've always belonged.\n\n🎤 I can also:\n• Write a powerful bridge\n• Add a pre-chorus\n• Create ad-libs\n• Suggest melody notes`;
                            } else if (lowerMsg.includes('bridge')) {
                              aiResponse = `🌉 Here's an emotional bridge:\n\n[Bridge]\nWhen the world gets cold and dark,\nYou're the fire, you're the spark,\nI'll give you all I have to give,\nFor you, I truly want to live.\n\nAnd if tomorrow never comes,\nI'd still be grateful for this love,\nEvery beat of my heart sings your name,\nNothing will ever be the same.\n\n✨ The bridge builds tension before the final chorus. Want me to:\n• Add a key change?\n• Write an outro?\n• Add harmonies?`;
                            } else if (lowerMsg.includes('hip') || lowerMsg.includes('rap')) {
                              aiResponse = `🎤 Here's a fire hip-hop verse:\n\n[Verse - Rap]\nYeah, I came from the bottom, now I'm rising to the top,\nEvery hater said I'd fail but I just can't stop,\nGot my vision crystal clear, manifest my dreams,\nNothing's ever what it seems, I'm busting at the seams.\n\nGrind mode activated, never taking breaks,\nDoing what it takes, making no mistakes,\nLegacy I'm building gonna stand the test of time,\nEvery word I spit is like a mountain I climb.\n\n🔥 Should I:\n• Add a melodic hook?\n• Write a second verse?\n• Add a hype ad-lib section?\n• Create a drill-style version?`;
                            } else {
                              aiResponse = `🎵 I'd love to help you write that song! Here's what I can do:\n\n📝 **Song Types:**\n• Love songs & ballads\n• Heartbreak & emotional tracks\n• Party anthems\n• Hip-hop & rap verses\n• R&B smooth jams\n• Gospel & inspirational\n• Pop hits\n\n⚡ **I can help with:**\n• Full song structure (verse, chorus, bridge)\n• Specific sections on demand\n• Rhyme scheme adjustments\n• Emotional tone changes\n• Genre-specific styles\n• Melody suggestions\n• Ad-libs and vocal runs\n\n💬 Just tell me:\n1. What's the song about?\n2. What mood/emotion?\n3. Any specific style?\n\nLet's create something legendary! 🎤`;
                            }
                            
                            setChatMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
                            setIsGenerating(false);
                          }, 1500);
                        }
                      }}
                      placeholder="Tell me what kind of song you want to write... (Press Enter to send)"
                      style={{
                        flex: 1,
                        padding: '14px 18px',
                        background: '#1a1025',
                        border: '2px solid #3d2f5a',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '15px'
                      }}
                    />
                    <button
                      onClick={() => {
                        if (chatInput.trim()) {
                          const userMsg = chatInput.trim();
                          setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
                          setChatInput('');
                          setIsGenerating(true);
                          setTimeout(() => {
                            setChatMessages(prev => [...prev, { 
                              role: 'ai', 
                              content: `🎵 Working on "${userMsg}"...\n\nHere's what I created:\n\n[Verse]\nEvery word you speak ignites a fire in my soul,\nWith every passing moment, you make me whole,\nI never knew that life could feel this bright,\nYou're my morning sun, my stars at night.\n\n[Chorus]\nThis is our story, written in the stars,\nNo matter where we go, no matter how far,\nI'll hold you close and never let you go,\nThis love we have is all I'll ever know.\n\n✨ Want me to continue or modify this?`
                            }]);
                            setIsGenerating(false);
                          }, 1500);
                        }
                      }}
                      style={{
                        padding: '14px 24px',
                        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                        color: 'white',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Send
                    </button>
                  </div>
                </div>

                {/* Quick Actions & Song Builder */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Quick Prompts */}
                  <div style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid #3d2f5a',
                    borderRadius: '16px',
                    padding: '20px'
                  }}>
                    <h3 style={{ color: 'white', marginBottom: '16px' }}>⚡ Quick Prompts</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        '💕 Write a love song about finding your soulmate',
                        '💔 Write a breakup song about letting go',
                        '🎉 Write a party anthem for the club',
                        '💪 Write an empowerment song about overcoming',
                        '🌙 Write a late-night R&B slow jam',
                        '🔥 Write a hip-hop verse about success',
                        '⛪ Write an uplifting gospel song'
                      ].map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setChatInput(prompt.substring(2));
                          }}
                          style={{
                            padding: '12px',
                            background: 'rgba(15, 10, 26, 0.8)',
                            border: '1px solid #3d2f5a',
                            borderRadius: '8px',
                            color: '#a0a0a0',
                            textAlign: 'left',
                            fontSize: '13px',
                            cursor: 'pointer'
                          }}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Current Song */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
                    border: '1px solid #8b5cf6',
                    borderRadius: '16px',
                    padding: '20px'
                  }}>
                    <h3 style={{ color: 'white', marginBottom: '12px' }}>📄 Current Song</h3>
                    <input
                      type="text"
                      value={currentSong.title}
                      onChange={(e) => setCurrentSong(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Song Title"
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#0f0a1a',
                        border: '1px solid #3d2f5a',
                        borderRadius: '8px',
                        color: 'white',
                        marginBottom: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      <span style={{ padding: '4px 12px', background: '#8b5cf6', borderRadius: '12px', fontSize: '12px', color: 'white' }}>
                        {songGenre}
                      </span>
                      <span style={{ padding: '4px 12px', background: '#ec4899', borderRadius: '12px', fontSize: '12px', color: 'white' }}>
                        {songMood}
                      </span>
                      <span style={{ padding: '4px 12px', background: '#f59e0b', borderRadius: '12px', fontSize: '12px', color: 'white' }}>
                        {rhymeScheme}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{
                        flex: 1,
                        padding: '10px',
                        background: 'rgba(34, 197, 94, 0.2)',
                        color: '#22c55e',
                        borderRadius: '8px',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}>
                        💾 Save
                      </button>
                      <button style={{
                        flex: 1,
                        padding: '10px',
                        background: 'rgba(59, 130, 246, 0.2)',
                        color: '#3b82f6',
                        borderRadius: '8px',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}>
                        📤 Export
                      </button>
                    </div>
                  </div>

                  {/* Settings */}
                  <div style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid #3d2f5a',
                    borderRadius: '16px',
                    padding: '20px'
                  }}>
                    <h3 style={{ color: 'white', marginBottom: '16px' }}>⚙️ Song Settings</h3>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <div>
                        <label style={{ color: '#a0a0a0', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Genre</label>
                        <select
                          value={songGenre}
                          onChange={(e) => setSongGenre(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: '#1a1025',
                            border: '1px solid #3d2f5a',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                        >
                          <option>Pop</option>
                          <option>R&B</option>
                          <option>Hip-Hop</option>
                          <option>Soul</option>
                          <option>Gospel</option>
                          <option>Country</option>
                          <option>Rock</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ color: '#a0a0a0', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Mood</label>
                        <select
                          value={songMood}
                          onChange={(e) => setSongMood(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: '#1a1025',
                            border: '1px solid #3d2f5a',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                        >
                          <option>Happy</option>
                          <option>Sad</option>
                          <option>Romantic</option>
                          <option>Energetic</option>
                          <option>Dark</option>
                          <option>Hopeful</option>
                          <option>Nostalgic</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ color: '#a0a0a0', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Rhyme Scheme</label>
                        <select
                          value={rhymeScheme}
                          onChange={(e) => setRhymeScheme(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: '#1a1025',
                            border: '1px solid #3d2f5a',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                        >
                          <option>AABB</option>
                          <option>ABAB</option>
                          <option>ABCB</option>
                          <option>Free Form</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ color: '#a0a0a0', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Key</label>
                        <select
                          value={songKey}
                          onChange={(e) => setSongKey(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: '#1a1025',
                            border: '1px solid #3d2f5a',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                        >
                          <option>C Major</option>
                          <option>G Major</option>
                          <option>D Major</option>
                          <option>A Minor</option>
                          <option>E Minor</option>
                          <option>F Major</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ color: '#a0a0a0', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Tempo</label>
                        <select
                          value={songTempo}
                          onChange={(e) => setSongTempo(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: '#1a1025',
                            border: '1px solid #3d2f5a',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                        >
                          <option>Slow (60-80 BPM)</option>
                          <option>Medium (80-110 BPM)</option>
                          <option>Upbeat (110-130 BPM)</option>
                          <option>Fast (130+ BPM)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ color: '#a0a0a0', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Emotional Arc</label>
                        <select
                          value={emotionalArc}
                          onChange={(e) => setEmotionalArc(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: '#1a1025',
                            border: '1px solid #3d2f5a',
                            borderRadius: '8px',
                            color: 'white'
                          }}
                        >
                          <option value="building">Building (Soft → Powerful)</option>
                          <option value="falling">Falling (Powerful → Soft)</option>
                          <option value="steady">Steady (Consistent)</option>
                          <option value="dynamic">Dynamic (Peaks & Valleys)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* STRUCTURED MODE */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={{ color: '#a0a0a0', display: 'block', marginBottom: '8px' }}>Song Topic / Theme</label>
                <textarea
                  value={songTopic}
                  onChange={(e) => setSongTopic(e.target.value)}
                  placeholder="What's your song about? (e.g., finding love, heartbreak, empowerment, dancing all night...)"
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: '#1a1025',
                    border: '1px solid #3d2f5a',
                    borderRadius: '12px',
                    color: 'white',
                    minHeight: '100px',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />

                <div style={{ marginTop: '16px' }}>
                  <label style={{ color: '#a0a0a0', display: 'block', marginBottom: '8px' }}>Genre</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['Pop', 'R&B', 'Hip-Hop', 'Soul', 'Gospel', 'Country', 'Rock'].map(g => (
                      <button
                        key={g}
                        onClick={() => setSongGenre(g)}
                        style={{
                          padding: '10px 18px',
                          background: songGenre === g ? '#8b5cf6' : 'rgba(139, 92, 246, 0.2)',
                          color: 'white',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label style={{ color: '#a0a0a0', display: 'block', marginBottom: '8px' }}>Mood / Emotion</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['Happy', 'Sad', 'Energetic', 'Romantic', 'Dark', 'Hopeful', 'Nostalgic'].map(m => (
                      <button
                        key={m}
                        onClick={() => setSongMood(m)}
                        style={{
                          padding: '10px 18px',
                          background: songMood === m ? '#ec4899' : 'rgba(236, 72, 153, 0.2)',
                          color: 'white',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label style={{ color: '#a0a0a0', display: 'block', marginBottom: '8px' }}>Song Structure</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { id: 'verse-chorus', label: 'Verse-Chorus' },
                      { id: 'verse-chorus-bridge', label: 'Verse-Chorus-Bridge' },
                      { id: 'full-song', label: 'Full Song' }
                    ].map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSongStructure(s.id)}
                        style={{
                          padding: '10px 18px',
                          background: songStructure === s.id ? '#f59e0b' : 'rgba(245, 158, 11, 0.2)',
                          color: 'white',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleGenerateLyrics}
                  disabled={isGenerating}
                  style={{
                    marginTop: '24px',
                    padding: '18px 32px',
                    background: isGenerating ? '#6b7280' : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    color: 'white',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    width: '100%',
                    fontSize: '16px',
                    cursor: isGenerating ? 'not-allowed' : 'pointer'
                  }}>
                  {isGenerating ? '⏳ Generating...' : '🤖 Generate Professional Lyrics'}
                </button>
              </div>

              {/* Generated Lyrics Panel */}
              <div style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid #3d2f5a',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 style={{ color: 'white', marginBottom: '20px' }}>Generated Lyrics</h3>
                
                {!generatedLyrics ? (
                  <div style={{ color: '#6b7280', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
                    <p>Click "Generate" to create lyrics</p>
                  </div>
                ) : (
                  <div style={{ lineHeight: '1.8' }}>
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ color: '#8b5cf6', fontWeight: 'bold', marginBottom: '8px' }}>[Verse 1]</div>
                      {generatedLyrics.verse1.map((line, i) => (
                        <p key={i} style={{ color: 'white', margin: '4px 0' }}>{line}</p>
                      ))}
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ color: '#ec4899', fontWeight: 'bold', marginBottom: '8px' }}>[Chorus]</div>
                      {generatedLyrics.chorus.map((line, i) => (
                        <p key={i} style={{ color: 'white', margin: '4px 0', fontWeight: 'bold' }}>{line}</p>
                      ))}
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ color: '#8b5cf6', fontWeight: 'bold', marginBottom: '8px' }}>[Verse 2]</div>
                      {generatedLyrics.verse2.map((line, i) => (
                        <p key={i} style={{ color: 'white', margin: '4px 0' }}>{line}</p>
                      ))}
                    </div>
                    {songStructure !== 'verse-chorus' && (
                      <div>
                        <div style={{ color: '#f59e0b', fontWeight: 'bold', marginBottom: '8px' }}>[Bridge]</div>
                        {generatedLyrics.bridge.map((line, i) => (
                          <p key={i} style={{ color: 'white', margin: '4px 0', fontStyle: 'italic' }}>{line}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
        )}

        {/* VOCAL COACH */}
        {activeTab === 'coach' && (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>
              🎓 AI Vocal Coach
            </h1>
            <p style={{ color: '#a0a0a0', marginBottom: '24px' }}>
              Train your voice with real-time feedback and professional exercises
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
              {/* Exercise Selection */}
              <div style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid #3d2f5a',
                borderRadius: '16px',
                padding: '20px'
              }}>
                <h3 style={{ color: 'white', marginBottom: '16px' }}>Training Exercises</h3>
                {[
                  { id: 'breathing', name: 'Breathing Control', icon: '🌬️', desc: 'Diaphragm support' },
                  { id: 'pitch', name: 'Pitch Accuracy', icon: '🎯', desc: 'Hit the right notes' },
                  { id: 'scales', name: 'Vocal Scales', icon: '🎹', desc: 'Range expansion' },
                  { id: 'runs', name: 'Vocal Runs', icon: '🏃', desc: 'Agility training' },
                  { id: 'vibrato', name: 'Vibrato Control', icon: '〰️', desc: 'Natural vibrato' },
                  { id: 'belting', name: 'Belt Training', icon: '💪', desc: 'Power vocals' },
                  { id: 'warmup', name: 'Daily Warm-Up', icon: '☀️', desc: '5-min routine' }
                ].map(ex => (
                  <button
                    key={ex.id}
                    onClick={() => setCoachExercise(ex.id)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: coachExercise === ex.id ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'rgba(15, 10, 26, 0.8)',
                      border: coachExercise === ex.id ? '2px solid #ec4899' : '1px solid #3d2f5a',
                      borderRadius: '10px',
                      marginBottom: '10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{ex.icon}</span>
                    <div>
                      <div style={{ color: 'white', fontWeight: 'bold' }}>{ex.name}</div>
                      <div style={{ color: '#a0a0a0', fontSize: '12px' }}>{ex.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Exercise Area */}
              <div>
                {/* Current Exercise */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
                  border: '1px solid #8b5cf6',
                  borderRadius: '16px',
                  padding: '32px',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  <h2 style={{ color: 'white', marginBottom: '8px' }}>
                    {coachExercise === 'breathing' && '🌬️ Breathing Control'}
                    {coachExercise === 'pitch' && '🎯 Pitch Accuracy'}
                    {coachExercise === 'scales' && '🎹 Vocal Scales'}
                    {coachExercise === 'runs' && '🏃 Vocal Runs'}
                    {coachExercise === 'vibrato' && '〰️ Vibrato Control'}
                    {coachExercise === 'belting' && '💪 Belt Training'}
                    {coachExercise === 'warmup' && '☀️ Daily Warm-Up'}
                  </h2>
                  <p style={{ color: '#a0a0a0', marginBottom: '24px' }}>
                    {coachExercise === 'breathing' && 'Practice diaphragmatic breathing for better vocal support'}
                    {coachExercise === 'pitch' && 'Match the target pitch displayed on screen'}
                    {coachExercise === 'scales' && 'Sing along with the scale pattern'}
                    {coachExercise === 'runs' && 'Follow the melody pattern with increasing speed'}
                    {coachExercise === 'vibrato' && 'Learn to control natural vibrato oscillation'}
                    {coachExercise === 'belting' && 'Build power without strain'}
                    {coachExercise === 'warmup' && 'Complete your daily vocal preparation'}
                  </p>

                  {/* Pitch Visualization */}
                  <div style={{
                    background: '#0f0a1a',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px' }}>
                      <div>
                        <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Target Note</div>
                        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#8b5cf6' }}>A4</div>
                        <div style={{ color: '#a0a0a0' }}>440 Hz</div>
                      </div>
                      <div style={{ fontSize: '32px', color: '#6b7280' }}>→</div>
                      <div>
                        <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Your Note</div>
                        <div style={{ fontSize: '48px', fontWeight: 'bold', color: exerciseActive ? '#22c55e' : '#6b7280' }}>
                          {exerciseActive ? 'A4' : '--'}
                        </div>
                        <div style={{ color: '#a0a0a0' }}>{exerciseActive ? '438 Hz' : '-- Hz'}</div>
                      </div>
                    </div>

                    {/* Pitch Meter */}
                    <div style={{ marginTop: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#a0a0a0' }}>Accuracy</span>
                        <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{pitchScore}%</span>
                      </div>
                      <div style={{ background: '#2d1f4a', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
                        <div style={{ 
                          background: pitchScore > 80 ? '#22c55e' : pitchScore > 50 ? '#f59e0b' : '#ef4444',
                          width: `${pitchScore}%`, 
                          height: '100%', 
                          borderRadius: '8px',
                          transition: 'width 0.3s'
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* Start/Stop Button */}
                  <button
                    onClick={startExercise}
                    disabled={exerciseActive}
                    style={{
                      padding: '18px 48px',
                      background: exerciseActive 
                        ? '#6b7280' 
                        : 'linear-gradient(135deg, #22c55e, #16a34a)',
                      color: 'white',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: '18px',
                      cursor: exerciseActive ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {exerciseActive ? '🎤 Listening...' : '▶️ Start Exercise'}
                  </button>
                </div>

                {/* Real-time Feedback */}
                <div style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid #3d2f5a',
                  borderRadius: '16px',
                  padding: '24px'
                }}>
                  <h3 style={{ color: 'white', marginBottom: '16px' }}>🤖 AI Coach Feedback</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div style={{
                      background: '#0f0a1a',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div>
                      <div style={{ color: '#22c55e', fontSize: '24px', fontWeight: 'bold' }}>92%</div>
                      <div style={{ color: '#a0a0a0', fontSize: '12px' }}>Pitch Accuracy</div>
                    </div>
                    <div style={{
                      background: '#0f0a1a',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌬️</div>
                      <div style={{ color: '#f59e0b', fontSize: '24px', fontWeight: 'bold' }}>78%</div>
                      <div style={{ color: '#a0a0a0', fontSize: '12px' }}>Breath Support</div>
                    </div>
                    <div style={{
                      background: '#0f0a1a',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏱️</div>
                      <div style={{ color: '#8b5cf6', fontSize: '24px', fontWeight: 'bold' }}>85%</div>
                      <div style={{ color: '#a0a0a0', fontSize: '12px' }}>Timing</div>
                    </div>
                  </div>

                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid #22c55e',
                    borderRadius: '10px'
                  }}>
                    <p style={{ color: '#22c55e', fontWeight: 'bold', marginBottom: '4px' }}>💡 Coach Tip:</p>
                    <p style={{ color: '#a0a0a0' }}>
                      Great job on your pitch! Try to engage your diaphragm more for better breath support. 
                      Remember to relax your jaw and keep your throat open.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KARAOKE */}
        {activeTab === 'karaoke' && (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>
              🎤 Karaoke Mode
            </h1>
            <p style={{ color: '#a0a0a0', marginBottom: '24px' }}>
              Sing along with real-time pitch scoring • {karaokeSongs.length} songs available
            </p>

            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {['All', 'Easy', 'Medium', 'Hard', 'Expert'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setKaraokeFilter(filter)}
                  style={{
                    padding: '10px 20px',
                    background: karaokeFilter === filter ? '#8b5cf6' : 'rgba(139, 92, 246, 0.2)',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px' }}>
              {/* Song List */}
              <div style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid #3d2f5a',
                borderRadius: '16px',
                padding: '20px',
                maxHeight: '600px',
                overflowY: 'auto'
              }}>
                <h3 style={{ marginBottom: '16px', color: 'white' }}>🎵 Song Library</h3>
                {karaokeSongs
                  .filter(s => karaokeFilter === 'All' || s.difficulty === karaokeFilter)
                  .map(song => (
                  <button
                    key={song.title}
                    onClick={() => selectKaraokeSong(song)}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: selectedSong?.title === song.title 
                        ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' 
                        : 'rgba(15, 10, 26, 0.8)',
                      border: selectedSong?.title === song.title ? '2px solid #ec4899' : '1px solid #3d2f5a',
                      borderRadius: '10px',
                      marginBottom: '10px',
                      textAlign: 'left',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{song.title}</div>
                        <div style={{ fontSize: '12px', color: '#a0a0a0' }}>{song.artist}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: '10px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: song.difficulty === 'Easy' ? '#22c55e' :
                                      song.difficulty === 'Medium' ? '#f59e0b' :
                                      song.difficulty === 'Hard' ? '#ef4444' : '#8b5cf6',
                          color: 'white'
                        }}>
                          {song.difficulty}
                        </span>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                          {song.duration} • {song.bpm} BPM
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Player */}
              <div>
                {selectedSong ? (
                  <>
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
                      border: '2px solid #8b5cf6',
                      borderRadius: '16px',
                      padding: '40px',
                      textAlign: 'center',
                      marginBottom: '24px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                        <span style={{
                          padding: '6px 16px',
                          background: selectedSong.difficulty === 'Easy' ? '#22c55e' :
                                      selectedSong.difficulty === 'Medium' ? '#f59e0b' :
                                      selectedSong.difficulty === 'Hard' ? '#ef4444' : '#8b5cf6',
                          borderRadius: '20px',
                          fontSize: '12px',
                          color: 'white'
                        }}>
                          {selectedSong.difficulty}
                        </span>
                        <span style={{ padding: '6px 16px', background: '#3d2f5a', borderRadius: '20px', fontSize: '12px', color: 'white' }}>
                          {selectedSong.bpm} BPM
                        </span>
                      </div>
                      
                      <h2 style={{ fontSize: '28px', marginBottom: '8px', color: 'white' }}>{selectedSong.title}</h2>
                      <p style={{ color: '#a0a0a0', marginBottom: '32px', fontSize: '18px' }}>{selectedSong.artist}</p>
                      
                      {/* Lyrics Display */}
                      <div style={{ marginBottom: '32px', padding: '24px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
                        <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '8px' }}>♪ Previous line goes here...</p>
                        <p style={{ color: '#ec4899', fontSize: '26px', fontWeight: 'bold', marginBottom: '8px' }}>
                          🎤 Current line - Sing now!
                        </p>
                        <p style={{ color: '#6b7280', fontSize: '16px' }}>♪ Next line coming up...</p>
                      </div>

                      {/* Pitch Meter */}
                      <div style={{
                        background: '#0f0a1a',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '24px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span style={{ color: '#a0a0a0' }}>🎯 Pitch Accuracy</span>
                          <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: '20px' }}>87%</span>
                        </div>
                        <div style={{ background: '#2d1f4a', borderRadius: '8px', height: '16px', overflow: 'hidden' }}>
                          <div style={{ 
                            background: 'linear-gradient(90deg, #22c55e, #16a34a)', 
                            width: '87%', 
                            height: '100%', 
                            borderRadius: '8px',
                            transition: 'width 0.3s'
                          }} />
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ background: '#2d1f4a', borderRadius: '4px', height: '6px', marginBottom: '8px' }}>
                          <div style={{ background: '#8b5cf6', width: '35%', height: '100%', borderRadius: '4px' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                          <span>1:18</span>
                          <span>{selectedSong.duration}</span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <button style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          background: '#2d1f4a',
                          color: 'white',
                          fontSize: '20px',
                          border: 'none',
                          cursor: 'pointer'
                        }}>⏮</button>
                        <button style={{
                          width: '70px',
                          height: '70px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                          color: 'white',
                          fontSize: '28px',
                          border: 'none',
                          cursor: 'pointer'
                        }}>▶</button>
                        <button style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          background: '#2d1f4a',
                          color: 'white',
                          fontSize: '20px',
                          border: 'none',
                          cursor: 'pointer'
                        }}>⏭</button>
                      </div>
                    </div>

                    {/* Score */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                      <div style={{
                        background: 'rgba(34, 197, 94, 0.2)',
                        border: '1px solid #22c55e',
                        borderRadius: '12px',
                        padding: '20px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#22c55e' }}>8,450</div>
                        <div style={{ color: '#a0a0a0', fontSize: '14px' }}>Score</div>
                      </div>
                      <div style={{
                        background: 'rgba(139, 92, 246, 0.2)',
                        border: '1px solid #8b5cf6',
                        borderRadius: '12px',
                        padding: '20px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#8b5cf6' }}>12x</div>
                        <div style={{ color: '#a0a0a0', fontSize: '14px' }}>Streak</div>
                      </div>
                      <div style={{
                        background: 'rgba(236, 72, 153, 0.2)',
                        border: '1px solid #ec4899',
                        borderRadius: '12px',
                        padding: '20px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ec4899' }}>A+</div>
                        <div style={{ color: '#a0a0a0', fontSize: '14px' }}>Grade</div>
                      </div>
                      <div style={{
                        background: 'rgba(245, 158, 11, 0.2)',
                        border: '1px solid #f59e0b',
                        borderRadius: '12px',
                        padding: '20px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>24</div>
                        <div style={{ color: '#a0a0a0', fontSize: '14px' }}>Perfect Notes</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '2px dashed #3d2f5a',
                    borderRadius: '16px',
                    padding: '80px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎤</div>
                    <h3 style={{ color: 'white', marginBottom: '8px' }}>Select a Song</h3>
                    <p style={{ color: '#6b7280' }}>Choose a song from the library to start singing!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEMS EXTRACTOR */}
        {activeTab === 'stems' && (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>
              🎛️ AI Stem Extractor
            </h1>
            <p style={{ color: '#a0a0a0', marginBottom: '24px' }}>
              Separate any song into vocals, drums, bass, and instruments
            </p>

            {/* Upload Area */}
            <div 
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'audio/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    setStemsFile(file.name);
                  }
                };
                input.click();
              }}
              style={{
                background: stemsFile ? 'rgba(34, 197, 94, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                border: stemsFile ? '2px solid #22c55e' : '2px dashed #8b5cf6',
                borderRadius: '16px',
                padding: '60px',
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: '24px'
              }}
            >
              {stemsFile ? (
                <>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                  <h3 style={{ color: '#22c55e', marginBottom: '8px' }}>File Uploaded!</h3>
                  <p style={{ color: 'white', fontSize: '18px' }}>{stemsFile}</p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                  <h3 style={{ color: 'white', marginBottom: '8px' }}>Drop audio file here</h3>
                  <p style={{ color: '#a0a0a0' }}>or click to browse • MP3, WAV, M4A supported</p>
                </>
              )}
            </div>

            {/* Process Button */}
            {stemsFile && !stemsComplete && (
              <button
                onClick={processStems}
                disabled={stemsProcessing}
                style={{
                  width: '100%',
                  padding: '20px',
                  background: stemsProcessing ? '#6b7280' : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  cursor: stemsProcessing ? 'not-allowed' : 'pointer',
                  marginBottom: '24px',
                  border: 'none'
                }}
              >
                {stemsProcessing ? '⏳ Separating Stems... Please wait' : '🎛️ Extract Stems with AI'}
              </button>
            )}

            {/* Stems Output */}
            {stemsComplete && (
              <div style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid #3d2f5a',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 style={{ color: 'white', marginBottom: '24px' }}>🎉 Stems Extracted Successfully!</h3>
                
                <div style={{ display: 'grid', gap: '16px' }}>
                  {[
                    { name: 'Vocals', icon: '🎤', color: '#ec4899' },
                    { name: 'Drums', icon: '🥁', color: '#f59e0b' },
                    { name: 'Bass', icon: '🎸', color: '#22c55e' },
                    { name: 'Other/Instruments', icon: '🎹', color: '#3b82f6' }
                  ].map(stem => (
                    <div key={stem.name} style={{
                      background: 'rgba(15, 10, 26, 0.8)',
                      border: `1px solid ${stem.color}`,
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}>
                      <div style={{ fontSize: '32px' }}>{stem.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '8px' }}>{stem.name}</div>
                        <div style={{ 
                          background: '#2d1f4a', 
                          borderRadius: '4px', 
                          height: '8px',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            background: stem.color, 
                            width: `${60 + Math.random() * 40}%`, 
                            height: '100%',
                            borderRadius: '4px'
                          }} />
                        </div>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        defaultValue="100"
                        style={{ width: '80px', accentColor: stem.color }}
                      />
                      <button style={{
                        padding: '8px 12px',
                        background: stem.color,
                        color: 'white',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer'
                      }}>
                        ▶️
                      </button>
                      <button style={{
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer'
                      }}>
                        📥
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button style={{
                    flex: 1,
                    padding: '16px',
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer'
                  }}>
                    📦 Download All Stems (ZIP)
                  </button>
                  <button style={{
                    flex: 1,
                    padding: '16px',
                    background: 'rgba(34, 197, 94, 0.3)',
                    color: '#22c55e',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer'
                  }}>
                    🎵 Export Remix
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PODCAST STUDIO */}
        {activeTab === 'podcast' && (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>
              🎧 Podcast Studio
            </h1>
            <p style={{ color: '#a0a0a0', marginBottom: '24px' }}>
              Professional multi-track podcast recording with AI enhancement
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
              {/* Main Recording Area */}
              <div>
                {/* Waveform Display */}
                <div style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid #3d2f5a',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ color: 'white' }}>Recording</h3>
                    <div style={{ 
                      color: podcastRecording ? '#ef4444' : '#22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: podcastRecording ? '#ef4444' : '#22c55e',
                        animation: podcastRecording ? 'pulse 1s infinite' : 'none'
                      }} />
                      {podcastRecording ? 'Recording...' : 'Ready'}
                    </div>
                  </div>
                  
                  {/* Waveform */}
                  <div style={{
                    background: '#0f0a1a',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px',
                    height: '80px',
                    marginBottom: '16px'
                  }}>
                    {Array.from({ length: 60 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: '3px',
                          height: `${10 + Math.random() * 50}px`,
                          background: podcastRecording 
                            ? 'linear-gradient(180deg, #ef4444, #dc2626)' 
                            : 'linear-gradient(180deg, #8b5cf6, #ec4899)',
                          borderRadius: '2px'
                        }}
                      />
                    ))}
                  </div>

                  {/* Timer */}
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <span style={{ 
                      fontSize: '32px', 
                      fontWeight: 'bold', 
                      color: 'white',
                      fontFamily: 'monospace'
                    }}>
                      {String(Math.floor(podcastTime / 3600)).padStart(2, '0')}:
                      {String(Math.floor((podcastTime % 3600) / 60)).padStart(2, '0')}:
                      {String(podcastTime % 60).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Controls */}
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <button
                      onClick={() => {
                        setPodcastRecording(!podcastRecording);
                        if (!podcastRecording) {
                          const interval = setInterval(() => {
                            setPodcastTime(prev => prev + 1);
                          }, 1000);
                          (window as unknown as Record<string, number>).podcastInterval = interval as unknown as number;
                        } else {
                          clearInterval((window as unknown as Record<string, number>).podcastInterval);
                        }
                      }}
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: podcastRecording ? '#ef4444' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white',
                        fontSize: '28px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {podcastRecording ? '⏹' : '⏺'}
                    </button>
                    <button style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: '#22c55e',
                      color: 'white',
                      fontSize: '24px',
                      border: 'none',
                      cursor: 'pointer'
                    }}>
                      ▶
                    </button>
                  </div>
                </div>

                {/* Multi-Track View */}
                <div style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid #3d2f5a',
                  borderRadius: '16px',
                  padding: '24px'
                }}>
                  <h3 style={{ color: 'white', marginBottom: '20px' }}>🎚️ Multi-Track Mixer</h3>
                  
                  {[
                    { name: 'Host', color: '#8b5cf6', active: true },
                    { name: 'Co-Host', color: '#ec4899', active: true },
                    { name: 'Guest 1', color: '#22c55e', active: false },
                    { name: 'Guest 2', color: '#f59e0b', active: false }
                  ].map(track => (
                    <div key={track.name} style={{
                      background: 'rgba(15, 10, 26, 0.8)',
                      border: `1px solid ${track.active ? track.color : '#3d2f5a'}`,
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}>
                      <button style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: track.active ? track.color : '#3d2f5a',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer'
                      }}>
                        {track.active ? '🎙️' : '➕'}
                      </button>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '8px' }}>{track.name}</div>
                        <div style={{ 
                          background: '#2d1f4a', 
                          borderRadius: '4px', 
                          height: '8px',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            background: track.color, 
                            width: track.active ? `${40 + Math.random() * 50}%` : '0%', 
                            height: '100%',
                            borderRadius: '4px'
                          }} />
                        </div>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        defaultValue={track.active ? "80" : "0"}
                        style={{ width: '100px', accentColor: track.color }}
                      />
                      <button style={{
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#a0a0a0',
                        borderRadius: '6px',
                        fontSize: '12px',
                        border: 'none',
                        cursor: 'pointer'
                      }}>
                        M
                      </button>
                      <button style={{
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#a0a0a0',
                        borderRadius: '6px',
                        fontSize: '12px',
                        border: 'none',
                        cursor: 'pointer'
                      }}>
                        S
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div>
                {/* AI Tools */}
                <div style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid #3d2f5a',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ color: 'white', marginBottom: '16px' }}>🤖 AI Tools</h3>
                  {[
                    { label: 'Remove Filler Words', icon: '🗑️' },
                    { label: 'Level Audio', icon: '📊' },
                    { label: 'Reduce Noise', icon: '🔇' },
                    { label: 'Enhance Clarity', icon: '✨' },
                    { label: 'Generate Transcript', icon: '📝' },
                    { label: 'Create Show Notes', icon: '📋' }
                  ].map(tool => (
                    <button
                      key={tool.label}
                      onClick={() => alert(`${tool.label} - Processing...`)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(15, 10, 26, 0.8)',
                        border: '1px solid #3d2f5a',
                        borderRadius: '8px',
                        color: 'white',
                        textAlign: 'left',
                        cursor: 'pointer',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <span>{tool.icon}</span>
                      <span>{tool.label}</span>
                    </button>
                  ))}
                </div>

                {/* Sound Effects */}
                <div style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid #3d2f5a',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ color: 'white', marginBottom: '16px' }}>🔊 Sound Effects</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                      { label: '🎵 Intro', sound: 'intro' },
                      { label: '🎬 Outro', sound: 'outro' },
                      { label: '✨ Transition', sound: 'transition' },
                      { label: '👏 Applause', sound: 'applause' },
                      { label: '😂 Laugh', sound: 'laugh' },
                      { label: '🔔 Ding', sound: 'ding' },
                      { label: '📢 Horn', sound: 'horn' },
                      { label: '🥁 Drum', sound: 'drum' }
                    ].map(sfx => (
                      <button
                        key={sfx.label}
                        onClick={() => {
                          playSound(sfx.sound);
                        }}
                        style={{
                          padding: '12px',
                          background: 'rgba(15, 10, 26, 0.8)',
                          border: '1px solid #3d2f5a',
                          borderRadius: '8px',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        {sfx.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Export */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
                  border: '1px solid #8b5cf6',
                  borderRadius: '16px',
                  padding: '20px'
                }}>
                  <h3 style={{ color: 'white', marginBottom: '16px' }}>📤 Export</h3>
                  {['MP3', 'WAV', 'Video', 'Transcript'].map(format => (
                    <button
                      key={format}
                      onClick={() => alert(`Exporting as ${format}...`)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(139, 92, 246, 0.3)',
                        border: '1px solid #8b5cf6',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        marginBottom: '8px',
                        fontWeight: 'bold'
                      }}
                    >
                      Export {format}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRESETS */}
        {activeTab === 'presets' && (
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>
              🎛️ Vocal Presets
            </h1>
            <p style={{ color: '#a0a0a0', marginBottom: '24px' }}>
              One-click transformations • {presetLibrary.length} professional presets
            </p>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {['All', 'Legendary', 'Live', 'Studio', 'Podcast'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setPresetCategory(cat)}
                  style={{
                    padding: '12px 24px',
                    background: presetCategory === cat ? '#8b5cf6' : 'rgba(139, 92, 246, 0.2)',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  {cat === 'Legendary' && '👑 '}
                  {cat === 'Live' && '🎤 '}
                  {cat === 'Studio' && '🎧 '}
                  {cat === 'Podcast' && '🎙️ '}
                  {cat}
                </button>
              ))}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {presetLibrary
                .filter(p => presetCategory === 'All' || p.category === presetCategory)
                .map(preset => (
                <div
                  key={preset.id}
                  style={{
                    background: selectedPreset === preset.id 
                      ? `linear-gradient(135deg, ${preset.color}40, ${preset.color}20)`
                      : `linear-gradient(135deg, ${preset.color}20, ${preset.color}10)`,
                    border: selectedPreset === preset.id 
                      ? `2px solid ${preset.color}` 
                      : `1px solid ${preset.color}50`,
                    borderRadius: '16px',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <span style={{
                      fontSize: '11px',
                      background: `${preset.color}30`,
                      color: preset.color,
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontWeight: 'bold'
                    }}>
                      {preset.category === 'Legendary' && '👑 '}
                      {preset.category === 'Live' && '🎤 '}
                      {preset.category === 'Studio' && '🎧 '}
                      {preset.category === 'Podcast' && '🎙️ '}
                      {preset.category}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const heart = e.currentTarget;
                        heart.textContent = heart.textContent === '♡' ? '❤️' : '♡';
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#ec4899', fontSize: '20px', cursor: 'pointer' }}
                    >
                      ♡
                    </button>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>
                    {preset.name}
                  </h3>
                  <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '16px' }}>
                    {preset.desc}
                  </p>
                  {selectedPreset === preset.id ? (
                    <div style={{
                      width: '100%',
                      padding: '12px',
                      background: '#22c55e',
                      color: 'white',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}>
                      ✓ Applied
                    </div>
                  ) : (
                    <button 
                      onClick={() => applyPreset(preset)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: preset.color,
                        color: 'white',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        border: 'none'
                      }}
                    >
                      Apply Preset
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRICING */}
        {activeTab === 'pricing' && (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>
              Choose Your Plan
            </h1>
            <p style={{ color: '#a0a0a0', marginBottom: '32px' }}>
              Start creating professional music today
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              {/* Starter */}
              <div style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid #3d2f5a',
                borderRadius: '20px',
                padding: '32px'
              }}>
                <h3 style={{ color: '#a0a0a0', marginBottom: '8px' }}>Starter</h3>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                  $19<span style={{ fontSize: '18px', color: '#a0a0a0' }}>/mo</span>
                </div>
                <ul style={{ textAlign: 'left', color: '#a0a0a0', marginBottom: '24px', listStyle: 'none' }}>
                  <li style={{ marginBottom: '8px' }}>✓ Vocal Enhancement</li>
                  <li style={{ marginBottom: '8px' }}>✓ Auto-Tune</li>
                  <li style={{ marginBottom: '8px' }}>✓ Basic Presets</li>
                  <li style={{ marginBottom: '8px' }}>✓ Podcast Mode</li>
                  <li style={{ marginBottom: '8px', color: '#6b7280' }}>✗ Full Beatmaker</li>
                  <li style={{ marginBottom: '8px', color: '#6b7280' }}>✗ AI Songwriter</li>
                </ul>
                <button
                  onClick={() => openPayment('Starter', '$19/month', 19)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: '#8b5cf6',
                    color: 'white',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  Get Starter
                </button>
              </div>

              {/* Pro */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))',
                border: '2px solid #8b5cf6',
                borderRadius: '20px',
                padding: '32px',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  padding: '4px 16px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  MOST POPULAR
                </div>
                <h3 style={{ color: '#ec4899', marginBottom: '8px' }}>Pro</h3>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                  $49<span style={{ fontSize: '18px', color: '#a0a0a0' }}>/mo</span>
                </div>
                <ul style={{ textAlign: 'left', color: '#a0a0a0', marginBottom: '24px', listStyle: 'none' }}>
                  <li style={{ marginBottom: '8px' }}>✓ Everything in Starter</li>
                  <li style={{ marginBottom: '8px' }}>✓ Full Vocal Changer</li>
                  <li style={{ marginBottom: '8px' }}>✓ Live + Studio Modes</li>
                  <li style={{ marginBottom: '8px' }}>✓ Full Beatmaker</li>
                  <li style={{ marginBottom: '8px' }}>✓ AI Songwriter</li>
                  <li style={{ marginBottom: '8px' }}>✓ Stem Separation</li>
                </ul>
                <button
                  onClick={() => openPayment('Pro', '$49/month', 49)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    color: 'white',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  Get Pro
                </button>
              </div>

              {/* Lifetime */}
              <div style={{
                background: ownerUnlocked 
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))'
                  : 'rgba(245, 158, 11, 0.1)',
                border: ownerUnlocked ? '2px solid #22c55e' : '1px solid #f59e0b',
                borderRadius: '20px',
                padding: '32px',
                position: 'relative'
              }}>
                {ownerUnlocked && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#22c55e',
                    padding: '4px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>
                    👑 OWNER ACCESS
                  </div>
                )}
                <h3 style={{ color: '#f59e0b', marginBottom: '8px' }}>Lifetime</h3>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                  {ownerUnlocked ? (
                    <>
                      <span style={{ textDecoration: 'line-through', color: '#6b7280', fontSize: '24px' }}>$299</span>
                      {' '}
                      <span style={{ color: '#22c55e' }}>FREE</span>
                    </>
                  ) : (
                    <>$299<span style={{ fontSize: '18px', color: '#a0a0a0' }}> once</span></>
                  )}
                </div>
                <ul style={{ textAlign: 'left', color: '#a0a0a0', marginBottom: '24px', listStyle: 'none' }}>
                  <li style={{ marginBottom: '8px' }}>✓ Everything Forever</li>
                  <li style={{ marginBottom: '8px' }}>✓ All Future Updates</li>
                  <li style={{ marginBottom: '8px' }}>✓ Premium Presets</li>
                  <li style={{ marginBottom: '8px' }}>✓ Unlimited Exports</li>
                  <li style={{ marginBottom: '8px' }}>✓ Commercial Rights</li>
                  <li style={{ marginBottom: '8px' }}>✓ Priority Support</li>
                </ul>
                <button
                  onClick={() => {
                    if (ownerUnlocked) {
                      alert('Welcome Owner! Your Lifetime access is already active!');
                    } else {
                      openPayment('Lifetime', '$299 one-time', 299);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: ownerUnlocked ? '#22c55e' : '#f59e0b',
                    color: 'white',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  {ownerUnlocked ? '✓ Access Granted' : 'Get Lifetime'}
                </button>
              </div>
            </div>

            <p style={{ marginTop: '32px', color: '#6b7280', fontSize: '14px' }}>
              Press Ctrl+Shift+O for owner access
            </p>
          </div>
        )}
      </main>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(180deg, #1e1e3f, #0f0a1a)',
            border: '2px solid #8b5cf6',
            borderRadius: '24px',
            padding: '40px',
            width: '100%',
            maxWidth: '480px',
            position: 'relative'
          }}>
            {/* Close button */}
            <button
              onClick={() => setShowPaymentModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#a0a0a0',
                fontSize: '28px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>

            {paymentSuccess ? (
              // Success Screen
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '80px', marginBottom: '24px' }}>🎉</div>
                <h2 style={{ color: '#22c55e', fontSize: '28px', marginBottom: '12px' }}>
                  Payment Successful!
                </h2>
                <p style={{ color: '#a0a0a0', marginBottom: '8px' }}>
                  Welcome to {selectedPlan.name}!
                </p>
                <p style={{ color: '#8b5cf6', fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>
                  {selectedPlan.price}
                </p>
                <p style={{ color: '#a0a0a0', marginBottom: '24px' }}>
                  Your subscription is now active. Enjoy all the premium features!
                </p>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setActiveTab('studio');
                  }}
                  style={{
                    padding: '16px 48px',
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    color: 'white',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    cursor: 'pointer'
                  }}
                >
                  🎤 Start Creating
                </button>
              </div>
            ) : (
              // Payment Form
              <>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h2 style={{ color: 'white', fontSize: '24px', marginBottom: '8px' }}>
                    Subscribe to {selectedPlan.name}
                  </h2>
                  <div style={{ 
                    fontSize: '36px', 
                    fontWeight: 'bold', 
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {selectedPlan.price}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', color: '#a0a0a0', marginBottom: '8px', fontSize: '14px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: '#0f0a1a',
                      border: '2px solid #3d2f5a',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', color: '#a0a0a0', marginBottom: '8px', fontSize: '14px' }}>
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: '#0f0a1a',
                      border: '2px solid #3d2f5a',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', color: '#a0a0a0', marginBottom: '8px', fontSize: '14px' }}>
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').substring(0, 16);
                      const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
                      setCardNumber(formatted);
                    }}
                    placeholder="4242 4242 4242 4242"
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: '#0f0a1a',
                      border: '2px solid #3d2f5a',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      letterSpacing: '2px'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', color: '#a0a0a0', marginBottom: '8px', fontSize: '14px' }}>
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '').substring(0, 4);
                        if (value.length >= 2) {
                          value = value.substring(0, 2) + '/' + value.substring(2);
                        }
                        setExpiry(value);
                      }}
                      placeholder="MM/YY"
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: '#0f0a1a',
                        border: '2px solid #3d2f5a',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', color: '#a0a0a0', marginBottom: '8px', fontSize: '14px' }}>
                      CVC
                    </label>
                    <input
                      type="text"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                      placeholder="123"
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: '#0f0a1a',
                        border: '2px solid #3d2f5a',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '16px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={processPayment}
                  disabled={processing}
                  style={{
                    width: '100%',
                    padding: '18px',
                    background: processing 
                      ? '#6b7280' 
                      : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    color: 'white',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    cursor: processing ? 'not-allowed' : 'pointer',
                    marginBottom: '16px'
                  }}
                >
                  {processing ? '⏳ Processing Payment...' : `Pay ${selectedPlan.price}`}
                </button>

                <div style={{ 
                  textAlign: 'center', 
                  color: '#6b7280', 
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <span>🔒</span>
                  <span>Secured with 256-bit SSL encryption</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Owner Modal */}
      {showOwnerModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1a1025',
            border: '1px solid #8b5cf6',
            borderRadius: '20px',
            padding: '32px',
            width: '400px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: 'white', marginBottom: '16px' }}>🔐 Owner Access</h2>
            <p style={{ color: '#a0a0a0', marginBottom: '24px' }}>Enter secret code:</p>
            <input
              type="password"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              placeholder="Enter code..."
              style={{
                width: '100%',
                padding: '16px',
                background: '#0f0a1a',
                border: '1px solid #3d2f5a',
                borderRadius: '12px',
                color: 'white',
                marginBottom: '16px',
                fontSize: '16px'
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowOwnerModal(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#2d1f4a',
                  color: 'white',
                  borderRadius: '12px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={verifyOwner}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: 'bold'
                }}
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
