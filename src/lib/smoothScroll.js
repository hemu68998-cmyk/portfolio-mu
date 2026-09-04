import Lenis from 'lenis'

let instance = null

/** 供组件做程序化滚动（按钮/页签），拿不到时回落原生 scrollTo */
export function getLenis() {
  return instance
}

/**
 * shader.se 用的就是 Lenis：滚动带惯性和阻尼，是"动感"最主要的来源。
 * 默认驱动 window 滚动，所以 window.scrollY / IntersectionObserver 都照常工作。
 */
export function initSmoothScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return () => {}
  }

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    wheelMultiplier: 0.9,
    touchMultiplier: 1.6,
  })
  instance = lenis

  let raf = 0
  const frame = (time) => {
    lenis.raf(time)
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  // 锚点导航交给 Lenis，避免原生瞬移打断惯性
  const onClick = (e) => {
    const link = e.target.closest('a[href^="#"]')
    if (!link) return
    const id = link.getAttribute('href').slice(1)
    const target = id && document.getElementById(id)
    if (!target) return
    e.preventDefault()
    lenis.scrollTo(target, { offset: -78, duration: 1.3 })
  }
  document.addEventListener('click', onClick)

  return () => {
    cancelAnimationFrame(raf)
    document.removeEventListener('click', onClick)
    lenis.destroy()
    instance = null
  }
}

/** 平滑滚动到指定 y，Lenis 不可用时回落原生 */
export function scrollToY(y) {
  const lenis = getLenis()
  if (lenis) lenis.scrollTo(y, { duration: 1.1 })
  else window.scrollTo({ top: y, behavior: 'smooth' })
}
