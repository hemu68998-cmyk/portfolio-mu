import { useCallback, useEffect, useRef, useState } from 'react'
import { profile, projects } from '../data/content'
import ShaderBackground from './ShaderBackground'
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
      aria-hidden={abs > 0.6}
      style={{
        '--o': offset,
        '--d': clamp(abs, 0, 3),
        zIndex: 100 - Math.round(abs * 10),
      }}
    >
      <div className="fs-frame">
        <div className="fs-perf top" aria-hidden="true" />
        <div className="fs-perf bottom" aria-hidden="true" />

        <div className="fs-media">
          {imgOk ? (
            <img
              src={`/work-${project.index}.jpg`}
              alt={project.title}
              onError={() => setImgOk(false)}
            />
          ) : (
            <div className="fs-art" aria-hidden="true">
              <span>{project.index}</span>
            </div>
          )}
          <span className="fs-badge mono">{project.period}</span>
        </div>

        <div className="fs-body">
          <p className="fs-scene label label-lg">{project.scene}</p>
          <h3 className="fs-title">{project.title}</h3>
          <p className="fs-summary">{project.summary}</p>
          <div className="fs-tags">
            {project.tags.map((t) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
          </div>
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

  const progRef = useRef(0) // 连续进度（可以是小数）
  const targetRef = useRef(0) // 吸附后的目标
  const activeRef = useRef(0)
  const draggingRef = useRef(false)
  const rafRef = useRef(0)
  const [dragging, setDragging] = useState(false)

  const write = useCallback(() => {
    const track = trackRef.current
    const view = viewRef.current
    if (track && view) {
      const x = view.clientWidth / 2 - progRef.current * (track.scrollWidth / total)
      track.style.setProperty('--tx', `${x}px`)
    }
  }, [total])

  const setTarget = useCallback(
    (t) => {
      targetRef.current = clamp(t, -0.5, total - 0.5)
    },
    [total]
  )

  const go = useCallback(
    (i) => {
      const idx = ((Math.round(i) % total) + total) % total
      activeRef.current = idx
      setActive(idx)
      setTarget(idx)
    },
    [total, setTarget]
  )

  // 惯性吸附：拖动/滚轮只改 target，rAF 持续逼近，产生平滑回中
  useEffect(() => {
    write() // 初次定位：把当前帧对准视口中心
    const tick = () => {
      if (!draggingRef.current) {
        const cur = progRef.current
        const tgt = targetRef.current
        if (Math.abs(tgt - cur) > 0.001) {
          progRef.current = lerp(cur, tgt, 0.16)
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

  // 拖动
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
      setDragging(true)
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
      progRef.current = clamp(startP - (dx / view.clientWidth) * 1.7, -0.5, total - 0.5)
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
      setDragging(false)
      setTarget(progRef.current + clamp(vel * 0.16, -1.4, 1.4))
      go(Math.round(targetRef.current))
    }
    const cancel = () => {
      draggingRef.current = false
      setDragging(false)
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

  // 滚轮：纵向滚动当作横向翻片，和 shader.se 的滚动驱动一致
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const onWheel = (e) => {
      e.preventDefault()
      const step = e.deltaY > 0 ? 1 : -1
      go(activeRef.current + step)
    }
    view.addEventListener('wheel', onWheel, { passive: false })
    return () => view.removeEventListener('wheel', onWheel)
  }, [go])

  // 键盘
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') go(activeRef.current - 1)
      if (e.key === 'ArrowRight') go(activeRef.current + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  return (
    <section className="filmstrip" id="work">
      <div className="fs-bg" aria-hidden="true">
        <ShaderBackground />
        <div className="fs-veil" />
      </div>

      <div className="shell fs-head">
        <div>
          <p className="status fs-status">
            <span className="status-dot" aria-hidden="true" />
            {profile.status}
          </p>
          <h1 className="fs-title-big">
            {profile.name} · {profile.roles.join(' / ')}
          </h1>
          <p className="fs-tagline">{profile.tagline}</p>
        </div>
        <div className="fs-meter">
          <span className="fs-count mono">
            {String(active + 1).padStart(2, '0')} <i>/</i> {String(total).padStart(2, '0')}
          </span>
          <span className="fs-track" aria-hidden="true">
            <span
              className="fs-track-fill"
              style={{ transform: `scaleX(${active / (total - 1)})` }}
            />
          </span>
        </div>
      </div>

      <div className="fs-view" ref={viewRef} role="group" aria-label="作品胶片">
        <div className={dragging ? 'fs-track dragging' : 'fs-track'} ref={trackRef}>
          {projects.map((project, i) => (
            <Card project={project} i={i} activeIndex={active} key={project.index} />
          ))}
        </div>
      </div>

      <div className="shell fs-nav">
        <button type="button" className="fs-arrow" onClick={() => go(active - 1)} aria-label="上一个作品">
          ←
        </button>
        <span className="fs-index mono">
          {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <button type="button" className="fs-arrow" onClick={() => go(active + 1)} aria-label="下一个作品">
          →
        </button>
      </div>
    </section>
  )
}
