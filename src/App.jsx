import { useEffect } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import ProjectOrbit from './components/ProjectOrbit'
import Profile from './components/Profile'
import Journey from './components/Journey'
import AILab from './components/AILab'
import Contact from './components/Contact'
import { initSmoothScroll } from './lib/smoothScroll'

export default function App() {
  useEffect(() => initSmoothScroll(), [])

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ProjectOrbit />
        <Profile />
        <Journey />
        <AILab />
        <Contact />
      </main>
    </>
  )
}
