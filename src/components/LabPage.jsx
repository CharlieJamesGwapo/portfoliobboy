import { ArrowLeft } from 'lucide-react'
import InteractiveLab from './InteractiveLab'
import './route-pages.css'

export default function LabPage() {
  return (
    <div className="route-page lab-page">
      <header className="page-container route-page-heading">
        <a href="/" className="text-link"><ArrowLeft size={16} aria-hidden="true" /> Back to the portfolio</a>
        <p className="eyebrow">Creative engineering · Nine experiments</p>
        <h1>A little room<br />to play.</h1>
        <p>Canvas, real-time state, WebGL, keyboard controls, and touch interactions. Explore the experiments, then head back to the product work.</p>
      </header>
      <InteractiveLab />
    </div>
  )
}
