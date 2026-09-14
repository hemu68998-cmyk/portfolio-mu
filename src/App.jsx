import { useEffect } from 'react'
import Nav from './components/Nav'
import FilmStrip from './components/FilmStrip'
import About from './components/About'
import Strengths from './components/Strengths'
import Contact from './components/Contact'
import { initSmoothScroll } from './lib/smoothScroll'

export default function App() {
  useEffect(() => initSmoothScroll(), [])

  return (
    <>
      <Nav />
      <main>
        <FilmStrip />
        <About />
        <Strengths />
        <Contact />
      </main>
    </>
  )
}
