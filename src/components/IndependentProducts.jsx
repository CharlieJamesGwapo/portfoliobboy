import { useEffect, useState } from 'react'
import { independentProducts } from '../data/independentProducts'
import { caseStudySlug } from '../data/routeMetadata'
import './independent-products.css'

export function AgentArchitectureDiagram({ compact = false }) {
  return (
    <div
      className={`independent-agent-diagram${compact ? ' is-compact' : ''}`}
      role="img"
      aria-label="BBOY local architecture: Coordinator passes work to Developer, then Reviewer, alongside a voice and local macOS layer."
    >
      <div className="independent-agent-diagram-heading">
        <span>LOCAL AGENT FLOW</span>
        <strong>BBOY <i>0.7.0</i></strong>
      </div>
      <div className="independent-agent-flow" aria-hidden="true">
        <div className="independent-agent-node">
          <span>01</span>
          <strong>Coordinator</strong>
          <small>Plans and routes the work</small>
        </div>
        <span className="independent-agent-arrow">↓</span>
        <div className="independent-agent-node">
          <span>02</span>
          <strong>Developer</strong>
          <small>Implements the requested change</small>
        </div>
        <span className="independent-agent-arrow">↓</span>
        <div className="independent-agent-node">
          <span>03</span>
          <strong>Reviewer</strong>
          <small>Checks the result before handoff</small>
        </div>
      </div>
      <div className="independent-agent-local-layer" aria-hidden="true">
        <span className="independent-agent-local-mark" />
        <span><strong>Voice + local macOS layer</strong><small>Swift / AppKit · WebKit · Node.js · speech tools</small></span>
      </div>
      <span className="sr-only">The app runs locally on macOS and includes voice input and output.</span>
    </div>
  )
}

export function ProductMedia({ product, variant = 'showcase' }) {
  const media = product.media || []
  const [selectedMediaId, setSelectedMediaId] = useState(media[0]?.id || null)
  const [failedMediaIds, setFailedMediaIds] = useState([])
  const selectedMedia = media.find((item) => item.id === selectedMediaId) || media[0]
  const imageFailed = selectedMedia && failedMediaIds.includes(selectedMedia.id)

  const selectMedia = (item) => setSelectedMediaId(item.id)

  return (
    <figure className={`product-media product-media--${variant} product-media--${product.mediaLayout || 'diagram'}`}>
      <div className="product-media-stage">
        {product.visual === 'agent-architecture' ? (
          <AgentArchitectureDiagram compact={variant === 'project'} />
        ) : imageFailed ? (
          <div className="product-media-fallback" role="status">
            <span>Preview image unavailable</span>
            <strong>Product details and preview controls are still available.</strong>
          </div>
        ) : selectedMedia ? (
          <img
            key={selectedMedia.id}
            src={selectedMedia.src}
            alt={selectedMedia.alt}
            width={selectedMedia.width}
            height={selectedMedia.height}
            loading="lazy"
            decoding="async"
            onError={() => setFailedMediaIds((failedIds) => (
              failedIds.includes(selectedMedia.id) ? failedIds : [...failedIds, selectedMedia.id]
            ))}
          />
        ) : (
          <div className="product-media-fallback" role="status">
            <span>Product overview</span>
            <strong>{product.title}</strong>
          </div>
        )}
      </div>

      {media.length > 1 && (
        <div className="product-media-thumbnails" role="group" aria-label={`Choose ${product.title} preview`}>
          {media.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Show ${product.title} preview: ${item.label}`}
              aria-pressed={selectedMedia?.id === item.id}
              className={selectedMedia?.id === item.id ? 'is-selected' : ''}
              onClick={() => selectMedia(item)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}

      <figcaption>{product.mediaCaption}</figcaption>
    </figure>
  )
}

function productIdFromHash() {
  if (typeof window === 'undefined') return independentProducts[0].id

  let productId = window.location.hash.slice(1)
  try {
    productId = decodeURIComponent(productId)
  } catch {
    return independentProducts[0].id
  }

  return independentProducts.some((product) => product.id === productId)
    ? productId
    : independentProducts[0].id
}

export default function IndependentProducts() {
  const [activeProductId, setActiveProductId] = useState(productIdFromHash)
  const activeIndex = independentProducts.findIndex((product) => product.id === activeProductId)
  const activeProduct = independentProducts[activeIndex] || independentProducts[0]

  useEffect(() => {
    const syncProductFromUrl = () => setActiveProductId(productIdFromHash())
    window.addEventListener('hashchange', syncProductFromUrl)
    window.addEventListener('popstate', syncProductFromUrl)

    return () => {
      window.removeEventListener('hashchange', syncProductFromUrl)
      window.removeEventListener('popstate', syncProductFromUrl)
    }
  }, [])

  const selectProduct = (productId) => {
    setActiveProductId(productId)
    if (window.location.hash !== `#${productId}`) {
      window.history.pushState(window.history.state, '', `#${productId}`)
    }
  }

  const handleTabKeyDown = (event, index) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? independentProducts.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + independentProducts.length) % independentProducts.length
    const nextProduct = independentProducts[nextIndex]
    selectProduct(nextProduct.id)
    document.getElementById(nextProduct.id)?.focus()
  }

  return (
    <section id="independent-products" className="independent-products" aria-labelledby="independent-products-title">
      <div className="independent-products-heading">
        <div>
          <p className="eyebrow">Independent products · Product development</p>
          <h2 id="independent-products-title">Independent products.<br />Built for real life.</h2>
        </div>
        <p>AI automation, a calmer job search, a personal assistant for Mac, and an AI developer toolkit. Products I design and build across mobile, desktop, and the command line.</p>
      </div>

      <div className="independent-product-tabs" role="tablist" aria-label="Independent products">
        {independentProducts.map((product, index) => (
          <button
            key={product.id}
            id={product.id}
            type="button"
            role="tab"
            aria-selected={activeProductId === product.id}
            aria-controls={`independent-product-panel-${product.id}`}
            tabIndex={activeProductId === product.id ? 0 : -1}
            className={activeProductId === product.id ? 'is-active' : ''}
            onClick={() => selectProduct(product.id)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
          >
            <span className="independent-product-tab-number">{String(index + 1).padStart(2, '0')}</span>
            <span className="independent-product-tab-copy">
              <strong>{product.title}</strong>
              <small>{product.tabLabel}</small>
            </span>
          </button>
        ))}
      </div>

      <div
        id={`independent-product-panel-${activeProduct.id}`}
        className="independent-product-panel"
        role="tabpanel"
        aria-labelledby={activeProduct.id}
        tabIndex={0}
      >
        <div className="independent-product-copy">
          <div className="independent-product-intro">
            <p className="independent-product-eyebrow">{activeProduct.eyebrow}</p>
            <h3>{activeProduct.title}</h3>
            {activeProduct.tagline && <p className="independent-product-tagline">{activeProduct.tagline}</p>}
            <p className="independent-product-role">{activeProduct.role}</p>
            <p className="independent-product-overview">{activeProduct.overview}</p>
            <div className="independent-product-meta">
              <span className="independent-product-status">{activeProduct.status}</span>
              {activeProduct.license && <span className="independent-product-license">{activeProduct.license} license</span>}
              <a className="independent-product-direct-link" href={`#${activeProduct.id}`}>Link to this project</a>
            </div>
          </div>

          <div className="independent-product-summary">
            <ul>{activeProduct.features.slice(0, 3).map(feature => <li key={feature}>{feature}</li>)}</ul>
            <a className="independent-case-link" href={`/projects/${caseStudySlug(activeProduct.id)}`}>Explore the case study <span aria-hidden="true">↗</span></a>
          </div>
          <details className="independent-product-depth">
            <summary>Engineering notes &amp; full technology stack</summary>
          <div className="independent-product-context">
            <h4>Context</h4>
            <p>{activeProduct.context}</p>
          </div>

          <div className="independent-product-detail-grid">
            <section aria-labelledby={`${activeProduct.id}-features-title`}>
              <h4 id={`${activeProduct.id}-features-title`}>Product features</h4>
              <ul className="independent-product-features">
                {activeProduct.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
            </section>
            <section aria-labelledby={`${activeProduct.id}-architecture-title`}>
              <h4 id={`${activeProduct.id}-architecture-title`}>Architecture</h4>
              <ul className="independent-product-architecture">
                {activeProduct.architecture.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>
          </div>

          <div className="independent-product-engineering">
            <h4>Engineering</h4>
            <p>{activeProduct.engineering}</p>
          </div>

          <div className="independent-product-delivered">
            <h4>Delivered</h4>
            <p>{activeProduct.delivered}</p>
          </div>

          <div className="independent-product-stack" aria-label="Technology stack">
            {activeProduct.stack.map((item) => <span key={item}>{item}</span>)}
          </div>

          <p className="independent-product-evidence">{activeProduct.evidenceNote}</p>
          </details>
        </div>

        <ProductMedia key={activeProduct.id} product={activeProduct} />
      </div>
    </section>
  )
}
