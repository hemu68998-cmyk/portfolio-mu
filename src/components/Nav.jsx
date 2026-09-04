import { nav, profile } from '../data/content'
import { useActiveSection } from '../hooks'
import './Nav.css'

const ids = nav.map((item) => item.id)

export default function Nav() {
  const active = useActiveSection(ids)

  return (
    <header className="nav">
      <div className="shell nav-inner">
        <a href="#hero" className="nav-brand">
          <span className="nav-name">{profile.name}</span>
          <span className="nav-online mono">
            //online
            <span className="status-dot" aria-hidden="true" />
          </span>
          <span className="nav-role label">{profile.roles.join(' / ')}</span>
        </a>

        <nav className="nav-links" aria-label="页面导航">
          {nav.map((item, i) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={active === item.id ? 'nav-link on' : 'nav-link'}
            >
              <span className="nav-num mono">{String(i + 1).padStart(2, '0')}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="nav-cta" href={`mailto:${profile.contacts[0].value}`}>
          联系我
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  )
}
