import { profile } from '../data/content'
import { useReveal } from '../hooks'
import './Contact.css'

export default function Contact() {
  const [ref, cls] = useReveal()
  const year = 2026

  return (
    <section className="contact" id="contact">
      <div className="contact-glow" aria-hidden="true" />

      <div className="shell contact-inner" ref={ref}>
        <div className={cls}>
          <span className="eyebrow">Contact</span>
          <h2 className="contact-title">
            有合适的产品或设计机会，
            <br />
            <span>期待和你聊聊</span>
          </h2>
          <p className="status contact-note">
            <span className="status-dot" aria-hidden="true" />
            {profile.status}
          </p>
        </div>

        <div className={`contact-links ${cls}`}>
          {profile.contacts.map((item) => (
            <a className="contact-link" href={item.href} key={item.label}>
              <span className="contact-label label">{item.label}</span>
              <span className="contact-value mono">{item.value}</span>
              <span className="contact-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          ))}
        </div>
      </div>

      <footer className="shell contact-foot label">
        <span>
          © {year} {profile.name}
        </span>
        <span>{profile.roles.join(' / ')}</span>
        <span>Built with React + Vite</span>
      </footer>
    </section>
  )
}
