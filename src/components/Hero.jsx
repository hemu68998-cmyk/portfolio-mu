import { useEffect, useRef, useState } from 'react'
import '@fontsource/bodoni-moda/latin-600.css'
import ASCIIText from './ASCIIText'
import PortfolioCursor, { cursorMedia } from './PortfolioCursor'
import { assetPath } from '../lib/assetPath'
import './Hero.css'

const CHANNELS = [
  { scene: 'cabin', image: assetPath('/alien-cat-channel-01.gif'), light: '112 221 255', beam: '71%' },
  { scene: 'lake', image: assetPath('/alien-cat-channel-02.gif'), light: '255 196 112', beam: '49%' },
  { scene: 'night', image: assetPath('/alien-cat-channel-03.gif'), light: '255 173 112', beam: '46%' },
  { scene: 'mountain', image: assetPath('/alien-cat-channel-04.gif'), light: '116 173 255', beam: '54%' },
]
const CHANNEL_DURATION = 1800
const INTRO_ASCII_STYLE = {
  fontFamily: "'Bodoni Moda', Georgia, serif",
  fontWeight: 600,
  colors: ['#fff2dc', '#ffbf8c', '#f08e79'],
  textColor: '#fff2dc',
}
const WELCOME_LETTERS = [
  { scale: 1, rise: 0 },
  { scale: 0.84, rise: 0.035 },
  { scale: 0.76, rise: 0.065 },
  { scale: 0.69, rise: 0.09 },
  { scale: 0.63, rise: 0.115 },
  { scale: 0.57, rise: 0.14 },
  { scale: 0.52, rise: 0.16 },
  { scale: 0.47, rise: 0.175 },
]
function ChannelMotion({ scene }) {
  if (scene === 'cabin') return <span className="intro-lantern" />

  if (scene === 'lake') {
    return (
      <>
        <span className="intro-lake-shimmer" />
        <span className="intro-ripples">
          <span />
          <span />
          <span />
        </span>
      </>
    )
  }

  return (
    <span className="intro-fireflies">
      <span />
      <span />
      <span />
      <span />
      <span />
    </span>
  )
}

/*
 * 屏幕玻璃在原图（1774×887，2:1）里的位置，按百分比记。
 * 画面容器始终保持 2:1 并盖满视口，所以这些百分比在任何窗口尺寸下都成立。
 */
const SCREEN = { left: 63.7, top: 20.3, width: 20.3, height: 35.5 }
const SCREEN_CX = (SCREEN.left + SCREEN.width / 2) / 100
const SCREEN_CY = (SCREEN.top + SCREEN.height / 2) / 100

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
/** 把总进度 p 映射到 [a, b] 区间内的 0→1 */
const span = (p, a, b) => clamp01((p - a) / (b - a))

export default function Hero() {
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const [broadcast, setBroadcast] = useState(0)
  const [showCursor, setShowCursor] = useState(false)
  const activeChannel = CHANNELS[broadcast % CHANNELS.length]
  const channelNumber = `0${broadcast % CHANNELS.length + 1}`
  const visibleBroadcasts = broadcast > 0 ? [broadcast - 1, broadcast] : [broadcast]

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    if (!section || !stage) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mouse = window.matchMedia(cursorMedia)
    let raf = 0
    let channelTimer = 0
    let cursorVisible = false
    // 指针视差：目标值和当前值分开，每帧向目标逼近，避免画面"粘"在鼠标上
    const tilt = { x: 0, y: 0, tx: 0, ty: 0 }

    const syncPlayback = () => {
      const bounds = section.getBoundingClientRect()
      const pushStart = Math.max(0, section.offsetHeight - window.innerHeight) * 0.12
      const playing = !motion.matches && !document.hidden && bounds.top < window.innerHeight &&
        bounds.bottom > 0 && bounds.top >= -pushStart

      stage.dataset.playing = String(playing)
      if (!playing) {
        window.clearTimeout(channelTimer)
        channelTimer = 0
      } else if (!channelTimer) {
        channelTimer = window.setTimeout(() => {
          channelTimer = 0
          if (syncPlayback()) setBroadcast((current) => current + 1)
        }, CHANNEL_DURATION)
      }
      return playing
    }

    const frame = () => {
      raf = 0
      const vw = window.innerWidth
      const vh = window.innerHeight
      const range = section.offsetHeight - vh
      const { top } = section.getBoundingClientRect()
      const p = range > 0 ? clamp01(-top / range) : 0
      const nextCursorVisible = !motion.matches && mouse.matches && p < 0.3 && top < vh
      if (nextCursorVisible !== cursorVisible) {
        cursorVisible = nextCursorVisible
        setShowCursor(nextCursorVisible)
      }

      // 画面容器 2:1 盖满视口
      const w = Math.max(vw, vh * 2)
      const h = w / 2
      // 屏幕撑满视口所需的放大倍数，多给 8% 余量把边框推出画面
      const fill = Math.max(vw / ((w * SCREEN.width) / 100), vh / ((h * SCREEN.height) / 100)) * 1.08

      const z = motion.matches ? 0 : easeInOut(span(p, 0.12, 0.82))
      const scale = 1 + (fill - 1) * z
      // 竖屏窗口里画面两侧被裁掉，屏幕会跑出视口：把画面往左挪，屏幕留在右侧 72% 处，但不露出右边缘
      const rawSx = (vw - w) / 2 + w * SCREEN_CX
      const shift = rawSx > vw * 0.72 ? Math.max(vw * 0.72 - rawSx, (vw - w) / 2) : 0
      // 放大的同时把屏幕中心平移到视口中心
      const sx = rawSx + shift
      const sy = (vh - h) / 2 + h * SCREEN_CY
      const dx = shift + (vw / 2 - sx) * z
      const dy = (vh / 2 - sy) * z

      tilt.x += (tilt.tx - tilt.x) * 0.08
      tilt.y += (tilt.ty - tilt.y) * 0.08
      const calm = 1 - z

      stage.style.setProperty('--w', `${w}px`)
      stage.style.setProperty('--h', `${h}px`)
      stage.style.setProperty(
        '--scene',
        `translate(${dx + tilt.x * 14 * calm}px, ${dy + tilt.y * 10 * calm}px) scale(${scale})`
      )
      stage.style.setProperty('--title-o', String(1 - span(p, 0.04, 0.3)))
      stage.style.setProperty('--title-y', `${-span(p, 0.04, 0.3) * 60}px`)
      stage.style.setProperty('--title-pointer', p < 0.3 ? 'auto' : 'none')
      stage.style.setProperty('--channel-o', String(1 - span(p, 0.28, 0.44)))
      stage.style.setProperty('--glow', String(span(p, 0.62, 0.9)))
      syncPlayback()

      if (Math.abs(tilt.tx - tilt.x) > 0.001 || Math.abs(tilt.ty - tilt.y) > 0.001) {
        raf = requestAnimationFrame(frame)
      }
    }

    const request = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }

    const onPointer = (e) => {
      if (motion.matches) return
      tilt.tx = e.clientX / window.innerWidth - 0.5
      tilt.ty = e.clientY / window.innerHeight - 0.5
      request()
    }

    frame()
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.addEventListener('visibilitychange', syncPlayback)
    motion.addEventListener('change', request)
    mouse.addEventListener('change', request)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(channelTimer)
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', syncPlayback)
      motion.removeEventListener('change', request)
      mouse.removeEventListener('change', request)
    }
  }, [])

  return (
    <section className="intro" id="hero" ref={sectionRef}>
      <div className="intro-stage" ref={stageRef}>
        <div className="intro-scene" aria-hidden="true">
          <img className="intro-img" src={assetPath('/intro-computer.jpg')} alt="" />
          <div
            className="intro-screen-shell"
            style={{
              left: `${SCREEN.left}%`,
              top: `${SCREEN.top}%`,
              width: `${SCREEN.width}%`,
              height: `${SCREEN.height}%`,
              '--screen-light': activeChannel.light,
            }}
          >
            {visibleBroadcasts.map((number) => {
              const { scene, light, beam } = CHANNELS[number % CHANNELS.length]
              const phase = number < broadcast ? 'out' : number > 0 ? 'in' : 'steady'
              return (
                <span
                  key={number}
                  className={`intro-cast intro-cast--${scene}`}
                  data-phase={phase}
                  style={{ '--cast-color': light, '--beam-x': beam }}
                >
                  <ChannelMotion scene={scene} />
                </span>
              )
            })}
            <div className="intro-screen">
              {visibleBroadcasts.map((number) => {
                const { scene, image } = CHANNELS[number % CHANNELS.length]
                const phase = number < broadcast ? 'out' : number > 0 ? 'in' : 'steady'
                return (
                  <span
                    key={number}
                    className="intro-channel"
                    data-phase={phase}
                    style={{
                      backgroundImage: `url("${image}")`,
                      backgroundPosition: 'center',
                      backgroundSize: 'cover',
                    }}
                  >
                    <ChannelMotion scene={scene} />
                  </span>
                )
              })}
              {broadcast > 0 && <span key={`light-${broadcast}`} className="intro-tune" />}
              <span className="intro-channel-tag">CH {channelNumber}</span>
            </div>
          </div>
        </div>

        {showCursor && <PortfolioCursor className="intro-ghost-cursor" />}

        <div className="intro-copy" lang="en">
          <h1 className="sr-only">Welcome.</h1>
          <div className="intro-title" aria-hidden="true">
            <ASCIIText
              {...INTRO_ASCII_STYLE}
              text="Welcome."
              letterLayout={WELCOME_LETTERS}
              asciiFontSize={4.5}
              textScale={1.92}
              blocks={0.9}
              waves={0.45}
              chroma={0.55}
              tilt={0.38}
              hueShift={0.28}
              scramble={0.6}
              clickRipple
            />
          </div>
          <p className="intro-scroll-copy">
            Scroll to explore
            <svg className="intro-scroll-hand" viewBox="0 0 24 16" aria-hidden="true">
              <path d="M1 6.5h4v7H1z M5 7l4-3 4.5.4h7.7a1.4 1.4 0 0 1 0 2.8h-6.4l.6 1.4-.7 1.5.1 1.4-1.6 1.8-4.3.4L5 12.5 M9 4l2.1 3.4 2.9.8 M10 10.2l4.6.4 M9.7 12l4.1.4" />
            </svg>
          </p>
        </div>

        <div className="intro-crt" aria-hidden="true" />
        <div className="intro-glow" aria-hidden="true" />
      </div>
    </section>
  )
}
