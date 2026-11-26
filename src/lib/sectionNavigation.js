// Native disclosures keep the homepage short. Reveal every ancestor before a
// fragment jump or focus transfer so shared links and keyboard navigation work.
export function revealSection(target, { openDisclosures = true } = {}) {
  for (let node = target; node; node = node.parentElement) {
    if (openDisclosures && node.tagName === 'DETAILS') node.open = true
    if (node.classList?.contains('reveal')) {
      node.classList.add('is-visible', 'is-reveal-immediate')
    }
  }
  // Expose a section's heading, while later cards still enter as they scroll
  // into view. Revealing its entire subtree would consume those entrances.
  const heading = target.querySelector?.('h1, h2, h3')
  if (heading) {
    for (let node = heading; node && node !== target; node = node.parentElement) {
      if (node.classList?.contains('reveal')) node.classList.add('is-visible', 'is-reveal-immediate')
    }
  }
}
