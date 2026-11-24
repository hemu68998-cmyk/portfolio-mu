import { useEffect, useRef, useState } from 'react'
import { journey } from '../data/content'
import { assetPath } from '../lib/assetPath'
import './Journey.css'

const staticLayout = '(max-width: 860px), (prefers-reduced-motion: reduce)'
// 三个热区按插画里的房子位置标注（百分比），hue 用于悬停时的光圈颜色。
const houses = [
  { name: '山顶研究所', x: 60.5, y: 12, glow: '#8fb8d8' },
  { name: '文旅驿站', x: 71, y: 37, glow: '#e09a74' },
  { name: '社群小屋', x: 29.5, y: 41, glow: '#e8c76a' },
]

/**
 * CH03：手绘的漂浮铁路岛插画，三栈房子是热区，点开看对应的实习经历。
 * 指针带动插画做轻微视差，整张图持续缓慢浮动。
 * 窄屏和减少动态效果时退回成纵向站点列表。
 */
export default function Journey() {
  const stageRef = useRef(null)
  const [opened, setOpened] = useState(null)

  useEffect(() => {
    const stage = stageRef.current
    const media = window.matchMedia(staticLayout)
    let frame = 0
    let pointer = { x: 0, y: 0 }

    function apply() {
      frame = 0
      stage.style.setProperty('--jr-shift-x', `${pointer.x * 14}px`)
      stage.style.setProperty('--jr-shift-y', `${pointer.y * 9}px`)
    }

    function move(event) {
      if (media.matches) return
      const bounds = stage.getBoundingClientRect()
      pointer = {
        x: (event.clientX - bounds.left) / bounds.width * 2 - 1,
        y: (event.clientY - bounds.top) / bounds.height * 2 - 1,
      }
      if (!frame) frame = requestAnimationFrame(apply)
    }

    function leave() {
      pointer = { x: 0, y: 0 }
      if (!frame) frame = requestAnimationFrame(apply)
    }

    stage.addEventListener('pointermove', move)
    stage.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(frame)
      stage.removeEventListener('pointermove', move)
      stage.removeEventListener('pointerleave', leave)
    }
  }, [])

  useEffect(() => {
    if (opened === null) return
    const escape = (event) => { if (event.key === 'Escape') setOpened(null) }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [opened])

  const stop = opened === null ? null : journey[opened]

  return (
    <section className="jr" id="journey" aria-labelledby="journey-title">
      <header className="jr-head">
        <p className="jr-ch mono">CH 03</p>
        <h2 id="journey-title">实习经历</h2>
      </header>

      <div className="jr-stage" ref={stageRef}>
        <div className="jr-art">
          <img src={assetPath('/journey/island.jpg')} alt="漂浮的铁路小岛，岛上有三栈房子" />
          {houses.map((house, index) => (
            <button
              key={house.name}
              type="button"
              className="jr-hot"
              style={{ '--jr-x': `${house.x}%`, '--jr-y': `${house.y}%`, '--jr-glow': house.glow }}
              data-active={opened === index || undefined}
              onClick={() => setOpened(index)}
            >
              <span className="jr-ring" aria-hidden="true" />
              <span className="jr-pin mono" aria-hidden="true">{index + 1}</span>
              <span className="jr-tag">
                <i className="mono">{journey[index].stop}</i>
                {journey[index].company}
              </span>
            </button>
          ))}
        </div>
        <p className="jr-guide mono" aria-hidden="true">
          点开岛上的房子，看看我在那里做了什么
        </p>
      </div>

      {stop && (
        <div className="jr-card-layer" onClick={() => setOpened(null)}>
          <article
            className="jr-card"
            data-layout={stop.branches ? 'branches' : 'points'}
            role="dialog"
            aria-modal="true"
            aria-label={`${stop.company} 实习经历`}
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="jr-close" onClick={() => setOpened(null)} aria-label="关闭">×</button>
            <p className="jr-card-meta mono">{stop.stop} · {stop.period}</p>
            <h3>{stop.company}</h3>
            <p className="jr-card-role">{stop.role}</p>
            <p className="jr-card-place"><span className="mono">场景</span>{houses[opened].name}</p>
            <ul className="jr-card-skills" aria-label="能力标签">
              {stop.skills.map((skill) => <li key={skill}>{skill}</li>)}
            </ul>
            {stop.branches ? (
              <ul className="jr-card-branches">
                {stop.branches.map((branch) => (
                  <li key={branch.title}>
                    {branch.image && <img src={branch.image} alt={`${branch.title}设计稿`} loading="lazy" />}
                    <h4>{branch.title}</h4>
                    <p>{branch.text}</p>
                    {branch.metric && <p className="jr-metric">{branch.metric}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="jr-card-points">
                {stop.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
            )}
          </article>
        </div>
      )}

      <ol className="jr-fallback">
        {journey.map((item) => (
          <li key={item.company}>
            <p className="jr-meta mono">{item.stop} · {item.period}</p>
            <h3>{item.company}</h3>
            <p className="jr-role">{item.role}</p>
            <ul>
              {(item.branches ?? item.points).map((entry) => (
                typeof entry === 'string'
                  ? <li key={entry}>{entry}</li>
                  : <li key={entry.title}><b>{entry.title}</b>{entry.text}{entry.metric ? ` · ${entry.metric}` : ''}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  )
}
