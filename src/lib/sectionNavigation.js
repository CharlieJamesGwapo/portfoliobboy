// Native disclosures keep the homepage short. Reveal every ancestor before a
// fragment jump or focus transfer so shared links and keyboard navigation work.
export function revealSection(target) {
  for (let node = target; node; node = node.parentElement) {
    if (node.tagName === 'DETAILS') node.open = true
  }
}
