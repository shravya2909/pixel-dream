// All sound effects are synthesized with the Web Audio API — no audio files.

let ctx: AudioContext | null = null
let muted = false

export function setMuted(value: boolean): void {
  muted = value
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** Must be called after the first user gesture so browsers allow audio playback. */
export function initAudio(): void {
  getCtx()
}

interface ToneOpts {
  freq: number
  duration: number
  type?: OscillatorType
  gain?: number
  delay?: number
  glideTo?: number
}

function tone({ freq, duration, type = 'square', gain = 0.08, delay = 0, glideTo }: ToneOpts): void {
  if (muted) return
  const audioCtx = getCtx()
  if (!audioCtx) return
  const start = audioCtx.currentTime + delay
  const osc = audioCtx.createOscillator()
  const amp = audioCtx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (glideTo !== undefined) {
    osc.frequency.linearRampToValueAtTime(glideTo, start + duration)
  }
  amp.gain.setValueAtTime(0.0001, start)
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.015)
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(amp)
  amp.connect(audioCtx.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

export function sfxFill(): void {
  tone({ freq: 520, duration: 0.07, type: 'square', gain: 0.07 })
}

export function sfxMark(): void {
  tone({ freq: 220, duration: 0.06, type: 'sine', gain: 0.06 })
}

export function sfxLineComplete(): void {
  tone({ freq: 660, duration: 0.1, type: 'triangle', gain: 0.07 })
  tone({ freq: 880, duration: 0.12, type: 'triangle', gain: 0.07, delay: 0.09 })
}

export function sfxError(): void {
  tone({ freq: 300, duration: 0.35, type: 'sawtooth', gain: 0.06, glideTo: 120 })
}

export function sfxTick(): void {
  tone({ freq: 900, duration: 0.03, type: 'square', gain: 0.04 })
}

export function sfxTutorialStep(): void {
  tone({ freq: 1200, duration: 0.06, type: 'sine', gain: 0.05 })
  tone({ freq: 1600, duration: 0.08, type: 'sine', gain: 0.05, delay: 0.06 })
}

export function sfxWin(): void {
  const notes = [523, 587, 659, 784, 880, 1046]
  notes.forEach((freq, i) => {
    tone({ freq, duration: 0.16, type: 'triangle', gain: 0.08, delay: i * 0.09 })
  })
}

export function sfxBoot(): void {
  const audioCtx = getCtx()
  if (!audioCtx || muted) return
  const start = audioCtx.currentTime
  const freqs = [261, 329, 392]
  freqs.forEach((freq) => {
    const osc = audioCtx.createOscillator()
    const amp = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, start)
    amp.gain.setValueAtTime(0.0001, start)
    amp.gain.exponentialRampToValueAtTime(0.05, start + 0.3)
    amp.gain.exponentialRampToValueAtTime(0.0001, start + 1.4)
    osc.connect(amp)
    amp.connect(audioCtx.destination)
    osc.start(start)
    osc.stop(start + 1.5)
  })
}
