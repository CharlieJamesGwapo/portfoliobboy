import { useCallback, useMemo, useRef, useState } from 'react'
import { BadgeCheck, CalendarDays, ExternalLink, ImageOff, Search, ShieldCheck } from 'lucide-react'
import PortfolioDialog from './PortfolioDialog'
import { selectCredentials } from '../lib/portfolioCollections'

function getCredentialStatus(credential) {
  if (credential.expired) return { label: `Expired ${credential.expired}`, expired: true }
  if (credential.expires) return { label: `Expires ${credential.expires}`, expired: false }
  return { label: 'Expiration not supplied', expired: false }
}

function formatCategory(category) {
  if (category === 'ai') return 'AI & Anthropic'
  if (category === 'technical') return 'Technical & Professional'
  return 'all categories'
}

function CredentialDetails({ credential }) {
  const status = getCredentialStatus(credential)

  return (
    <div className="credential-detail">
      <p className="credential-detail-intro">
        Supplied record from {credential.issuer}. Details below reflect the original portfolio metadata.
      </p>

      <dl className="credential-detail-meta">
        <div>
          <dt><CalendarDays size={16} aria-hidden="true" /> Issue date</dt>
          <dd>{credential.issued || 'Not supplied'}</dd>
        </div>
        <div>
          <dt><ShieldCheck size={16} aria-hidden="true" /> Credential type</dt>
          <dd>{credential.kind}</dd>
        </div>
        <div>
          <dt><BadgeCheck size={16} aria-hidden="true" /> Credential ID</dt>
          <dd>{credential.credentialId || 'Not supplied'}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd className={status.expired ? 'credential-status-expired' : ''}>{status.label}</dd>
        </div>
      </dl>

      {credential.image ? (
        <div className="credential-detail-media">
          <div className="credential-detail-media-heading">
            <p className="eyebrow">Uploaded certificate image</p>
            <a
              href={credential.image}
              target="_blank"
              rel="noreferrer"
              className="credential-original-link"
            >
              <ExternalLink size={16} aria-hidden="true" />
              Open original certificate in a new tab
            </a>
          </div>
          <img
            className="credential-detail-image"
            src={credential.image}
            alt={`${credential.title} certificate issued by ${credential.issuer} to Charlie James Abejo`}
            width="1800"
            height="1392"
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : (
        <p className="credential-no-image">
          <ImageOff size={18} aria-hidden="true" />
          No uploaded certificate image for this record.
        </p>
      )}
    </div>
  )
}

function CredentialCard({ credential, onOpen }) {
  const status = getCredentialStatus(credential)

  return (
    <li className="credential-explorer-item" data-credential-title={credential.title}>
      <div className="credential-explorer-item-copy">
        <div className="credential-explorer-item-heading">
          <BadgeCheck size={18} aria-hidden="true" />
          <h4>{credential.title}</h4>
        </div>
        <p>{credential.issuer}</p>
        {(credential.expired || credential.expires) && (
          <span className={status.expired ? 'credential-card-status credential-status-expired' : 'credential-card-status'}>
            {status.label}
          </span>
        )}
      </div>
      <button
        type="button"
        className="credential-details-trigger"
        onClick={onOpen}
        aria-label={`Open details: ${credential.title}`}
      >
        Open details
      </button>
    </li>
  )
}

export default function CredentialExplorer({ records }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [expanded, setExpanded] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const searchRef = useRef(null)
  const selectedTriggerRef = useRef(null)

  const results = useMemo(
    () => selectCredentials(records, { query, category, expanded }),
    [records, query, category, expanded],
  )
  const hasFullInventoryFilter = Boolean(query.trim()) || category !== 'all'

  const openDetails = useCallback((record, event) => {
    selectedTriggerRef.current = event.currentTarget
    setSelectedRecord(record)
  }, [])

  const closeDetails = useCallback(() => setSelectedRecord(null), [])
  const clearSearch = useCallback(() => {
    setQuery('')
    searchRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <section className="credential-explorer" aria-labelledby="credential-explorer-title">
      <div className="credential-explorer-heading">
        <div>
          <p className="eyebrow">Credential explorer</p>
          <h3 id="credential-explorer-title">Find a record by title, issuer, or ID.</h3>
        </div>
        <p className="credential-explorer-summary">
          {records.length} learning records, shown as a compact collection so every original record stays easy to inspect.
        </p>
      </div>

      <div className="credential-explorer-controls">
        <label className="credential-search-field">
          <span>Search credentials</span>
          <span className="credential-search-input-wrap">
            <Search size={18} aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, issuer, or credential ID"
              aria-label="Search credentials"
              autoComplete="off"
              spellCheck="false"
            />
          </span>
        </label>

        <div className="credential-category-controls" role="group" aria-label="Credential categories">
          <span className="credential-control-label">Category</span>
          <div className="credential-category-buttons">
            {[
              ['all', 'All'],
              ['ai', 'AI & Anthropic'],
              ['technical', 'Technical & Professional'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={category === value ? 'is-active' : ''}
                aria-pressed={category === value}
                onClick={() => setCategory(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="credential-explorer-result-bar">
        <p aria-live="polite" aria-atomic="true">
          Showing {results.length} of {records.length} records in {formatCategory(category)}.
        </p>
        <div className="credential-explorer-actions">
          {hasFullInventoryFilter ? (
            <span className="credential-explorer-filter-hint">Filters search all {records.length} records.</span>
          ) : results.length > 0 && (
            expanded ? (
              <button type="button" className="credential-view-toggle" onClick={() => setExpanded(false)}>
                Show featured
              </button>
            ) : (
              <button type="button" className="credential-view-toggle" onClick={() => setExpanded(true)}>
                View all {records.length} records
              </button>
            )
          )}
        </div>
      </div>

      {results.length > 0 ? (
        <ul className="credential-explorer-list" aria-label="Credentials">
          {results.map((credential) => (
            <CredentialCard
              key={`${credential.title}-${credential.credentialId || credential.issuer}`}
              credential={credential}
              onOpen={(event) => openDetails(credential, event)}
            />
          ))}
        </ul>
      ) : (
        <div className="credential-explorer-empty" role="status">
          <p>No credentials match “{query.trim() || formatCategory(category)}”.</p>
          <p>Try a broader title or issuer search, or return to All categories.</p>
          <div className="credential-empty-actions">
            {query.trim() && (
              <button type="button" className="credential-view-toggle" onClick={clearSearch}>Clear search</button>
            )}
            {category !== 'all' && (
              <button type="button" className="credential-view-toggle" onClick={() => setCategory('all')}>Show all categories</button>
            )}
          </div>
        </div>
      )}

      <PortfolioDialog
        open={Boolean(selectedRecord)}
        title={selectedRecord?.title || 'Credential details'}
        onClose={closeDetails}
        returnFocusRef={selectedTriggerRef}
        fallbackFocusRef={searchRef}
      >
        {selectedRecord && <CredentialDetails credential={selectedRecord} />}
      </PortfolioDialog>
    </section>
  )
}
