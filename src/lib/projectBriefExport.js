export function formatProjectBrief({ subject = 'Project brief', message = '' } = {}) {
  return `PROJECT BRIEF\n${subject}\n\n${message}\n\nPrepared with Alex · Charlie James Abejo\nhttps://portfoliobboy.vercel.app/\nDraft for discussion. Scope, availability, pricing and timing need confirmation.\n`
}

const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]))

export function buildBriefPrintHtml(brief = {}) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="referrer" content="no-referrer"><title>Project brief — Alex</title><style>
  @page { size: A4; margin: 18mm; }
  * { box-sizing: border-box; }
  body { margin: 0 auto; padding: 32px 24px; max-width: 800px; color: #163637; background: #fff; font: 16px/1.65 system-ui, sans-serif; }
  header { border-top: 5px solid #287a60; padding-top: 20px; margin-bottom: 28px; }
  .eyebrow { margin: 0 0 8px; color: #287a60; font-size: 12px; font-weight: 750; letter-spacing: .12em; }
  h1 { margin: 0; font-size: 28px; line-height: 1.25; overflow-wrap: anywhere; }
  .byline { margin: 10px 0 0; color: #4b625b; font-size: 13px; }
  footer { border-top: 1px solid #a9c8be; padding-top: 14px; margin-top: 32px; font-size: 12px; color: #4b625b; }
  .toolbar { padding: 16px; margin-bottom: 32px; background: #eff8f4; border: 1px solid #a9c8be; border-radius: 12px; }
  .toolbar p { margin: 8px 0 0; }
  button { min-height: 44px; padding: 10px 18px; border: 0; border-radius: 8px; background: #163637; color: white; font: inherit; cursor: pointer; }
  button:focus-visible { outline: 3px solid #287a60; outline-offset: 3px; }
  pre { margin: 0; font: inherit; white-space: pre-wrap; overflow-wrap: anywhere; }
  @media print { body { padding: 0; max-width: none; font-size: 11pt; } .toolbar { display: none; } }
  </style></head><body><aside class="toolbar"><button type="button" id="print-brief">Print / Save as PDF</button><p>Choose <strong>Save as PDF</strong> in your browser’s print destination. This draft has not been sent. You can close this tab when finished.</p></aside><header><p class="eyebrow">PROJECT BRIEF</p><h1>${escapeHtml(brief.subject || 'Project brief')}</h1><p class="byline">Prepared with Alex · Charlie James Abejo</p></header><main><pre>${escapeHtml(brief.message || '')}</pre></main><footer>Draft for discussion. Scope, availability, pricing and timing need confirmation.<br>https://portfoliobboy.vercel.app/</footer></body></html>`
}

export function downloadProjectBrief(brief) {
  const blob = new Blob([formatProjectBrief(brief)], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'charlie-abejo-project-brief.txt'
  document.body.append(link)
  try { link.click() } finally {
    link.remove()
    // Give mobile browsers time to start the download before releasing the URL.
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }
}

export function openBriefPrintView(brief) {
  const popup = window.open('about:blank', '_blank')
  if (!popup) throw new Error('popup-blocked')
  popup.opener = null
  popup.document.open()
  popup.document.write(buildBriefPrintHtml(brief))
  popup.document.close()
  const print = () => popup.print()
  popup.document.getElementById('print-brief').addEventListener('click', print)
  popup.focus()
  // The visible print button also works if automatic print preview is blocked.
  popup.setTimeout(print, 250)
}
