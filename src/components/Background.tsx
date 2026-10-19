interface Star {
  id: number
  x: number
  y: number
  size: number
  delay: number
}

interface Bubble {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

const STARS: Star[] = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 3,
  delay: Math.random() * 3,
}))

const BUBBLES: Bubble[] = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 20 + Math.random() * 60,
  delay: Math.random() * 10,
  duration: 14 + Math.random() * 10,
}))

export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 animate-holographic"
        style={{
          backgroundImage:
            'linear-gradient(120deg, #FF6EC7, #C9A7FF, #3DDCFF, #B8FF3D, #FF6EC7)',
          backgroundSize: '300% 300%',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {STARS.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            boxShadow: '0 0 4px 1px rgba(255,255,255,0.8)',
          }}
        />
      ))}
      {BUBBLES.map((b) => (
        <span
          key={b.id}
          className="absolute rounded-full animate-drift"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: b.size,
            height: b.size,
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), rgba(255,255,255,0.05))',
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
