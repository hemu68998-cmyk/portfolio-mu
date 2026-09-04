import { useCallback, useEffect, useRef, useState } from 'react'
import { projects } from '../data/content'
import { scrollToY } from '../lib/smoothScroll'
import './Projects.css'

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

function Slide({ project, index, current, total }) {
  const [imgOk, setImgOk] = useState(true)
  const offset = index - current
  const active = offset === 0

  return (
    <article
      className={active ? 'work-slide on' : 'work-slide'}
      aria-hidden={!active}
      style={{
        // 前后卡片留在画面里错开堆叠，滚动时有纵深推进感
        // --dist 在 JS 里算好绝对值：CSS abs() 到 Chrome 133 才支持，不能依赖
        '--offset': offset,
        '--dist': Math.min(Math.abs(offset), 2),
        zIndex: total - Math.abs(offset),
      }}
    >
      <div className="work-visual">
        {imgOk ? (
          <img
            src={`/work-${project.index}.jpg`}
            alt={project.title}
            onError={() => setImgOk(false)}
          />
        ) : (
          <div className="work-art" aria-hidden="true">
            <span className="work-art-index">{project.index}</span>
            <span className="work-art-ring" />
            <span className="work-art-ring two" />
          </div>
        )}
        <span className="work-badge mono">{project.period}</span>
      </div>

      <div className="work-body">
        <p className="work-scene label label-lg">{project.scene}</p>
        <h3 className="work-title">{project.title}</h3>
        <p className="work-summary">{project.summary}</p>

        <ul className="work-highlights">
          {project.highlights.map((item, i) => (
            <li key={item} style={{ '--i': i }}>
              {item}
            </li>
          ))}
        </ul>

        <div className="work-foot">
          <p className="work-result">
            <span className="label">成果</span>
            {project.result}
          </p>
          <div className="work-tags">
            {project.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}

export default function Projects() {
  const sectionRef = useRef(null)
  const stickyRef = useRef(null)
  const [current, setCurrent] = useState(0)
  const total = projects.length

  /** 把某一张卡片对应的滚动位置算出来，供页签/箭头跳转 */
  const yFor = useCallback(
    (i) => {
      const el = sectionRef.current
      if (!el) return 0
      const top = el.offsetTop
      const range = el.offsetHeight - window.innerHeight
      return top + (range * (i + 0.5)) / total
    },
    [total]
  )

  useEffect(() => {
    const section = sectionRef.current
    const sticky = stickyRef.current
    if (!section || !sticky) return

    let raf = 0
    let last = -1

    const read = () => {
      raf = 0
      const rect = section.getBoundingClientRect()
      const range = section.offsetHeight - window.innerHeight
      if (range <= 0) return

      const p = clamp(-rect.top / range, 0, 1)
      const exact = p * total
      const idx = clamp(Math.floor(exact), 0, total - 1)

      // 连续进度写进 CSS 变量，驱动卡片位移；离散序号只在变化时 setState
      sticky.style.setProperty('--p', String(exact - idx))
      sticky.style.setProperty('--sp', String(p))
      if (idx !== last) {
        last = idx
        setCurrent(idx)
      }
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }

    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [total])

  return (
    <section
      className="section-line work-section"
      id="work"
      ref={sectionRef}
      style={{ height: `${(total + 1) * 100}vh` }}
    >
      <div className="work-sticky" ref={stickyRef}>
        <div className="shell work-sticky-inner">
          <header className="work-head">
            <div>
              <span className="eyebrow">Selected Work</span>
              <h2 className="work-heading">精选项目</h2>
            </div>

            <div className="work-meter">
              <span className="work-count mono">
                {String(current + 1).padStart(2, '0')} <i>/</i> {String(total).padStart(2, '0')}
              </span>
              <span className="work-track" aria-hidden="true">
                <span className="work-track-fill" />
              </span>
              <span className="work-hint label">向下滚动切换</span>
            </div>
          </header>

          <div className="work-stage">
            {projects.map((project, idx) => (
              <Slide
                project={project}
                index={idx}
                current={current}
                total={total}
                key={project.index}
              />
            ))}
          </div>

          <div className="work-dots">
            {projects.map((project, idx) => (
              <button
                type="button"
                key={project.index}
                className={idx === current ? 'work-dot on' : 'work-dot'}
                onClick={() => scrollToY(yFor(idx))}
                aria-label={`查看 ${project.title}`}
              >
                <span className="work-dot-num mono">{project.index}</span>
                <span className="work-dot-name">{project.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
