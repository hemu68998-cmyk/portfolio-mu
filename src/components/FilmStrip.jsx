import { useCallback, useEffect, useRef, useState } from 'react'
import { profile, projects } from '../data/content'
import './FilmStrip.css'

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

function Slide({ project }) {
  const [imgOk, setImgOk] = useState(true)
  return (
    <article className="fs-slide" data-index={project.index} aria-hidden="true">
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
    </article>
  )
}

export default function FilmStrip() {
  const sectionRef = useRef(null)
  const stickyRef = useRef(null)
  const [index, setIndex] = useState(0)
  const total = projects.length
  const rafRef = useRef(0)
  const indexRef = useRef(0)

  const render = useCallback(() => {
    const el = sectionRef.current
    const sticky = stickyRef.current
    if (!el || !sticky) return
    const rect = el.getBoundingClientRect()
    const range = el.offsetHeight - window.innerHeight
    if (range <= 0) return
    const p = clamp(-rect.top / range, 0, 1)
    const fp = p * (total - 1)

    const idx = clamp(Math.round(fp), 0, total - 1)
    if (idx !== indexRef.current) {
      indexRef.current = idx
      setIndex(idx)
    }

    // 直接驱动每张卡片的 opacity / scale，不触发 React 重渲
    const slides = sticky.querySelectorAll('.fs-slide')
    slides.forEach((slide, i) => {
      const d = i - fp
      const abs = Math.abs(d)
      const opacity = clamp(1.5 - abs * 1.7, 0, 1)
      const scale = 1 - 0.12 * clamp(abs, 0, 1)
      slide.style.opacity = String(opacity)
      slide.style.transform = `scale(${scale})`
      slide.style.pointerEvents = abs < 0.5 ? 'auto' : 'none'
      slide.setAttribute('aria-hidden', abs < 0.5 ? 'false' : 'true')
    })
  }, [total])

  useEffect(() => {
    render()
    const throttled = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(render)
    }
    window.addEventListener('scroll', throttled, { passive: true })
    window.addEventListener('resize', throttled)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('scroll', throttled)
      window.removeEventListener('resize', throttled)
    }
  }, [render])

  return (
    <section
      className="filmstrip"
      id="work"
      ref={sectionRef}
      style={{ height: `${total * 100}vh` }}
    >
      <div className="fs-sticky" ref={stickyRef}>
        {projects.map((p) => (
          <Slide project={p} key={p.index} />
        ))}

        <header className="fs-top">
          <div className="shell fs-top-inner">
            <div className="fs-brand">
              <span className="fs-brand-name">{profile.name}</span>
              <span className="fs-brand-role label">{profile.roles.join(' / ')}</span>
            </div>
            <span className="fs-count mono">
              {String(index + 1).padStart(2, '0')} <i>/</i> {String(total).padStart(2, '0')}
            </span>
          </div>
        </header>

        <footer className="fs-bottom">
          <div className="fs-scrollhint">
            <span className="label">Scroll to About</span>
            <span className="fs-scrollbar" aria-hidden="true" />
            <span className="fs-draglabel label">向下滚动浏览作品</span>
          </div>
        </footer>
      </div>
    </section>
  )
}
