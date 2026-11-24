import { useEffect, useRef, useState } from 'react'
import { works as entries } from '../data/content'
import puppy from '../../images/floating-corgi-cutout-v1.webp'
import FloatingLines from './FloatingLines'
import PortfolioCursor, { cursorMedia } from './PortfolioCursor'
import './ProjectOrbit.css'

const fallbackPositions = [[24, 27, -8], [76, 24, 8], [24, 67, 4], [76, 62, -8], [50, 18, 0], [50, 82, 0]]
const clamp = (value) => Math.max(0, Math.min(1, value))
const ramp = (value, start, end) => {
  const t = clamp((value - start) / (end - start))
  return t * t * (3 - 2 * t)
}

const closedFrame = { clipPath: 'ellipse(16% 11% at 57% 50%)', opacity: 0.35 }
const openFrame = { clipPath: 'ellipse(78% 85% at 50% 50%)', opacity: 1 }
const backgroundColors = ['#a97587', '#c0846d', '#8774a1']

export default function ProjectOrbit() {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const hostRef = useRef(null)
  const sceneRef = useRef(null)
  const dialogRef = useRef(null)
  const previewAnimation = useRef(null)
  const progressRef = useRef(0)
  const [ready, setReady] = useState(false)
  const [showCursor, setShowCursor] = useState(false)
  const [hover, setHover] = useState(null)
  const [previewIndex, setPreviewIndex] = useState(null)
  const preview = entries[previewIndex]

  useEffect(() => {
    if (previewIndex === null) return
    const dialog = dialogRef.current
    sceneRef.current?.setPreviewOpen(true)
    if (!dialog.open) dialog.showModal()
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      previewAnimation.current = dialog.animate([closedFrame, openFrame], {
        duration: 390,
        easing: 'cubic-bezier(0.2, 0.75, 0.25, 1)',
      })
    }
    return () => {
      previewAnimation.current?.cancel()
      previewAnimation.current = null
    }
  }, [previewIndex])

  function closePreview() {
    const dialog = dialogRef.current
    if (previewAnimation.current?.id === 'closing' || !dialog.open) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dialog.close()
      return
    }
    const current = getComputedStyle(dialog)
    const from = { clipPath: current.clipPath === 'none' ? openFrame.clipPath : current.clipPath, opacity: current.opacity }
    previewAnimation.current?.cancel()
    const animation = dialog.animate([from, closedFrame], { duration: 240, easing: 'ease-in', fill: 'forwards' })
    animation.id = 'closing'
    previewAnimation.current = animation
    animation.onfinish = () => dialog.close()
  }

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const host = hostRef.current
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mouse = window.matchMedia(cursorMedia)
    let frame = 0
    let inRange = false
    let disposed = false
    let loading = false
    let failed = false

    function removeScene() {
      sceneRef.current?.dispose()
      sceneRef.current = null
      delete host.dataset.dragging
      setHover(null)
      setReady(false)
    }

    async function loadScene() {
      if (!inRange || motion.matches || sceneRef.current || loading || failed) return
      loading = true
      try {
        const { mountOrbit } = await import('./orbitScene')
        if (disposed || motion.matches || !inRange) return
        sceneRef.current = mountOrbit({
          host,
          entries,
          onHover: setHover,
          onOpen: setPreviewIndex,
          onContextLost(event) {
            event.preventDefault()
            failed = true
            removeScene()
          },
        })
        sceneRef.current.setProgress(progressRef.current)
        setReady(true)
      } catch (error) {
        failed = true
        console.warn('3D project gallery is unavailable', error)
      } finally {
        loading = false
      }
    }

    function update() {
      frame = 0
      const { top, height } = section.getBoundingClientRect()
      const viewport = stage.clientHeight
      if (top > viewport || top + height < 0) return
      const progress = clamp(-top / Math.max(1, height - viewport))
      progressRef.current = progress
      sceneRef.current?.setProgress(progress)
      const arrival = ramp(1 - top / viewport, 0.16, 1)
      const paper = 1 - arrival + arrival * ramp(progress, 0.73, 1)
      const opacity = arrival * (1 - ramp(progress, 0.7, 1))
      stage.style.setProperty('--orbit-paper', `${paper * 100}%`)
      stage.style.setProperty('--orbit-cards-o', String(opacity))
      stage.dataset.exiting = String(progress > 0.88)
      setShowCursor(mouse.matches && !motion.matches && arrival > 0 && progress < 0.88)
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    const intersection = new IntersectionObserver(([entry]) => {
      inRange = entry.isIntersecting
      if (inRange) void loadScene()
    // Mount the 3D scene while the visitor is still in the hero (300vh tall), so the
    // 8.7MB model download, texture upload and shader compile finish before the hand-off.
    }, { rootMargin: '250% 0px' })
    const changePreference = () => {
      if (motion.matches) removeScene()
      else void loadScene()
      schedule()
    }

    intersection.observe(stage)
    if (window.location.hash === '#project-orbit') {
      section.scrollIntoView({ behavior: 'instant' })
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    motion.addEventListener('change', changePreference)
    mouse.addEventListener('change', schedule)
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      intersection.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      motion.removeEventListener('change', changePreference)
      mouse.removeEventListener('change', schedule)
      sceneRef.current?.dispose()
      sceneRef.current = null
    }
  }, [])

  function keyRotate(event) {
    if (event.target !== event.currentTarget || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return
    event.preventDefault()
    sceneRef.current?.rotate(event.key === 'ArrowLeft' ? -1 : 1)
  }

  return (
    <section id="project-orbit" className="project-orbit" ref={sectionRef} aria-labelledby="orbit-title">
      <div className="orbit-stage" ref={stageRef} data-ready={ready}>
        {ready && (
          <FloatingLines
            className="orbit-lines"
            linesGradient={backgroundColors}
            lightMode
            lineCount={8}
            lineDistance={7}
            animationSpeed={0.65}
            lineWidth={1.15}
            opacity={0.66}
            edgeFade={0.34}
            bendStrength={-0.48}
            parallaxStrength={0.12}
            clickSwirl
            dpr={0.85}
            paused={previewIndex !== null}
            aria-hidden="true"
          />
        )}
        {ready && showCursor && previewIndex === null && <PortfolioCursor className="orbit-ghost-cursor" zIndex={2} />}
        <div className="orbit-heading">
          <h2 id="orbit-title">部分设计作品</h2>
          <a href="#profile">个人简介 <span aria-hidden="true">↓</span></a>
        </div>

        <div
          className="orbit-canvas"
          ref={hostRef}
          tabIndex={ready ? 0 : -1}
          role="group"
          aria-label="三维作品展厅"
          aria-describedby={ready ? 'orbit-guide' : undefined}
          aria-hidden={!ready}
          inert={!ready}
          onKeyDown={keyRotate}
          data-hit={hover === 'dog' ? 'dog' : hover === null ? undefined : 'card'}
          data-lenis-prevent-horizontal
        >
          <div className="orbit-pointer" aria-hidden="true">
            <b>展开作品</b>
          </div>
        </div>

        {!ready && (
          <div className="orbit-fallback">
            <img className="orbit-fallback-dog" src={puppy} alt="戴红领巾的柯基小狗" width="880" height="943" />
            <ul>
              {entries.map((entry, index) => {
                const [x, y, tilt] = fallbackPositions[index]
                return (
                  <li key={entry.title} style={{ '--x': `${x}%`, '--y': `${y}%`, '--tilt': `${tilt}deg` }}>
                    <button type="button" onClick={() => setPreviewIndex(index)}>
                      <img src={entry.image} alt="" width="640" height="400" />
                      <span>{entry.title}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        <div className="orbit-bottom">
          {ready ? (
            <div className="orbit-controls" aria-label="旋转展厅">
              <button type="button" aria-label="向左旋转" onClick={() => sceneRef.current?.rotate(-1)}>←</button>
              <span id="orbit-guide">拖动旋转 · 点击卡片查看<span className="sr-only">，也可使用方向键</span></span>
              <button type="button" aria-label="向右旋转" onClick={() => sceneRef.current?.rotate(1)}>→</button>
            </div>
          ) : <span>继续滚动</span>}
          <a href="#journey">实习经历 <span aria-hidden="true">↓</span></a>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="orbit-preview"
        aria-labelledby="orbit-preview-title"
        data-lenis-prevent
        onClick={(event) => { if (event.target === event.currentTarget) closePreview() }}
        onCancel={(event) => { event.preventDefault(); closePreview() }}
        onClose={() => {
          setPreviewIndex(null)
          sceneRef.current?.setPreviewOpen(false)
        }}
      >
        {preview && (
          <article className="orbit-preview-layout">
            <div className="orbit-preview-copy">
              <button className="orbit-preview-close" type="button" aria-label="关闭作品预览" onClick={closePreview} autoFocus>×</button>
              <h3 id="orbit-preview-title">{preview.title}</h3>
              <p>{preview.summary}</p>
              <dl>
                {preview.facts.map(([term, detail]) => (
                  <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>
                ))}
              </dl>
            </div>
            <div className="orbit-preview-visual">
              {preview.gallery.map((src, index) => (
                <img key={src} src={src} alt={`${preview.title}作品集第 ${index + 1} 页`} loading={index ? 'lazy' : 'eager'} />
              ))}
            </div>
          </article>
        )}
      </dialog>
    </section>
  )
}
