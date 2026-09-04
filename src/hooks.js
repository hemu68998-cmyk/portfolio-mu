import { useEffect, useRef, useState } from 'react'

/** Adds `.in` when the element scrolls into view. */
export function useReveal(options) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || shown) return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true)
            io.disconnect()
          }
        })
      },
      { threshold: 0.16, rootMargin: '0px 0px -10% 0px', ...options }
    )

    io.observe(node)
    return () => io.disconnect()
  }, [shown, options])

  return [ref, shown ? 'reveal in' : 'reveal']
}

/** Tracks which section id currently fills the viewport. */
export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    const onScroll = () => {
      const mid = window.innerHeight * 0.4
      let current = ids[0]
      ids.forEach((id) => {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= mid) current = id
      })
      setActive(current)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [ids])

  return active
}
