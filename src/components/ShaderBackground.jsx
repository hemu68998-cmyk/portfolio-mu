import { useEffect, useRef, useState } from 'react'
import { createShaderScene } from '../gl/shaderScene'
import './ShaderBackground.css'

const MAX_DPR = 1.5

/**
 * 全屏 WebGL 背景层。
 * 不可用（无 WebGL / 编译失败）时返回 null，Hero 自动回落到 CSS 光晕。
 */
export default function ShaderBackground() {
  const canvasRef = useRef(null)
  const [ok, setOk] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const scene = createShaderScene(canvas)
    if (!scene) {
      setOk(false)
      return
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)

    let raf = 0
    let visible = true
    let scroll = 0

    const sync = () => {
      scene.resize(canvas.clientWidth, canvas.clientHeight, dpr)
    }

    const onScroll = () => {
      const h = window.innerHeight || 1
      scroll = Math.min(window.scrollY / h, 1.5)
    }

    const frame = (ms) => {
      if (visible) scene.draw(ms / 1000, scroll)
      raf = requestAnimationFrame(frame)
    }

    sync()
    onScroll()

    if (reduced) {
      // 静帧：不做动画，只画一次
      scene.draw(0, 0)
    } else {
      raf = requestAnimationFrame(frame)
    }

    const ro = new ResizeObserver(() => {
      sync()
      if (reduced) scene.draw(0, scroll)
    })
    ro.observe(canvas)

    // Hero 滚出视口后停止绘制，避免整页滚动时白烧 GPU
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
      },
      { threshold: 0 }
    )
    io.observe(canvas)

    const onLost = (e) => {
      e.preventDefault()
      cancelAnimationFrame(raf)
      setOk(false)
    }
    canvas.addEventListener('webglcontextlost', onLost)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      canvas.removeEventListener('webglcontextlost', onLost)
      window.removeEventListener('scroll', onScroll)
      scene.dispose()
    }
  }, [])

  if (!ok) return null

  return <canvas ref={canvasRef} className="shader-canvas" aria-hidden="true" />
}
