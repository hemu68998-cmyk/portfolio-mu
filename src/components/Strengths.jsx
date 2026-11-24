import { strengths } from '../data/content'
import { useReveal } from '../hooks'
import './Strengths.css'

function Card({ item, i }) {
  return (
    <article className="str-card">
      <div className="str-head">
        <span className="str-num mono">{String(i + 1).padStart(2, '0')}</span>
        <span className="str-icon" aria-hidden="true">
          {item.icon}
        </span>
      </div>
      <h3 className="str-title">{item.title}</h3>
      <p className="str-desc">{item.desc}</p>
      <div className="str-keys">
        {item.keys.map((key) => (
          <span className="label" key={key}>
            {key}
          </span>
        ))}
      </div>
    </article>
  )
}

export default function Strengths() {
  const [ref, cls] = useReveal()

  return (
    <section className="section section-line" id="strength">
      <div className="shell">
        <div className={cls} ref={ref}>
          <span className="eyebrow">Strengths</span>
          <h2 className="section-title">个人优势</h2>
          <p className="section-note">
            以设计理解体验，以产品思维定义边界，以 AI 工具加速验证——这是我推进需求的方式。
          </p>
        </div>

        {/* 一个容器只进场一次：整组卡片随标题区一起淡入，不再逐张滚动触发 */}
        <div className={`str-grid ${cls}`}>
          {strengths.map((item, i) => (
            <Card item={item} i={i} key={item.title} />
          ))}
        </div>
      </div>
    </section>
  )
}
