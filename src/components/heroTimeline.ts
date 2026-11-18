// The hero's scroll animation, described once as a pure function of scroll
// progress. It's used two ways:
//   1. Turned into CSS scroll-driven keyframes, so the browser runs the whole
//      thing in step with scrolling (Safari 26+, Chrome, Edge). No JavaScript
//      runs while you scroll, which is what makes it smooth on iPhone.
//   2. Applied from a scroll listener on browsers without that support.

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))

// Timing, as fractions of the pinned scroll
export const T = {
  intro: [0, 0.14], // supporting lines fade out
  ring: [0, 0.03], // ripples fade out
  open: [0, 0.58], // the dot grows to fill the screen
  mark: [0.2, 0.42], // the wordmark letters fade
  split: [0.6, 0.76], // the photo slides aside
  copy: [0.76, 0.88], // copy fades in only once the photo is clear of it
} as const

export type Geo = {
  vw: number
  vh: number
  cx: number // dot centre within the stage
  cy: number
  r: number // dot radius
  R: number // radius that covers the whole stage
  W: number // photo size when it covers the stage
  H: number
  fx: number // focus point on the photo (the dot on the jar label)
  fy: number
  s0: number // photo zoom while it sits inside the dot
  x0: number
  y0: number
  xF: number // photo position when it fills the screen
  yF: number
  xS: number // photo position once the copy panel opens
  yS: number
  panel: number // how far the photo panel slides to make room for the copy
  land: boolean
}

export type Frame = {
  dot: number // scale of the round window
  imgX: number
  imgY: number
  imgS: number
  ink: number
  panelX: number
  panelY: number
  push: number // how far the letters are pushed apart
  mark: number
  intro: number
  introY: number
  ring: number
  copy: number
  copyY: number
}

export function frame(G: Geo, p: number): Frame {
  const o = seg(p, ...T.open)
  const s = easeInOut(seg(p, ...T.split))
  const eo = easeInOut(o)
  const dot = Math.max(0.0005, lerp(G.r, G.R, Math.pow(o, 2.3)) / G.R)
  const intro = seg(p, ...T.intro)
  const copy = seg(p, ...T.copy)
  return {
    dot,
    imgX: lerp(lerp(G.x0, G.xF, eo), G.xS, s),
    imgY: lerp(lerp(G.y0, G.yF, eo), G.yS, s),
    imgS: lerp(G.s0, 1, eo),
    ink: 1 - seg(o, 0.015, 0.14),
    panelX: G.land ? G.panel * s : 0,
    panelY: G.land ? 0 : -G.panel * s,
    push: Math.max(0, dot * G.R - G.r),
    mark: 1 - seg(p, ...T.mark),
    intro: 1 - intro,
    introY: -30 * intro,
    ring: 1 - seg(p, ...T.ring),
    copy,
    copyY: 24 * (1 - copy),
  }
}

export function measureGeo(o: {
  vw: number
  vh: number
  cx: number
  cy: number
  r: number
  land: boolean
  coarse: boolean
  copyH: number
}): Geo {
  const { vw, vh, cx, cy, r, land, coarse, copyH } = o
  const AR = 1230 / 1278
  const FOCUS = { x: 625 / 1230, y: 767 / 1278 }
  const R = Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy)) + 4
  const W = Math.max(vw, vh * AR)
  const H = W / AR
  const fx = FOCUS.x * W
  const fy = FOCUS.y * H
  const xF = (vw - W) / 2
  const yF = H > vh ? Math.max(vh - H, Math.min((vh - H) * 0.3, vh - 0.7 * H)) : 0
  // Phones never change the photo's zoom: Safari re-renders a layer at a new
  // resolution whenever its scale changes, which shows up as stutter
  const s0 = coarse ? 1 : 1.9

  let panel: number, xS: number, yS: number
  if (land) {
    panel = vw * 0.46
    xS = xF + vw * 0.23
    yS = yF
  } else {
    // The copy gets exactly the room it needs. The photo keeps its size and
    // shifts so the eyes and the jar label sit in the space left above.
    panel = Math.min(0.62, Math.max(0.34, copyH / vh)) * vh
    const region = vh - panel
    xS = vw / 2 - fx
    yS = Math.min(0, Math.max(region - H, region / 2 - 0.43 * H))
  }
  return { vw, vh, cx, cy, r, R, W, H, fx, fy, s0, x0: cx - fx, y0: cy - fy, xF, yF, xS, yS, panel, land }
}

// What each animated layer shows for a given frame
type Track = {
  name: string
  sel: string
  css: (f: Frame) => string
  vec: (f: Frame) => number[]
  tol: number[]
}

const px = (v: number) => `${v.toFixed(2)}px`
const n4 = (v: number) => v.toFixed(5)

export const TRACKS: Track[] = [
  {
    name: 'hero-dot',
    sel: '.hero__window',
    css: (f) => `transform: scale(${n4(f.dot)})`,
    vec: (f) => [Math.log(f.dot)],
    tol: [0.03],
  },
  {
    // Exactly undoes the window's scale, so the photo itself holds still
    name: 'hero-undo',
    sel: '.hero__inner',
    css: (f) => `transform: scale(${n4(1 / f.dot)})`,
    vec: (f) => [Math.log(f.dot)],
    tol: [0.03],
  },
  {
    name: 'hero-img',
    sel: '.hero__inner img',
    css: (f) => `transform: translate(${px(f.imgX)}, ${px(f.imgY)}) scale(${n4(f.imgS)})`,
    vec: (f) => [f.imgX, f.imgY, f.imgS * 400],
    tol: [1.5, 1.5, 1.5],
  },
  { name: 'hero-ink', sel: '.hero__ink', css: (f) => `opacity: ${f.ink.toFixed(3)}`, vec: (f) => [f.ink], tol: [0.04] },
  {
    name: 'hero-panel',
    sel: '.hero__photo',
    css: (f) => `transform: translate(${px(f.panelX)}, ${px(f.panelY)})`,
    vec: (f) => [f.panelX, f.panelY],
    tol: [1.5, 1.5],
  },
  {
    name: 'hero-unpanel',
    sel: '.hero__unshift',
    css: (f) => `transform: translate(${px(-f.panelX)}, ${px(-f.panelY)})`,
    vec: (f) => [f.panelX, f.panelY],
    tol: [1.5, 1.5],
  },
  {
    name: 'hero-re',
    sel: '.hero__half--re',
    css: (f) => `transform: translateX(${px(-f.push)}); opacity: ${f.mark.toFixed(3)}`,
    vec: (f) => [f.push, f.mark * 50],
    tol: [2, 1.5],
  },
  {
    name: 'hero-set',
    sel: '.hero__half--set',
    css: (f) => `transform: translateX(${px(f.push)}); opacity: ${f.mark.toFixed(3)}`,
    vec: (f) => [f.push, f.mark * 50],
    tol: [2, 1.5],
  },
  {
    name: 'hero-intro',
    sel: '.hero__top, .hero__kicker',
    css: (f) => `transform: translateY(${px(f.introY)}); opacity: ${f.intro.toFixed(3)}`,
    vec: (f) => [f.introY, f.intro * 50],
    tol: [1.5, 1.5],
  },
  { name: 'hero-bottom', sel: '.hero__bottom', css: (f) => `opacity: ${f.intro.toFixed(3)}`, vec: (f) => [f.intro], tol: [0.04] },
  { name: 'hero-ring', sel: '.hero__ripple', css: (f) => `opacity: ${f.ring.toFixed(3)}`, vec: (f) => [f.ring], tol: [0.05] },
  {
    name: 'hero-copy',
    sel: '.hero__copy',
    css: (f) => `transform: translateY(${px(f.copyY)}); opacity: ${f.copy.toFixed(3)}`,
    vec: (f) => [f.copyY, f.copy * 50],
    tol: [1, 1.5],
  },
]

// Segment boundaries always get a keyframe so the curve hits them exactly
const FORCED: number[] = [...new Set<number>([...Object.values(T).flat(), 1])].sort((a, b) => a - b)

// Short, stable fingerprint of the measured layout
function fingerprint(G: Geo, start: number, distance: number) {
  const s = [...Object.values(G), start, distance].map((v) => (typeof v === 'number' ? v.toFixed(1) : String(v))).join('|')
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

/**
 * Builds scroll-driven CSS keyframes that trace the frame() curves.
 *
 * Keyframe names carry a fingerprint of the layout. Safari keeps running the
 * old keyframes when a @keyframes rule is rewritten under the same name, so
 * a fresh name is what makes it pick up a re-measured layout (after fonts
 * load, for example).
 */
export function buildCss(G: Geo, start: number, distance: number) {
  const STEP = 0.002
  const out: string[] = []
  const key = fingerprint(G, start, distance)
  for (const t of TRACKS) {
    const stops: string[] = []
    let last: number[] | null = null
    let prevP = 0
    let prevF = frame(G, 0)
    const emit = (p: number, f: Frame) => {
      stops.push(`${(p * 100).toFixed(3)}% { ${t.css(f)} }`)
      last = t.vec(f)
    }
    emit(0, prevF)
    for (let p = STEP; p <= 1 + 1e-9; p += STEP) {
      const q = Math.min(1, p)
      const f = frame(G, q)
      const v = t.vec(f)
      const forced = FORCED.some((b) => b > prevP && b <= q + 1e-9)
      const moved = v.some((x, i) => Math.abs(x - last![i]) > t.tol[i])
      if (forced) {
        const b = FORCED.find((b) => b > prevP && b <= q + 1e-9)!
        emit(b, frame(G, b))
      } else if (moved) {
        emit(prevP, prevF)
      }
      prevP = q
      prevF = f
    }
    if (!stops[stops.length - 1].startsWith('100.000%')) emit(1, frame(G, 1))
    const name = `${t.name}-${key}`
    out.push(`@keyframes ${name} { ${stops.join(' ')} }`)
    out.push(`.hero--sda ${t.sel.split(',').map((s) => s.trim()).join(', .hero--sda ')} { animation-name: ${name}; }`)
  }
  out.push(
    `.hero--sda [data-sa] { animation-duration: 1ms; animation-duration: auto; animation-timing-function: linear; animation-fill-mode: both; animation-timeline: scroll(root block); animation-range: ${start.toFixed(0)}px ${(start + distance).toFixed(0)}px; }`,
  )
  return out.join('\n')
}

/** Applies a frame directly. Used where scroll-driven CSS isn't available. */
export function applyFrame(els: Record<string, HTMLElement | null>, f: Frame) {
  const set = (k: string, tf?: string, op?: number) => {
    const el = els[k]
    if (!el) return
    if (tf !== undefined) el.style.transform = tf
    if (op !== undefined) el.style.opacity = String(op)
  }
  set('window', `scale(${f.dot})`)
  set('inner', `scale(${1 / f.dot})`)
  set('img', `translate(${f.imgX}px, ${f.imgY}px) scale(${f.imgS})`)
  set('ink', undefined, f.ink)
  set('photo', `translate(${f.panelX}px, ${f.panelY}px)`)
  set('unshift', `translate(${-f.panelX}px, ${-f.panelY}px)`)
  set('re', `translateX(${-f.push}px)`, f.mark)
  set('set', `translateX(${f.push}px)`, f.mark)
  set('top', `translateY(${f.introY}px)`, f.intro)
  set('kicker', `translateY(${f.introY}px)`, f.intro)
  set('bottom', undefined, f.intro)
  set('ring', undefined, f.ring)
  set('copy', `translateY(${f.copyY}px)`, f.copy)
}

export function supportsScrollDriven() {
  if (typeof CSS === 'undefined' || !CSS.supports) return false
  if (new URLSearchParams(location.search).get('sda') === '0') return false // handy for testing the fallback
  return CSS.supports('animation-timeline: scroll()') && CSS.supports('animation-range: 0px 100px')
}
