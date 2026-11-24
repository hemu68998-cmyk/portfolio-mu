import { useState } from 'react'
import { profile } from '../data/content'
import { assetPath } from '../lib/assetPath'
import { useReveal } from '../hooks'
import TearTicket from './TearTicket'
import './Contact.css'

const email = profile.contacts[0].value

/**
 * CH05：进入视口时画面像 CRT 关机一样收成光点，再亮出一张面试入场券。
 * 撕下存根会把邮箱复制到剪贴板；联系方式在票面下方始终可见。
 */
export default function Contact() {
  const [ref, cls] = useReveal({ threshold: 0.35 })
  const [torn, setTorn] = useState(false)
  const [copied, setCopied] = useState(false)
  const year = 2026

  async function onTear() {
    setTorn(true)
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className={cls.endsWith(' in') ? 'contact is-off' : 'contact'} id="contact" ref={ref}>
      <div className="contact-crt" aria-hidden="true" />
      <div className="contact-glow" aria-hidden="true" />

      <div className="shell contact-inner">
        <div className="contact-copy">
          <span className="eyebrow">CH 05 · 关机前，留个联系方式</span>
          <h2 className="contact-title">
            有合适的产品或设计机会，<span>期待和你聊聊</span>
          </h2>
          <p className="status contact-note">
            <span className="status-dot" aria-hidden="true" />
            {profile.status}
          </p>
        </div>

        <div className="contact-ticket">
          <TearTicket
            image={assetPath('/profile-ticket.png')}
            imageAlt={`${profile.name}的人像`}
            width={760}
            height={380}
            stubSize={230}
            radius={22}
            imageRadius={14}
            holes={16}
            holeSize={7}
            rotate={-2}
            background="#f6efe3"
            color="#16130f"
            stubBackground="#766a96"
            ariaLabel="撕下存根，复制邮箱"
            onTear={onTear}
            stub={(
              <div className="contact-stub">
                <span className="mono">ADMIT ONE</span>
                <b>撕下存根</b>
                <span>复制邮箱</span>
                <span className="mono">No. 2026-11</span>
              </div>
            )}
          >
            <div className="contact-ticket-body">
              <span className="mono">面试入场券</span>
              <b>{profile.name}</b>
              <span>{profile.roles.join(' / ')}</span>
            </div>
          </TearTicket>
          <p className="contact-ticket-hint" role="status">
            {torn ? (copied ? `邮箱已复制：${email}` : `邮箱：${email}`) : '拖动右侧存根，把它撕下来'}
          </p>
        </div>

        <div className="contact-links">
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
        <span>使用 React + Vite 构建</span>
      </footer>
    </section>
  )
}
