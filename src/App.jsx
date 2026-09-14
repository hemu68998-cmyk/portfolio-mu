import { useEffect } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Strengths from './components/Strengths'
import Contact from './components/Contact'
import { initSmoothScroll } from './lib/smoothScroll'

export default function App() {
  useEffect(() => initSmoothScroll(), [])

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Projects />
        <Strengths />
        <Contact />
      </main>
    </>
  )
}
