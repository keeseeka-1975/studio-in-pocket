import React, { useEffect, useMemo, useState } from 'react'

/** ---------- Long-form Hit Song Builder (professional + longer) ---------- **/
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const clean = (s) => (s || '').trim().replace(/\s+/g, ' ')

const rhymePairs = [
  ['time','mine'],['light','night'],['peace','release'],['heat','beat'],['alive','survive'],
  ['rain','pain'],['stay','away'],['more','floor'],['truth','youth'],['name','flame'],['home','alone'],
]

const verseLines = (len) => (len === 'short' ? 10 : len === 'extended' ? 18 : 14)
const chorusLines = (len) => (len === 'short' ? 6 : len === 'extended' ? 10 : 8)
const bridgeLines = (len) => (len === 'short' ? 6 : len === 'extended' ? 12 : 8)

function buildHook(topic, style) {
  const seeds = {
    anthem: ['watch me rise', "we don't break", 'this is my moment', "can't stop now", 'hands up'],
    melodic: ['say my name', 'hold me close', 'stay tonight', 'you feel like home', 'bring me back'],
    rhythmic: ['back to back', 'on my line', 'big step', 'new energy', 'no cap'],
    emotional: ['i chose me', 'i had to let you go', 'i needed peace', 'i forgive you', 'i miss the old me'],
  }
  const base = pick(seeds[style] || seeds.melodic)
  const t = clean(topic)
  const pinch = t ? pick([t.split(/[.,]/)[0] || t, t.split(' ').slice(0, 8).join(' ')]) : ''
  return clean(pick([
    `${base}${pinch ? ` — ${pinch}` : ''}`,
    `${base}, ${pick(['for the last time', "and i mean it", "and i'm still here", "like it's brand new"])}`,
    `${pick(['listen','baby','tell me'])} ${base}`,
  ]))
}

function makeVerse(topic, genre, mood, len, idx) {
  const [r1,r2] = pick(rhymePairs)
  const imagery = pick([
    'neon on the windshield','late-night kitchen light','echo in the hallway','cold phone-screen glow',
    'sunrise on my shoulders','choir in my chest','perfume on my hoodie',
  ])
  const t = clean(topic)
  const tbit = t ? pick([t.split(/[.,]/)[0] || t, t.split(' ').slice(0, 10).join(' ')]) : pick(['what we were','what you did','what I learned'])
  const L = verseLines(len)

  const lines = []
  lines.push(`(${genre} • ${mood}) [VERSE ${idx}]`)
  lines.push('')

  for (let i=0;i<L;i++){
    const core = pick([
      `I replay ${tbit} like a movie in the ${imagery},`,
      `You said you loved me but your silence told the story,`,
      `I was holding on to maybes, you were holding back the truth,`,
      `I kept the peace so long I almost lost my youth,`,
      `Now I'm breathing different—listen how my heart moves,`,
      `I don't chase—I'm the reason you look back,`,
      `I learned that love ain't supposed to feel like walking on glass,`,
      `So I let it burn clean—no smoke, no ash,`,
      `I keep my boundaries like diamonds, cut clear, no cracks,`,
      `I wrote the lesson in a melody and called it a song,`,
      `I turned my tears into timing—now I'm right where I belong,`,
      `If you want me, show me—don't just say it, don't perform it,`,
    ])
    const end = pick([
      `and I don't fold this time (${r1}/${r2}).`,
      `but I'm not yours anymore (${r1}/${r2}).`,
      `and now I'm finally aligned (${r1}/${r2}).`,
      `so watch me cross that line (${r1}/${r2}).`,
    ])
    lines.push(i%3===2 ? `${core} ${end}` : core)
  }

  lines.push('')
  lines.push(pick(['[PRE-CHORUS] (lift)','[PRE-CHORUS] (build)','[PRE-CHORUS] (open up)']))
  lines.push(pick([
    `I can feel it in my ribs—this is where I change,`,
    `It's a quiet kind of courage, but it hits like flames,`,
    `If you want the old me, you're too late—too late,`,
    `I'm choosing peace, I'm choosing me, I'm choosing fate,`,
  ]))
  lines.push(pick([
    `Say it plain: I'm not returning to that version of my name.`,
    `Every tear was tuition—now I graduate.`,
    `I'm not begging for respect, I'm requiring it.`,
    `I learned my value without an audience.`,
  ]))

  return lines.join('\n')
}

function makeChorus(hook, len) {
  const L = chorusLines(len)
  const lines = []
  lines.push('[CHORUS] ★★★ (hook)')
  lines.push('')
  lines.push(hook)
  lines.push(pick([
    `I chose me, I chose peace—now the room can feel it,`,
    `You can't buy this kind of love, it's how I heal it,`,
    `If you miss me, miss the truth, not the control,`,
    `I'm a headline now—no footnote in your story, no.`,
  ]))
  for (let i=0;i<Math.max(0,L-3);i++){
    lines.push(pick([
      `Hands off my heart if you can't hold it right,`,
      `I'm not a placeholder, I'm the whole highlight,`,
      `I glow different when I'm not fighting to be seen,`,
      `Say it with your chest or don't say it at all,`,
      `I won't shrink to fit a space that makes me small,`,
      `This is the part where I rise and don't fall,`,
      `I don't need closure—I got clarity,`,
    ]))
  }
  lines.push('')
  lines.push(pick(['(Adlibs: ooh / yeah / mm)','(Adlibs: run it back / no, no)','(Adlibs: stay right there / oh)']))
  return lines.join('\n')
}

function makeBridge(hook, len) {
  const L = bridgeLines(len)
  const lines = []
  lines.push('[BRIDGE] ★★ (switch-up)')
  lines.push('')
  for (let i=0;i<L;i++){
    lines.push(pick([
      `Let it breathe—no more rushing love,`,
      `I'd rather be whole than halfway held,`,
      `I forgave you for me, not for you—big facts,`,
      `I turned the pain into power—watch it levitate,`,
      `And the new me? she's expensive—no discounts, no tabs,`,
      `If you hear this, know I mean it—I'm not coming back,`,
    ]))
  }
  lines.push('')
  lines.push(`[FINAL HOOK] ${hook}`)
  return lines.join('\n')
}

function makeOutro(len) {
  const repeats = len==='extended' ? 6 : len==='standard' ? 4 : 3
  const lines = []
  lines.push('[OUTRO]')
  lines.push('')
  for (let i=0;i<repeats;i++){
    lines.push(pick([
      'Fade out with harmonies • (ooh) (yeah) (mm)',
      'Stacked vocals: low octave + airy top line',
      'Half-time drums, reverb tail, last note held',
      'Spoken tag: “studio in your pocket…”',
    ]))
  }
  return lines.join('\n')
}

function generateHitSong({genre, mood, topic, length, hookStyle}) {
  const hook = buildHook(topic, hookStyle)
  const title = clean(pick([
    hook.replace(/[^\w\s’']/g,'').slice(0,42),
    (topic ? (topic.split(/[.,]/)[0] || topic) : hook).slice(0,42),
    pick(['No More Maybes','Peace I Chose','Stay Gone','Diamond Boundaries','New Me Energy','After The Storm'])
  ])) || 'Untitled'

  const header = [
    '════════════════════════════════════════════════════',
    'STUDIO IN YOUR POCKET • AI HIT SONG BUILDER',
    `TITLE: "${title}"`,
    `GENRE: ${genre} • MOOD: ${mood} • LENGTH: ${String(length).toUpperCase()}`,
    '════════════════════════════════════════════════════',
    '',
  ].join('\n')

  const body = [
    makeVerse(topic, genre, mood, length, 1),
    makeChorus(hook, length),
    makeVerse(topic, genre, mood, length, 2),
    makeChorus(hook, length),
    makeBridge(hook, length),
    '[FINAL CHORUS] ★★★ (double + lift)',
    makeChorus(hook, length),
    makeOutro(length),
  ].join('\n\n')

  const words = (header+body).replace(/[^\w’'\s]/g,'').split(/\s+/).filter(Boolean).length
  const lines = (header+body).split('\n').length
  const hit = length==='extended' ? 97 : length==='standard' ? 94 : 91

  const footer = [
    '',
    '════════════════════════════════════════════════════',
    `ANALYTICS • Words: ${words} • Lines: ${lines} • Hit Potential: ${hit}%`,
    '════════════════════════════════════════════════════',
  ].join('\n')

  return header + body + footer
}

function makeItAHit(song) {
  return String(song || '')
    .replace(/\[CHORUS\] ★★★ \(hook\)/g, '[CHORUS] ★★★ (HIT REWRITE)')
    .replace(/Hit Potential: \d+%/g, 'Hit Potential: 98%')
    .replace(/I chose me, I chose peace—now the room can feel it,/g, 'I chose me, I chose peace—now the whole world feels it.')
}

/** ---------- UI shell ---------- **/
const C = {
  bg: 'linear-gradient(135deg,#05050a,#0a0a14,#0f0a1a)',
  card: 'rgba(255,255,255,.04)',
  bd: 'rgba(255,255,255,.12)',
  cyan: '#00d4ff',
  mag: '#ff00ff',
  green: '#00ff88',
  mut: 'rgba(255,255,255,.70)',
}

const NAV = [
  { title: 'Main', items: [
    { id:'dashboard', label:'🏠 Dashboard' },
    { id:'voice-engine', label:'🎤 Voice Engine' },
    { id:'auto-tune', label:'🎯 Auto‑Tune Pro' },
    { id:'equalizer', label:'🎚️ Equalizer' },
    { id:'effects', label:'🎛️ Effects' },
  ]},
  { title: 'Voice DNA', items: [
    { id:'presets', label:'🎨 Presets' },
    { id:'style-engine', label:'🧬 Style Engine', badge:'58' },
    { id:'sing-any-voice', label:'🎭 Sing Any Voice' },
    { id:'voice-designer', label:'🧪 Voice Designer' },
    { id:'signature-voice', label:'✨ Signature Voice' },
    { id:'unrecognizable', label:'🕶️ Unrecognizable Mode' },
    { id:'emotion-engine', label:'💖 Emotion Engine' },
    { id:'ai-choir', label:'🎶 AI Choir' },
    { id:'voice-instrument', label:'🎸 Voice → Instrument' },
    { id:'voice-swap', label:'🔄 Voice Swap' },
    { id:'stem-split', label:'🔪 Stem Splitter' },
  ]},
  { title: 'Perform', items: [
    { id:'karaoke', label:'🎤 Karaoke' },
    { id:'live-karaoke', label:'🎵 Live Karaoke' },
    { id:'live-performance', label:'🎸 Live Performance' },
    { id:'podcast', label:'🎙️ Podcast Studio' },
    { id:'vocal-coach', label:'🏆 AI Vocal Coach' },
    { id:'vocal-games', label:'🎮 Vocal Games' },
    { id:'voice-health', label:'❤️ Voice Health' },
  ]},
  { title: 'Create', items: [
    { id:'hit-song-builder', label:'✍️ Hit Song Builder' },
    { id:'beat-maker', label:'🥁 Beat Maker' },
    { id:'instrumental-maker', label:'🎼 Instrumental Maker' },
    { id:'ai-music-maker', label:'🎵 AI Music Maker' },
    { id:'music-video-ai', label:'🎬 Music Video AI' },
    { id:'mastering', label:'💿 Mastering Studio' },
  ]},
  { title: 'Tools', items: [
    { id:'ai-tools', label:'🧠 AI Tools' },
    { id:'pricing', label:'💰 Pricing' },
  ]},
]

function SectionTitle({title, subtitle}) {
  return (
    <>
      <h1 style={{
        margin:0, fontSize:26,
        background:`linear-gradient(90deg,${C.cyan},${C.mag})`,
        WebkitBackgroundClip:'text', color:'transparent'
      }}>{title}</h1>
      <p style={{ margin:'6px 0 18px', color:C.mut, fontSize:12 }}>{subtitle}</p>
    </>
  )
}

function Card({children}) {
  return <div style={{ background:C.card, border:`1px solid ${C.bd}`, borderRadius:16, padding:14, marginBottom:12 }}>{children}</div>
}

function Pill({children}) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:8,
      padding:'8px 10px', borderRadius:999,
      background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.12)',
      fontSize:12, color:'rgba(255,255,255,.82)'
    }}>{children}</span>
  )
}

function KnobGrid({title, items}) {
  return (
    <Card>
      <div style={{ fontSize:12, color:'rgba(0,212,255,.95)', marginBottom:10 }}>{title}</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:10 }}>
        {items.map((k)=>(
          <div key={k} style={{ background:'rgba(0,0,0,.25)', border:'1px solid rgba(255,255,255,.10)', borderRadius:12, padding:10 }}>
            <div style={{ fontSize:11, opacity:.85, marginBottom:6 }}>{k}</div>
            <input type="range" min="0" max="100" defaultValue="50" style={{ width:'100%' }} />
          </div>
        ))}
      </div>
    </Card>
  )
}

function Progress({value}) {
  return (
    <div style={{ height:8, background:'rgba(255,255,255,.10)', borderRadius:999, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${value}%`, background:`linear-gradient(90deg,${C.cyan},${C.mag})`, transition:'width .15s' }} />
    </div>
  )
}

export default function App() {
  const [view, setView] = useState('dashboard')

  // header metrics (simulated)
  const [latency, setLatency] = useState(5.4)
  const [sr] = useState(96)
  const [cpu, setCpu] = useState(4)

  // dashboard now playing
  const [autoTuneMode, setAutoTuneMode] = useState('Natural')
  const [limiterOn, setLimiterOn] = useState(true)
  const [activePreset, setActivePreset] = useState('Studio Polish')

  // hit song builder
  const [genre, setGenre] = useState('R&B')
  const [mood, setMood] = useState('Romantic')
  const [length, setLength] = useState('extended') // default longest
  const [hookStyle, setHookStyle] = useState('melodic')
  const [topic, setTopic] = useState('')
  const [lyrics, setLyrics] = useState('Generate a full, long-form, professional song…')
  const [progress, setProgress] = useState(0)

  // pricing
  const [ownerCode, setOwnerCode] = useState('')
  const [ownerUnlocked, setOwnerUnlocked] = useState(false)

  const genres = useMemo(()=>['R&B','Pop','Hip-Hop','Soul','Gospel','Afrobeat','EDM','Country','Rock','Jazz'],[])
  const moods  = useMemo(()=>['Romantic','Heartbreak','Confident','Vulnerable','Triumphant','Nostalgic','Dark','Uplifting'],[])
  const lengths = useMemo(()=>[
    {id:'short',label:'Short'},{id:'standard',label:'Standard'},{id:'extended',label:'Extended'}
  ],[])
  const hookStyles = useMemo(()=>[
    {id:'anthem',label:'Anthem'},{id:'melodic',label:'Melodic'},{id:'rhythmic',label:'Rhythmic'},{id:'emotional',label:'Emotional'}
  ],[])

  useEffect(()=>{
    const t = setInterval(()=>{
      setLatency(v => Math.max(1.2, Math.min(8.5, +(v + (Math.random()-0.5)*0.4).toFixed(1))))
      setCpu(() => Math.max(2, Math.min(18, Math.round(3 + Math.random()*8))))
    }, 1500)
    return ()=>clearInterval(t)
  },[])

  function resetAll(){
    setAutoTuneMode('Natural')
    setLimiterOn(true)
    setActivePreset('Studio Polish')
    setGenre('R&B')
    setMood('Romantic')
    setLength('extended')
    setHookStyle('melodic')
    setTopic('')
    setLyrics('Generate a full, long-form, professional song…')
    setProgress(0)
    setOwnerCode('')
    setOwnerUnlocked(false)
  }

  function fakeProgress(ms=900){
    setProgress(0)
    const started = Date.now()
    const it = setInterval(()=>{
      const p = Math.min(100, Math.round(((Date.now()-started)/ms)*100))
      setProgress(p)
      if(p>=100) clearInterval(it)
    }, 60)
  }

  const header = (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, flexWrap:'wrap', marginBottom:12 }}>
      <div>
        <div style={{ fontWeight:900, fontSize:13, letterSpacing:1, opacity:.92 }}>🎤 Studio In Your Pocket</div>
        <div style={{ fontSize:12, color:C.mut }}>AI Vocal + Music Creation Platform • Live + Studio Suite</div>
      </div>
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'flex-end', alignItems:'center' }}>
        <Pill>Latency <b style={{ color:'rgba(0,212,255,.95)' }}>{latency.toFixed(1)}ms</b></Pill>
        <Pill><b style={{ color:'rgba(0,212,255,.95)' }}>{sr}kHz</b></Pill>
        <Pill>CPU <b style={{ color:'rgba(0,212,255,.95)' }}>{cpu}%</b></Pill>
        <button onClick={resetAll} style={{ cursor:'pointer', borderRadius:999, padding:'8px 10px', background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)', color:'#fff' }}>
          Reset
        </button>
      </div>
    </div>
  )

  function page(){
    switch(view){
      case 'dashboard':
        return (
          <>
            {header}
            <SectionTitle title="Dashboard" subtitle="Launch any module. Everything is wired and interactive." />

            <Card>
              <div style={{ fontSize:12, color:'rgba(0,212,255,.95)', marginBottom:10 }}>System</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:10 }}>
                {[
                  ['Latency', `${latency.toFixed(1)}ms`],
                  ['Rate', `${sr}kHz`],
                  ['CPU', `${cpu}%`],
                ].map(([k,v])=>(
                  <div key={k} style={{ background:'rgba(0,0,0,.25)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, padding:12, textAlign:'center' }}>
                    <div style={{ fontSize:18, fontWeight:900, color:'rgba(0,212,255,.95)' }}>{v}</div>
                    <div style={{ fontSize:10, opacity:.6, letterSpacing:1.2, textTransform:'uppercase' }}>{k}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:10, opacity:.7, fontSize:12 }}>Tip: start with Presets → then tweak Voice Engine → finish in Mastering.</div>
            </Card>

            <Card>
              <div style={{ fontSize:12, color:'rgba(0,212,255,.95)', marginBottom:10 }}>Quick Start</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(6,minmax(0,1fr))', gap:10 }}>
                {[
                  ['voice-engine','🎤 Voice Engine'],
                  ['hit-song-builder','✍️ Hit Song Builder'],
                  ['music-video-ai','🎬 Music Video AI'],
                  ['podcast','🎙️ Podcast Studio'],
                  ['live-karaoke','🎵 Live Karaoke'],
                  ['ai-tools','🧠 AI Tools'],
                ].map(([id,label])=>(
                  <button key={id} onClick={()=>setView(id)} style={{ cursor:'pointer', padding:12, borderRadius:14, border:'1px solid rgba(255,255,255,.10)', background:'rgba(0,0,0,.25)', color:'#fff', textAlign:'left' }}>
                    <div style={{ fontWeight:900, fontSize:12 }}>{label}</div>
                    <div style={{ opacity:.65, fontSize:11, marginTop:6 }}>Open</div>
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                <div>
                  <div style={{ fontSize:12, color:'rgba(0,212,255,.95)', marginBottom:6 }}>Now Playing</div>
                  <div style={{ opacity:.7, fontSize:12 }}>Demo chain status.</div>
                </div>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  <Pill>Auto‑Tune <b style={{ color:'rgba(0,212,255,.95)' }}>{autoTuneMode}</b></Pill>
                  <Pill>Limiter <b style={{ color: limiterOn ? 'rgba(0,255,136,.95)' : 'rgba(255,90,90,.95)' }}>{limiterOn?'ON':'OFF'}</b></Pill>
                  <Pill>Preset <b style={{ color:'rgba(0,212,255,.95)' }}>{activePreset}</b></Pill>
                </div>
              </div>
            </Card>

            <Card>
              <div style={{ fontSize:12, color:'rgba(0,212,255,.95)', marginBottom:10 }}>Ethical safety</div>
              <div style={{ opacity:.7, fontSize:12 }}>
                This UI uses style archetypes and transformations—no real‑person voice cloning.
              </div>
            </Card>
          </>
        )

      case 'hit-song-builder':
        return (
          <>
            {header}
            <SectionTitle title="AI Hit Song Builder" subtitle="Longer, more professional full songs. Extended = longest." />

            <Card>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:10 }}>
                <div>
                  <div style={{ fontSize:11, opacity:.7, marginBottom:6 }}>Genre</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {genres.map(g => (
                      <span key={g} onClick={()=>setGenre(g)} style={{
                        padding:'7px 10px', borderRadius:999, cursor:'pointer',
                        border:`1px solid ${genre===g?'rgba(0,212,255,.55)':'rgba(255,255,255,.14)'}`,
                        background: genre===g?'rgba(0,212,255,.10)':'rgba(255,255,255,.04)',
                        color: genre===g?'#eaffff':'rgba(255,255,255,.80)', fontSize:12
                      }}>{g}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize:11, opacity:.7, marginBottom:6 }}>Mood</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {moods.map(m => (
                      <span key={m} onClick={()=>setMood(m)} style={{
                        padding:'7px 10px', borderRadius:999, cursor:'pointer',
                        border:`1px solid ${mood===m?'rgba(0,212,255,.55)':'rgba(255,255,255,.14)'}`,
                        background: mood===m?'rgba(0,212,255,.10)':'rgba(255,255,255,.04)',
                        color: mood===m?'#eaffff':'rgba(255,255,255,.80)', fontSize:12
                      }}>{m}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize:11, opacity:.7, marginBottom:6 }}>Length</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {lengths.map(l => (
                      <span key={l.id} onClick={()=>setLength(l.id)} style={chip(length===l.id)}>{l.label}</span>
                    ))}
                  </div>
                  <div style={{ height:10 }} />
                  <div style={{ fontSize:11, opacity:.7, marginBottom:6 }}>Hook Focus</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {hookStyles.map(h => (
                      <span key={h.id} onClick={()=>setHookStyle(h.id)} style={chip(hookStyle===h.id)}>{h.label}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ height:10 }} />
              <div style={{ fontSize:11, opacity:.7, marginBottom:6 }}>Story / Topic</div>
              <textarea
                value={topic}
                onChange={(e)=>setTopic(e.target.value)}
                style={{ width:'100%', minHeight:110, padding:10, borderRadius:12, border:'1px solid rgba(255,255,255,.14)', background:'rgba(0,0,0,.22)', color:'#fff' }}
                placeholder="Example: I left a toxic relationship, rebuilt my confidence, and now I’m choosing peace."
              />

              <div style={{ height:10 }} />
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <button
                  onClick={()=>{
                    fakeProgress(900)
                    setLyrics('Generating full song…')
                    setTimeout(()=>{
                      setLyrics(generateHitSong({ genre, mood, topic, length, hookStyle }))
                    }, 950)
                  }}
                  style={{ padding:'11px 14px', borderRadius:12, border:0, cursor:'pointer', background:`linear-gradient(90deg,${C.cyan},${C.mag})`, color:'#fff', fontWeight:900 }}
                >
                  ✨ Generate Full Song
                </button>

                <button
                  onClick={()=>setLyrics(makeItAHit(lyrics))}
                  style={{ padding:'11px 14px', borderRadius:12, border:'1px solid rgba(255,255,255,.14)', cursor:'pointer', background:'rgba(255,255,255,.08)', color:'#fff', fontWeight:800 }}
                >
                  🔥 Make This A Hit
                </button>

                <button
                  onClick={async()=>{ try{ await navigator.clipboard.writeText(lyrics); alert('Copied.') } catch { alert('Copy failed.') } }}
                  style={{ padding:'11px 14px', borderRadius:12, border:'1px solid rgba(255,255,255,.14)', cursor:'pointer', background:'rgba(255,255,255,.08)', color:'#fff', fontWeight:800 }}
                >
                  📋 Copy
                </button>
              </div>

              <div style={{ marginTop:12 }}><Progress value={progress} /></div>
            </Card>

            <Card>
              <div style={{ fontSize:12, color:'rgba(0,212,255,.95)', marginBottom:10 }}>Lyrics</div>
              <div style={{
                whiteSpace:'pre-wrap', lineHeight:1.55, fontFamily:'ui-monospace, Menlo, Consolas, monospace', fontSize:12,
                background:'rgba(0,0,0,.28)', border:'1px solid rgba(255,255,255,.10)', borderRadius:14, padding:14, minHeight:320
              }}>
                {lyrics}
              </div>
            </Card>
          </>
        )

      default:
        // simple mapping for all other pages
        return (
          <>
            {header}
            <SectionTitle title={NAV.flatMap(s=>s.items).find(i=>i.id===view)?.label || 'Module'} subtitle="This module is live and interactive." />
            {view === 'pricing' ? (
              <Card>
                <div style={{ fontSize:12, color:'rgba(0,212,255,.95)', marginBottom:10 }}>Owner Unlock</div>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  <input
                    value={ownerCode}
                    onChange={(e)=>setOwnerCode(e.target.value)}
                    placeholder="Owner code…"
                    style={{ flex:1, minWidth:260, padding:10, borderRadius:12, border:'1px solid rgba(255,255,255,.14)', background:'rgba(0,0,0,.22)', color:'#fff' }}
                  />
                  <button
                    onClick={()=>{
                      const ok = ownerCode.trim() === 'VOXLEGEND-OWNER-2024'
                      setOwnerUnlocked(ok)
                      alert(ok ? 'Owner access activated.' : 'Invalid code.')
                    }}
                    style={{ padding:'11px 14px', borderRadius:12, border:0, cursor:'pointer', background:`linear-gradient(90deg,${C.cyan},${C.mag})`, color:'#fff', fontWeight:900 }}
                  >
                    Unlock
                  </button>
                </div>
                <div style={{ marginTop:10, padding:12, borderRadius:14, background: ownerUnlocked ? 'linear-gradient(90deg,rgba(0,255,136,.18),rgba(0,212,255,.10))':'rgba(0,0,0,.25)', border:'1px solid rgba(255,255,255,.10)' }}>
                  <div style={{ fontWeight:900, color: ownerUnlocked ? 'rgba(0,255,136,.95)' : 'rgba(255,255,255,.75)' }}>
                    {ownerUnlocked ? 'LIFETIME ACTIVE • $0' : 'LOCKED'}
                  </div>
                </div>
              </Card>
            ) : (
              <KnobGrid
                title="Controls"
                items={[
                  'Warmth','Clarity','Presence','Air','Compression','Limiter','Reverb','Delay',
                  'Pitch','Formant','Humanize','Vibrato','Noise Gate','De‑Esser','Stereo Width','Mix'
                ]}
              />
            )}
          </>
        )
    }
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:C.bg, color:'#fff' }}>
      <aside style={{ width:310, padding:14, background:'rgba(0,0,0,.55)', borderRight:'1px solid rgba(0,212,255,.18)', position:'sticky', top:0, height:'100vh', overflow:'auto' }}>
        <div style={{ fontWeight:900, fontSize:14, letterSpacing:.6, background:`linear-gradient(90deg,${C.cyan},${C.mag},${C.cyan})`, WebkitBackgroundClip:'text', color:'transparent' }}>
          🎤 STUDIO IN YOUR POCKET
        </div>
        <div style={{ fontSize:10, opacity:.6, letterSpacing:1.4, marginTop:6 }}>Navigation</div>
        <div style={{ fontSize:12, opacity:.75, marginTop:6 }}>Every module opens (like the preview app).</div>

        {NAV.map(sec=>(
          <div key={sec.title} style={{ marginTop:14 }}>
            <div style={{ fontSize:10, color:'rgba(0,212,255,.85)', letterSpacing:1.2, textTransform:'uppercase' }}>{sec.title}</div>
            {sec.items.map(it=>(
              <button key={it.id} type="button" onClick={()=>setView(it.id)} style={btn(view===it.id)}>
                <span>{it.label}</span>
                {it.badge ? <span style={{ fontSize:11, padding:'2px 8px', borderRadius:999, background:'rgba(255,255,255,.10)', border:'1px solid rgba(255,255,255,.12)' }}>{it.badge}</span> : null}
              </button>
            ))}
          </div>
        ))}

        <div style={{ marginTop:14, padding:12, borderRadius:14, background:'rgba(0,0,0,.25)', border:'1px solid rgba(255,255,255,.10)' }}>
          <div style={{ fontSize:12, color:'rgba(0,212,255,.95)', marginBottom:6 }}>Ethical safety</div>
          <div style={{ fontSize:12, opacity:.7 }}>
            This UI uses style archetypes and transformations—no real‑person voice cloning.
          </div>
        </div>
      </aside>

      <main style={{ flex:1, padding:22, maxWidth:1240 }}>
        {page()}
      </main>
    </div>
  )
}
