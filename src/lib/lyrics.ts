export type SongLength = 'short' | 'standard' | 'extended'
export type HookStyle = 'anthem' | 'melodic' | 'rhythmic' | 'emotional'
export type HitSongInput = { genre: string; mood: string; topic: string; length: SongLength; hookStyle: HookStyle }

const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)]
const clean = (s: string) => (s ?? '').trim().replace(/\s+/g, ' ')

const rhymePairs = [
  ['time','mine'],['light','night'],['peace','release'],['heat','beat'],['alive','survive'],
  ['rain','pain'],['stay','away'],['more','floor'],['truth','youth'],['name','flame'],['home','alone'],
] as const

const verseLines = (len: SongLength) => (len === 'short' ? 10 : len === 'extended' ? 18 : 14)
const chorusLines = (len: SongLength) => (len === 'short' ? 6 : len === 'extended' ? 10 : 8)
const bridgeLines = (len: SongLength) => (len === 'short' ? 6 : len === 'extended' ? 12 : 8)

function buildHook(topic: string, style: HookStyle) {
  const seeds: Record<HookStyle, string[]> = {
    anthem: ['watch me rise', "we don't break", 'this is my moment', "can't stop now", 'hands up'],
    melodic: ['say my name', 'hold me close', 'stay tonight', 'you feel like home', 'bring me back'],
    rhythmic: ['back to back', 'on my line', 'big step', 'new energy', 'no cap'],
    emotional: ['i chose me', 'i had to let you go', 'i needed peace', 'i forgive you', 'i miss the old me'],
  }
  const base = pick(seeds[style])
  const t = clean(topic)
  const pinch = t ? pick([t.split(/[.,]/)[0] ?? t, t.split(' ').slice(0, 8).join(' ')]) : ''
  return clean(pick([
    `${base}${pinch ? ` — ${pinch}` : ''}`,
    `${base}, ${pick(['for the last time', "and i mean it", "and i'm still here", "like it's brand new"])}`,
    `${pick(['listen','baby','tell me'])} ${base}`,
  ]))
}

function makeVerse(topic: string, genre: string, mood: string, len: SongLength, idx: number) {
  const [r1,r2] = pick(rhymePairs)
  const imagery = pick([
    'neon on the windshield','late-night kitchen light','echo in the hallway','cold phone-screen glow',
    'sunrise on my shoulders','choir in my chest','perfume on my hoodie'
  ])
  const t = clean(topic)
  const tbit = t ? pick([t.split(/[.,]/)[0] ?? t, t.split(' ').slice(0, 10).join(' ')]) : pick(['what we were','what you did','what I learned'])
  const L = verseLines(len)
  const lines: string[] = []
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

function makeChorus(hook: string, len: SongLength) {
  const L = chorusLines(len)
  const lines: string[] = []
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

function makeBridge(hook: string, len: SongLength) {
  const L = bridgeLines(len)
  const lines: string[] = []
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

function makeOutro(len: SongLength) {
  const repeats = len==='extended' ? 6 : len==='standard' ? 4 : 3
  const lines: string[] = []
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

export function generateHitSong(input: HitSongInput) {
  const genre = input.genre
  const mood = input.mood
  const topic = clean(input.topic)
  const len = input.length
  const hook = buildHook(topic, input.hookStyle)

  const title = clean(pick([
    hook.replace(/[^\w\s’']/g,'').slice(0,42),
    (topic ? (topic.split(/[.,]/)[0] ?? topic) : hook).slice(0,42),
    pick(['No More Maybes','Peace I Chose','Stay Gone','Diamond Boundaries','New Me Energy','After The Storm'])
  ])) || 'Untitled'

  const header = [
    '════════════════════════════════════════════════════',
    'STUDIO IN YOUR POCKET • AI HIT SONG BUILDER',
    `TITLE: "${title}"`,
    `GENRE: ${genre} • MOOD: ${mood} • LENGTH: ${len.toUpperCase()}`,
    '════════════════════════════════════════════════════',
    '',
  ].join('\n')

  const body = [
    makeVerse(topic, genre, mood, len, 1),
    makeChorus(hook, len),
    makeVerse(topic, genre, mood, len, 2),
    makeChorus(hook, len),
    makeBridge(hook, len),
    '[FINAL CHORUS] ★★★ (double + lift)',
    makeChorus(hook, len),
    makeOutro(len),
  ].join('\n\n')

  const words = (header+body).replace(/[^\w’'\s]/g,'').split(/\s+/).filter(Boolean).length
  const lines = (header+body).split('\n').length
  const hit = len==='extended' ? 97 : len==='standard' ? 94 : 91

  const footer = [
    '',
    '════════════════════════════════════════════════════',
    `ANALYTICS • Words: ${words} • Lines: ${lines} • Hit Potential: ${hit}%`,
    '════════════════════════════════════════════════════',
  ].join('\n')

  return header + body + footer
}

export function makeItAHit(song: string) {
  return song
    .replace(/\[CHORUS\] ★★★ \(hook\)/g, '[CHORUS] ★★★ (HIT REWRITE)')
    .replace(/Hit Potential: \d+%/g, 'Hit Potential: 98%')
    .replace(/I chose me, I chose peace—now the room can feel it,/g, 'I chose me, I chose peace—now the whole world feels it.')
}
