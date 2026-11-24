import { useRef, useState } from 'react'
import { codingWorks, dushulang, film } from '../data/content'
import './AILab.css'

const channels = [
  { id: 'lab-film', number: '04-1', label: 'AI 影像' },
  { id: 'lab-coding', number: '04-2', label: 'AI Coding' },
]

/** CH04：用遥控器在两个子频道之间换台，换台时暂停正在播放的短片。 */
export default function AILab() {
  const [active, setActive] = useState(0)
  const [flash, setFlash] = useState(0)
  const videoRef = useRef(null)
  const tabsRef = useRef([])

  function tune(index) {
    if (index === active) return
    videoRef.current?.pause()
    setActive(index)
    setFlash((value) => value + 1)
  }

  function onKeyDown(event) {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return
    event.preventDefault()
    const next = (active + (event.key === 'ArrowRight' ? 1 : channels.length - 1)) % channels.length
    tune(next)
    tabsRef.current[next]?.focus()
  }

  return (
    <section className="lab" id="lab" aria-labelledby="lab-title">
      <div className="lab-shell">
        <header className="lab-head">
          <div>
            <p className="lab-ch mono">CH 04</p>
            <h2 id="lab-title">AI 实验室</h2>
            <p>用 AI 生成、验证方案，再把想法做成能用的产品</p>
          </div>

          <div className="lab-remote" role="tablist" aria-label="AI 实验室频道" onKeyDown={onKeyDown}>
            {channels.map((channel, index) => (
              <button
                key={channel.id}
                ref={(node) => { tabsRef.current[index] = node }}
                type="button"
                role="tab"
                id={`${channel.id}-tab`}
                aria-selected={active === index}
                aria-controls={channel.id}
                tabIndex={active === index ? 0 : -1}
                onClick={() => tune(index)}
              >
                <span className="mono">{channel.number}</span>
                {channel.label}
              </button>
            ))}
          </div>
        </header>

        <div className="lab-screen">
          {flash > 0 && <span key={flash} className="lab-static" aria-hidden="true" />}

          <div className="lab-panel lab-film" id="lab-film" role="tabpanel" aria-labelledby="lab-film-tab" hidden={active !== 0}>
            <div className="lab-tv">
              <video ref={videoRef} src={film.src} poster={film.poster} controls preload="metadata" playsInline aria-label={`${film.title}短片`} />
              <p className="lab-tv-label mono">{film.title} · {film.length} · {film.style}</p>
            </div>

            <div className="lab-notes">
              <ul>
                {film.notes.map((note) => <li key={note}>{note}</li>)}
              </ul>
              <p className="lab-pipeline">
                <span className="label">工具链</span>
                {film.pipeline.join(' → ')}
              </p>
              <div className="lab-sheets">
                {film.sheets.map((sheet) => <img key={sheet.src} src={sheet.src} alt={sheet.alt} loading="lazy" />)}
              </div>
            </div>

            <figure className="lab-dushulang">
              <div className="lab-tv lab-dushulang-video">
                <video
                  src={dushulang.video.src}
                  poster={dushulang.video.poster}
                  controls
                  preload="metadata"
                  playsInline
                  aria-label={`${dushulang.title}视频`}
                />
                <p className="lab-tv-label mono">{dushulang.title} · AI 产品概念演示</p>
              </div>
              <div className="lab-dushulang-sheets">
                {dushulang.sheets.map((sheet) => <img key={sheet.src} src={sheet.src} alt={sheet.alt} loading="lazy" />)}
              </div>
              <figcaption>
                <b>{dushulang.title}</b>
                {dushulang.caption}
              </figcaption>
            </figure>
          </div>

          <div className="lab-panel lab-coding" id="lab-coding" role="tabpanel" aria-labelledby="lab-coding-tab" hidden={active !== 1}>
            {codingWorks.map((work) => (
              <article className="lab-work" key={work.title} data-images={work.images?.length ?? 0}>
                {work.images && (
                  <div className="lab-work-images">
                    {work.images.map((image) => <img key={image.src} src={image.src} alt={image.alt} loading="lazy" />)}
                  </div>
                )}
                <div className="lab-work-copy">
                  <h3>{work.title}</h3>
                  <p>{work.text}</p>
                  {work.link && <a href={work.link.href}>{work.link.label} <span aria-hidden="true">↑</span></a>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
