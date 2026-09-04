import { useState } from 'react'
import { education, experiences, profile, skills } from '../data/content'
import { useReveal } from '../hooks'
import './About.css'

export default function About() {
  const [ref, cls] = useReveal()
  const [imgOk, setImgOk] = useState(true)

  return (
    <section className="section section-line" id="about">
      <div className="shell" ref={ref}>
        <div className={cls}>
          <span className="eyebrow">About</span>
          <h2 className="section-title">
            设计出身的产品经理，
            <br />
            用 AI 把想法快速变成可验证的产品
          </h2>
        </div>

        <div className={`about-grid ${cls}`}>
          <figure className="about-portrait">
            {imgOk ? (
              <img src="/avatar.jpg" alt={profile.name} onError={() => setImgOk(false)} />
            ) : (
              <div className="about-mono" aria-hidden="true">
                <span>{profile.name}</span>
                <small>{profile.roles.join(' / ')}</small>
              </div>
            )}
            <figcaption>
              {profile.name}
              <span>{profile.roles.join(' / ')}</span>
            </figcaption>
          </figure>

          <div className="about-body">
            <p className="about-intro">{profile.intro}</p>

            <ul className="about-contact">
              {profile.contacts.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <a href={item.href}>{item.value}</a>
                </li>
              ))}
            </ul>

            <div className="about-cols">
              <div>
                <h3 className="about-h">实习经历</h3>
                <ul className="about-list">
                  {experiences.map((item) => (
                    <li key={item.company}>
                      <b>{item.company}</b>
                      <span>{item.role}</span>
                      <em>{item.period}</em>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="about-h">教育背景</h3>
                <ul className="about-list">
                  {education.map((item) => (
                    <li key={item.school}>
                      <b>{item.school}</b>
                      <span>{item.major}</span>
                      <em>{item.period}</em>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="about-skills">
              {skills.map((group) => (
                <div className="about-skill" key={group.group}>
                  <span className="about-skill-name">{group.group}</span>
                  <div className="about-tags">
                    {group.items.map((item) => (
                      <span className="tag hint" data-hint={group.group} key={item}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`about-stats ${cls}`}>
          <p className="about-signal label label-lg">signal</p>
          <div className="about-stat-row">
            {profile.stats.map((stat) => (
              <div className="stat" key={stat.label}>
                <strong className="mono">{stat.value}</strong>
                <span>{stat.label}</span>
                <em className="label">{stat.note}</em>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
