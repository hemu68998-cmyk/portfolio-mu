import { useCallback, useEffect, useRef, useState } from 'react'
import { profile, projects } from '../data/content'
import './FilmStrip.css'

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const lerp = (a, b, t) => a + (b - a) * t

function Card({ project, i, activeIndex }) {
  const [imgOk, setImgOk] = useState(true)
  const offset = i - activeIndex
  const abs = Math.abs(offset)

  return (
    <article
      className={abs < 0.001 ? 'fs-card on' : 'fs-card'}
      aria-hidden={abs > 0.75}
      style={{
        '--o': offset,
        '--d': clamp(abs, 0, 3),
        zIndex: 100 - Math.round(abs * 10),
      }}
    >
      <div className="fs-frame">
        <div className="fs-media">
          {imgOk ? (
            <img
              className="fs-img"
              src={`/work-${project.index}.jpg`}
              alt={project.title}
              onError={() => setImgOk(false)}
            />
          ) : (
            <div className="fs-img fs-fallback" aria-hidden="true">
              <span>{project.index}</span>
            </div>
          )}
          <div className="fs-dim" aria-hidden="true" />

          <div className="fs-caption">
            <p className="fs-scene label label-lg">{project.scene}</p>
            <h2 className="fs-title">{project.title}</h2>
            <span className="fs-viewlink">
              View project <span aria-hidden="true">↗</span>
            </span>
          </div>

          <span className="fs-badge mono">{project.period}</span>
        </div>
      </div>
    </article>
  )
}

export default function FilmStrip() {
  const trackRef = useRef(null)
  const viewRef = useRef(null)
  const [active, setActive] = useState(0)
  const total = projects.length

  const progRef = useRef(0)
  const targetRef = useRef(0)
  const activeRef = useRef(0)
  const draggingRef = useRef(false)
  const rafRef = useRef(0)

  const write = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const first = track.firstElementChild
    if (!first) return
    const cardW = first.getBoundingClientRect().width
    const gap = parseFloat(getComputedStyle(track).columnGap || '0') || 0
    const step = cardW + gap
    // 让「当前进度对应的卡片中心」对齐视口中心（轨道 left:50%）
    const offset = progRef.current * step + cardW / 2
    track.style.transform = `translate3d(${-offset}px, -50%, 0)`
  }, [])

  const setTarget = useCallback(
    (t) => {
      targetRef.current = clamp(t, 0, total - 1)
    },
    [total]
  )

  const go = useCallback(
    (i) => {
      const idx = clamp(Math.round(i), 0, total - 1)
      activeRef.current = idx
      setActive(idx)
      setTarget(idx)
    },
    [setTarget, total]
  )

  useEffect(() => {
    write()
    const tick = () => {
      if (!draggingRef.current) {
        const cur = progRef.current
        const tgt = targetRef.current
        if (Math.abs(tgt - cur) > 0.001) {
          progRef.current = lerp(cur, tgt, 0.15)
          write()
          const idx = clamp(Math.round(progRef.current), 0, total - 1)
          if (idx !== activeRef.current) {
            activeRef.current = idx
            setActive(idx)
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [write, total])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    let startX = 0
    let startP = 0
    let vel = 0
    let lastX = 0
    let lastT = 0

    const down = (e) => {
      draggingRef.current = true
      startX = e.clientX
      startP = progRef.current
      lastX = e.clientX
      lastT = performance.now()
      vel = 0
      view.setPointerCapture(e.pointerId)
    }
    const move = (e) => {
      if (!draggingRef.current) return
      const dx = e.clientX - startX
      progRef.current = clamp(startP - (dx / view.clientWidth) * 2.2, 0, total - 1)
      targetRef.current = progRef.current
      write()
      const now = performance.now()
      const dt = Math.max(1, now - lastT)
      vel = lerp(vel, (e.clientX - lastX) / dt, 0.4)
      lastX = e.clientX
      lastT = now
    }
    const up = () => {
      if (!draggingRef.current) return
      draggingRef.current = false
      go(progRef.current + clamp(vel * 0.2, -1.4, 1.4))
    }
    const cancel = () => {
      draggingRef.current = false
      setTarget(activeRef.current)
    }

    view.addEventListener('pointerdown', down)
    view.addEventListener('pointermove', move)
    view.addEventListener('pointerup', up)
    view.addEventListener('pointercancel', cancel)
    return () => {
      view.removeEventListener('pointerdown', down)
      view.removeEventListener('pointermove', move)
      view.removeEventListener('pointerup', up)
      view.removeEventListener('pointercancel', cancel)
    }
  }, [go, setTarget, write, total])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const onWheel = (e) => {
      const atLast = activeRef.current >= total - 1
      const atFirst = activeRef.current <= 0
      const goingDown = e.deltaY > 0
      const goingUp = e.deltaY < 0
      if ((atLast && goingDown) || (atFirst && goingUp)) return
      e.preventDefault()
      go(activeRef.current + (goingDown ? 1 : -1))
    }
    view.addEventListener('wheel', onWheel, { passive: false })
    return () => view.removeEventListener('wheel', onWheel)
  }, [go, total])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') go(activeRef.current - 1)
      if (e.key === 'ArrowRight') go(activeRef.current + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="filmstrip" id="work">
      <header className="fs-top">
        <div className="shell fs-top-inner">
          <div className="fs-brand">
            <span className="fs-brand-name">{profile.name}</span>
            <span className="fs-brand-role label">{profile.roles.join(' / ')}</span>
          </div>
          <span className="fs-count mono">
            {String(active + 1).padStart(2, '0')} <i>/</i> {String(total).padStart(2, '0')}
          </span>
        </div>
      </header>

      <div className="fs-view" ref={viewRef} role="group" aria-label="作品胶片带">
        <div className="fs-track" ref={trackRef}>
          {projects.map((p, i) => (
            <Card project={p} i={i} activeIndex={active} key={p.index} />
          ))}
        </div>
      </div>

      <div className="fs-arrows" role="group" aria-label="切换作品">
        <button type="button" className="fs-arrow" onClick={() => go(active - 1)} aria-label="上一个作品">
          ←
        </button>
        <button type="button" className="fs-arrow" onClick={() => go(active + 1)} aria-label="下一个作品">
          →
        </button>
      </div>

      <footer className="fs-bottom">
        <button type="button" className="fs-scrollhint" onClick={scrollToAbout}>
          <span className="label">Scroll to About</span>
          <span className="fs-scrollbar" aria-hidden="true" />
          <span className="fs-draglabel label">拖动 / 滚轮切换作品</span>
        </button>
      </footer>
    </section>
  )
}
