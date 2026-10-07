// Focused curation for the product-first hero preview. The canonical portfolio
// inventory stays in portfolioData.js; this module only describes the public
// links and media that are safe to surface in the compact live-work section.

export const oneRidePreview = {
  projectId: 'one-ride-balingasag',
  sourceLabel: 'Google Play listing',
  sourceUrl: 'https://play.google.com/store/apps/details?id=com.oneridebalingasag.app&hl=en',
  screenshots: [
    {
      id: 'home',
      label: 'Home',
      src: '/projects/oneride/official-screen-01.png',
      alt: 'OneRide official Google Play screenshot 1 showing the customer home screen',
    },
    {
      id: 'stores',
      label: 'Stores',
      src: '/projects/oneride/official-screen-02.png',
      alt: 'OneRide official Google Play screenshot 2 showing the stores screen',
    },
    {
      id: 'orders',
      label: 'Orders',
      src: '/projects/oneride/official-screen-03.png',
      alt: 'OneRide official Google Play screenshot 3 showing the orders screen',
    },
  ],
}

export const liveProjectLinks = [
  {
    id: 'oneride-app',
    label: 'Open OneRide on Google Play',
    href: 'https://play.google.com/store/apps/details?id=com.oneridebalingasag.app&hl=en',
  },
  {
    id: 'oneride-site',
    label: 'Visit the OneRide product website',
    href: 'https://landing-oneride.vercel.app/',
  },
  {
    id: 'hasti',
    label: 'Try the Hasti voice demo',
    href: 'https://hasti.com.au/',
  },
  {
    id: 'gymfactories-designer',
    label: 'Open the GymFactories layout designer',
    href: 'https://gymfactories.com/designer',
  },
  {
    id: 'zalio-tour',
    label: 'Explore the Zalio product tour',
    href: 'https://zalio.ai/',
  },
]

export const liveProjectCards = [
  {
    id: 'hasti',
    title: 'Hasti',
    eyebrow: 'AI receptionist · public demo',
    summary: 'A public voice-led experience for first response, enquiry capture, and human handoff.',
    image: '/projects/hasti.png',
    imageAlt: 'Hasti public website showing its AI receptionist experience',
    link: liveProjectLinks.find((item) => item.id === 'hasti'),
  },
  {
    id: 'gymfactories',
    title: 'GymFactories',
    eyebrow: 'Planning workflow · public designer',
    summary: 'A public layout-planning workflow for exploring a gym space and equipment direction.',
    image: '/projects/gymfactories.png',
    imageAlt: 'GymFactories public product website',
    link: liveProjectLinks.find((item) => item.id === 'gymfactories-designer'),
  },
  {
    id: 'zalio',
    title: 'Zalio',
    eyebrow: 'Gym operations · public product tour',
    summary: 'A public product tour for a gym operations platform spanning CRM, retention, and workflows.',
    image: '/projects/zalio.png',
    imageAlt: 'Zalio public product tour',
    link: liveProjectLinks.find((item) => item.id === 'zalio-tour'),
  },
]

export const secondaryProjectLinks = [
  { id: 'g2pos', label: 'Open G2 POS System', href: 'https://g2possystem.vercel.app/landing' },
  { id: 'reflecticss', label: 'Open ReflectiCSS', href: 'https://reflecticss.vercel.app/' },
  { id: 'study-pulse', label: 'Open Study Pulse', href: 'https://study-pulse-ten.vercel.app/' },
  { id: 'ecycle-hub', label: 'Open E-Cycle Hub', href: 'https://ecyclehub.vercel.app/' },
]
