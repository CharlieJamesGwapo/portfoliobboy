import { useState } from 'react'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { independentProducts } from '../data/independentProducts'
import { oneRidePreview } from '../data/productPreviewData'
import { selectedCaseStudies } from '../data/selectedCaseStudies'
import { ProductMedia } from './IndependentProducts'
import { OneRidePhonePreview } from './ProductStudioPreview'
import './hero-project-carousel.css'

const PRODUCT_ORDER = [
  { id: 'autoflow-ai-pro', label: 'AutoFlow' },
  { id: 'easyappy', label: 'EasyAppy' },
  { id: 'bboy-assistant', label: 'BBOY' },
  { id: 'agentforge', label: 'AgentForge' },
  { id: 'contextpilot', label: 'ContextPilot' },
]

const oneRideCaseStudy = selectedCaseStudies.find((study) => study.id === 'oneride')

const productSlides = PRODUCT_ORDER
  .map(({ id, label }) => {
    const product = independentProducts.find((item) => item.id === id)
    if (!product) return null

    return {
      id: product.id,
      label,
      type: product.tabLabel,
      title: product.title,
      eyebrow: product.eyebrow,
      summary: product.overview,
      status: product.sourceVisibility === 'private-personal' ? 'Private personal product' : product.status,
      detailsHref: `#${product.id}`,
      product,
    }
  })
  .filter(Boolean)

const featuredSlides = [
  {
    id: 'oneride',
    label: 'OneRide',
    type: 'Mobile app',
    title: 'OneRide Balingasag',
    eyebrow: 'Mobile · API · Operations',
    summary: oneRideCaseStudy?.overview || 'Transport, delivery and local shopping in one working platform.',
    status: 'Published Android app',
    detailsHref: '#case-oneride',
    productId: oneRidePreview.projectId,
  },
  ...productSlides,
]

function HeroProjectCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeSlide = featuredSlides[activeIndex] || featuredSlides[0]
  const activeTabId = `hero-featured-tab-${activeSlide.id}`

  const moveTo = (index) => {
    setActiveIndex((index + featuredSlides.length) % featuredSlides.length)
  }

  const handleTabKeyDown = (event, index) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? featuredSlides.length - 1
        : index + (event.key === 'ArrowRight' ? 1 : -1)
    const wrappedIndex = (nextIndex + featuredSlides.length) % featuredSlides.length
    moveTo(wrappedIndex)
    document.getElementById(`hero-featured-tab-${featuredSlides[wrappedIndex].id}`)?.focus()
  }

  return (
    <section className="hero-project-carousel" aria-label="Featured projects">
      <div className="hero-project-carousel-header">
        <div className="hero-project-carousel-heading">
          <span>Selected work</span>
          <strong aria-live="polite" aria-atomic="true">
            {String(activeIndex + 1).padStart(2, '0')} <i>/ {String(featuredSlides.length).padStart(2, '0')}</i>
          </strong>
        </div>
        <div className="hero-project-carousel-controls" aria-label="Featured project navigation">
          <button
            type="button"
            aria-label="Previous featured project"
            onClick={() => moveTo(activeIndex - 1)}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Next featured project"
            onClick={() => moveTo(activeIndex + 1)}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="hero-project-tabs" role="tablist" aria-label="Featured projects" aria-orientation="horizontal">
        {featuredSlides.map((slide, index) => (
          <button
            key={slide.id}
            id={`hero-featured-tab-${slide.id}`}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            aria-controls="hero-featured-panel"
            tabIndex={activeIndex === index ? 0 : -1}
            className={activeIndex === index ? 'is-active' : ''}
            onClick={() => moveTo(index)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
          >
            <span>{slide.label}</span>
            <small>{slide.type}</small>
          </button>
        ))}
      </div>

      <div
        id="hero-featured-panel"
        className="hero-project-panel"
        role="tabpanel"
        aria-labelledby={activeTabId}
        tabIndex={0}
        key={activeSlide.id}
      >
        <div className="hero-project-media">
          {activeSlide.id === 'oneride'
            ? <OneRidePhonePreview />
            : <ProductMedia product={activeSlide.product} variant="showcase" />}
        </div>

        <div className="hero-project-copy">
          <div className="hero-project-copy-meta">
            <p className="hero-project-eyebrow">{activeSlide.eyebrow}</p>
            <span>{activeSlide.status}</span>
          </div>
          <h2>{activeSlide.title}</h2>
          <p>{activeSlide.summary}</p>
          <a className="hero-project-details" href={activeSlide.detailsHref}>
            View project details <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}

export default HeroProjectCarousel
