import { motion, type Variants } from 'motion/react'
import type { Ingredient } from '../content'

const draw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 1.6, ease: [0.65, 0, 0.35, 1], delay: 0.2 + i * 0.06 }, opacity: { duration: 0.2, delay: 0.2 + i * 0.06 } },
  }),
}

function P({ d, i = 0, accent = false }: { d: string; i?: number; accent?: boolean }) {
  return <motion.path d={d} variants={draw} custom={i} className={accent ? 'art-accent' : undefined} />
}

function Ceramide() {
  const xs = [40, 70, 100, 130, 160]
  const zig = (x: number, y: number, dir: 1 | -1) =>
    `M${x} ${y} l-3 ${6 * dir} l3 ${6 * dir} l-3 ${6 * dir} l3 ${6 * dir} l-3 ${6 * dir}`
  return (
    <>
      {xs.map((x, k) => (
        <g key={`t${x}`}>
          <motion.circle cx={x} cy={36} r={8} variants={draw} custom={k} className={k === 2 ? 'art-accent' : undefined} />
          <P d={zig(x - 3, 45, 1)} i={k + 1} />
          <P d={zig(x + 4, 45, 1)} i={k + 1} />
          <motion.circle cx={x} cy={124} r={8} variants={draw} custom={k + 2} className={k === 1 || k === 3 ? 'art-accent' : undefined} />
          <P d={zig(x - 3, 115, -1)} i={k + 3} />
          <P d={zig(x + 4, 115, -1)} i={k + 3} />
        </g>
      ))}
      <P d="M18 80 H182" i={8} accent />
    </>
  )
}

function Butter() {
  return (
    <>
      <g transform="rotate(-24 78 84)">
        <motion.ellipse cx={78} cy={84} rx={54} ry={25} variants={draw} custom={0} />
        <P d="M26 84 Q78 66 130 84" i={1} />
        <P d="M26 84 Q78 102 130 84" i={2} />
        <P d="M28 84 H128" i={3} />
        <P d="M132 84 q8 -2 14 -8" i={4} />
      </g>
      <motion.circle cx={150} cy={108} r={21} variants={draw} custom={3} />
      <P d="M133 98 Q150 84 167 98" i={4} accent />
      <motion.circle cx={150} cy={108} r={3} variants={draw} custom={5} className="art-accent" />
      <P d="M150 34 q-14 10 -6 20 q8 10 -4 18" i={6} accent />
      <P d="M164 40 q-8 6 -3 12" i={7} accent />
    </>
  )
}

function Centella() {
  const base = { x: 100, y: 150 }
  const leaves = [
    { cx: 58, cy: 62, r: 26, a: 0.9 },
    { cx: 102, cy: 42, r: 28, a: 1.57 },
    { cx: 145, cy: 66, r: 25, a: 2.25 },
  ]
  return (
    <>
      {leaves.map((l, k) => {
        const notch = { x: l.cx + Math.cos(l.a) * l.r * 0.15, y: l.cy + Math.sin(l.a) * l.r * 0.15 }
        const p1 = { x: l.cx + Math.cos(l.a + 0.32) * l.r, y: l.cy + Math.sin(l.a + 0.32) * l.r }
        const p2 = { x: l.cx + Math.cos(l.a - 0.32) * l.r, y: l.cy + Math.sin(l.a - 0.32) * l.r }
        const outline = `M${notch.x.toFixed(1)} ${notch.y.toFixed(1)} L${p1.x.toFixed(1)} ${p1.y.toFixed(1)} A${l.r} ${l.r} 0 1 1 ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} Z`
        const veins = [-1.9, -1.0, 0, 1.0, 1.9]
          .map((o) => {
            const ang = l.a + Math.PI + o
            const ex = l.cx + Math.cos(ang) * l.r * 0.82
            const ey = l.cy + Math.sin(ang) * l.r * 0.82
            return `M${notch.x.toFixed(1)} ${notch.y.toFixed(1)} L${ex.toFixed(1)} ${ey.toFixed(1)}`
          })
          .join(' ')
        const stem = `M${notch.x.toFixed(1)} ${notch.y.toFixed(1)} Q${((notch.x + base.x) / 2 + (k - 1) * -10).toFixed(1)} ${((notch.y + base.y) / 2).toFixed(1)} ${base.x} ${base.y}`
        return (
          <g key={k}>
            <P d={outline} i={k} />
            <P d={veins} i={k + 2} accent />
            <P d={stem} i={k + 1} />
          </g>
        )
      })}
      <P d="M70 150 Q100 144 130 150" i={6} />
    </>
  )
}

function Kakadu() {
  const fruits = [
    { x: 84, y: 72, s: 26 },
    { x: 106, y: 86, s: 26 },
    { x: 128, y: 70, s: 30 },
  ]
  return (
    <>
      <P d="M14 44 Q100 18 188 52" i={0} />
      <P d="M54 34 Q30 52 40 92 Q62 64 54 34 Z" i={1} />
      <P d="M54 34 Q46 62 40 92" i={2} accent />
      <P d="M160 42 Q190 60 178 104 Q158 74 160 42 Z" i={1} />
      <P d="M160 42 Q170 72 178 104" i={2} accent />
      {fruits.map((f, k) => (
        <g key={k}>
          <P d={`M${f.x} ${f.y - 14} Q${f.x + 2} ${f.y - f.s} ${f.x - 2} ${f.y - f.s - 12}`} i={k + 2} />
          <motion.ellipse cx={f.x} cy={f.y} rx={11} ry={14} variants={draw} custom={k + 3} />
          <P d={`M${f.x - 6} ${f.y - 4} q1 -6 6 -7`} i={k + 5} accent />
        </g>
      ))}
    </>
  )
}

export function IngredientArt({ kind }: { kind: Ingredient['art'] }) {
  return (
    <motion.svg
      viewBox="0 0 200 160"
      className="art"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      aria-hidden="true"
    >
      {kind === 'ceramide' && <Ceramide />}
      {kind === 'butter' && <Butter />}
      {kind === 'centella' && <Centella />}
      {kind === 'kakadu' && <Kakadu />}
    </motion.svg>
  )
}
