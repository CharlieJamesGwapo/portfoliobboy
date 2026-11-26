import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import './oneride-story.css'

export default function OneRideStory({ story }) {
  const [selected, setSelected] = useState(0)
  const [failed, setFailed] = useState([])
  const step = story.walkthrough[selected]
  return <div className="oneride-story">
    <section className="oneride-introduction" aria-labelledby="oneride-story-title">
      <p className="case-study-section-index">The work at a glance</p>
      <h2 id="oneride-story-title">{story.headline}</h2>
      <p>{story.introduction}</p>
      <div className="oneride-contributions">
        {story.contributions.map((item, index) => <article key={item.title}>
          <span aria-hidden="true">0{index + 1}</span><h3>{item.title}</h3><p>{item.text}</p>
        </article>)}
      </div>
    </section>
    <section id="oneride-walkthrough" className="oneride-walkthrough" aria-labelledby="oneride-walkthrough-title">
      <div className="oneride-walkthrough-copy">
        <p className="case-study-section-index">Inside the customer app</p>
        <h2 id="oneride-walkthrough-title">From discovery to orders.</h2>
        <p>A guided view of three official Google Play screenshots. Choose a screen to explore the customer experience.</p>
        <div className="oneride-step-list" role="group" aria-label="OneRide walkthrough screens">
          {story.walkthrough.map((item, index) => <button key={item.id} type="button" aria-pressed={index === selected} onClick={() => setSelected(index)}>
            <span>0{index + 1}</span><strong>{item.label}</strong><span aria-hidden="true">↗</span>
          </button>)}
        </div>
        <div className="oneride-step-description" aria-live="polite" aria-atomic="true">
          <h3>{step.title}</h3><p>{step.detail}</p><p className="oneride-observation">{step.observation}</p>
        </div>
      </div>
      <figure className="oneride-screen">
        {failed.includes(step.id) ? <div className="oneride-screen-failure" role="status">Screenshot preview unavailable. The walkthrough notes and official source remain available.</div> : <a href={step.src} target="_blank" rel="noopener noreferrer" aria-label={`Open full ${step.label} screenshot`}>
          <img src={step.src} alt={step.alt} width="600" height="1067" loading="lazy" decoding="async" onError={() => setFailed(previous => [...previous, step.id])} />
        </a>}
        <figcaption>{step.label} · Official Google Play screenshot</figcaption>
      </figure>
    </section>
    <section className="oneride-evidence" aria-labelledby="oneride-evidence-title">
      <p className="case-study-section-index">Delivery & public evidence</p>
      <h2 id="oneride-evidence-title">A shipped app, with sources you can open.</h2>
      <div className="oneride-evidence-grid">{story.evidence.map(item => <article key={item.title}>
        <h3>{item.title}</h3><p>{item.detail}</p><a href={item.href} target="_blank" rel="noopener noreferrer">{item.label}<ArrowUpRight size={16} aria-hidden="true" /></a>
      </article>)}</div>
      <p className="oneride-source-note">Public links checked {story.checkedAt}. Client source code and private operating screens are not published here.</p>
    </section>
  </div>
}
