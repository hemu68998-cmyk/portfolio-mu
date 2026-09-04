import { useEffect, useRef, useState } from 'react'
import { profile } from '../data/content'
import ShaderBackground from './ShaderBackground'
import './Hero.css'

export default function Hero() {
  const videoRef = useRef(null)
  const [hasVideo, setHasVideo] = useState(false)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const ok = () => setHasVideo(true)
    el.addEventListener('loadeddata', ok)
    return () => el.removeEventListener('loadeddata', ok)
  }, [])

  return (
    <section className="hero" id="hero">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-aurora" />
        <ShaderBackground />
        <div className="hero-grid" />
        <video
          ref={videoRef}
          className={hasVideo ? 'hero-video on' : 'hero-video'}
          src="/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className="hero-veil" />
      </div>

      <div className="shell hero-inner">
        <p className="status hero-status">
          <span className="status-dot" aria-hidden="true" />
          {profile.status}
        </p>

        <h1 className="hero-title">
          {profile.headline.map((line, i) => (
            <span className="hero-line" key={line}>
              <span style={{ animationDelay: `${0.2 + i * 0.16}s` }}>{line}</span>
            </span>
          ))}
        </h1>

        <p className="hero-sub">
          {profile.name} · {profile.roles.join(' / ')}
          <span className="hero-sep" aria-hidden="true" />
          {profile.tagline}
        </p>

        <dl className="hero-meta">
          {[
            ['role', profile.roles.join(' / ')],
            ['focus', 'AI 生态产品 · 体验设计'],
            ['base', '北京 / 可远程'],
            ['stack', 'PRD · Figma · AI Coding'],
          ].map(([k, v]) => (
            <div className="hero-meta-item" key={k}>
              <dt className="label">{k}</dt>
              <dd className="hero-meta-val mono">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="hero-actions">
          <a className="hero-btn primary" href="#work">
            查看精选项目
            <span aria-hidden="true">↓</span>
          </a>
          <a className="hero-btn" href={`mailto:${profile.contacts[0].value}`}>
            {profile.contacts[0].value}
          </a>
        </div>
      </div>

      <div className="shell hero-foot">
        <span>Scroll</span>
        <span className="hero-scrollbar" aria-hidden="true" />
        <span>{profile.roles.join(' · ')}</span>
      </div>
    </section>
  )
}
