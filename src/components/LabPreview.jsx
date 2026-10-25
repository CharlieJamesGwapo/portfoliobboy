import { ArrowUpRight, Gamepad2 } from 'lucide-react'
import './route-pages.css'

export default function LabPreview() {
  return (
    <section id="lab" className="section section-light lab-preview" aria-labelledby="lab-preview-title">
      <div className="page-container lab-preview-card">
        <div>
          <p className="eyebrow">Interactive lab · Creative engineering</p>
          <h2 id="lab-preview-title">Serious about software.<br />Curious about what it can do.</h2>
          <p>Nine playable experiments in canvas, real-time interaction, and 3D rendering. The game engines load inside their own space.</p>
        </div>
        <a className="button button-dark" href="/lab"><Gamepad2 size={18} aria-hidden="true" /> Explore Charlie’s Arcade <ArrowUpRight size={17} aria-hidden="true" /></a>
      </div>
    </section>
  )
}
