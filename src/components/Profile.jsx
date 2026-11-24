import { useState } from 'react'
import { education, languages, profile, toolkit } from '../data/content'
import { assetPath } from '../lib/assetPath'
import { useReveal } from '../hooks'
import './Profile.css'

/**
 * 钻进屏幕后的第一屏：杂志封面式的个人信息。
 * 左边是人像海报（超大字号压在人像上），右边是一列深色信息栏。
 * 人像是 AI 生成的 3D 女孩形象 /profile-girl.jpg（方图，按 cover 裁切）。
 */
export default function Profile() {
  const [ref, cls] = useReveal({ threshold: 0.3 })
  const [copied, setCopied] = useState(false)
  const email = profile.contacts[0].value

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      window.location.href = `mailto:${email}`
    }
  }

  return (
    <section className="pf" id="profile" ref={ref}>
      {/* 不用通用的 .reveal（整块淡入），这一屏的入场由 Profile.css 逐元素编排 */}
      <div className={cls.endsWith(' in') ? 'pf-wrap is-in' : 'pf-wrap'}>
        <figure className="pf-poster">
          <img className="pf-photo" src={assetPath('/profile-girl.jpg')} alt={`${profile.name}的人像`} />

          <h2 className="pf-name">
            <span className="pf-name-in">何霂</span>
          </h2>

          <p className="pf-lede">
            把模糊的需求，
            <br />
            拆成可以验证的产品，
            <br />
            再用 AI 让它先跑起来。
          </p>

          <p className="pf-big" aria-label="从 0 到 1">
            0→1
          </p>

          <div className="pf-tags">
            <span className="pf-tag red">近期可到岗</span>
            <span className="pf-tag">每周 5 天 · 可实习 6 个月</span>
          </div>

          <nav className="pf-crumbs" aria-label="快速跳转">
            <span className="pf-crumb red">关于我</span>
            <a className="pf-crumb" href="#project-orbit">设计作品</a>
            <a className="pf-crumb" href="#journey">实习经历</a>
            <a className="pf-crumb" href="#lab">AI 实验室</a>
            <a className="pf-crumb" href="#contact">联系我</a>
          </nav>
        </figure>

        <aside className="pf-side">
          <div>
            <h3 className="pf-side-name">{profile.name}</h3>
            <p className="pf-side-role">{profile.roles.join(' / ')}</p>
          </div>

          <ul className="pf-rows">
            <li>
              <button type="button" className="pf-row" onClick={copyEmail}>
                <span className="pf-row-k">{copied ? '已复制' : '复制邮箱'}</span>
                <span className="pf-row-v mono">{email}</span>
                <span className="pf-row-arrow" aria-hidden="true">↗</span>
              </button>
            </li>
            <li>
              <a className="pf-row" href={profile.contacts[1].href}>
                <span className="pf-row-k">电话 / 微信</span>
                <span className="pf-row-v mono">{profile.contacts[1].value}</span>
                <span className="pf-row-arrow" aria-hidden="true">↗</span>
              </a>
            </li>
          </ul>

          <div className="pf-cv">
            <p className="label">教育</p>
            <ul>
              {education.map((item) => (
                <li key={item.school}>
                  <b>{item.school}</b>
                  <span>{item.major}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pf-kit">
            <p className="label">工具箱</p>
            <ul>
              {toolkit.map((tool) => <li key={tool}>{tool}</li>)}
            </ul>
            <p className="label">语言</p>
            <p className="pf-kit-langs">{languages.join(' · ')}</p>
          </div>
        </aside>
      </div>
    </section>
  )
}
