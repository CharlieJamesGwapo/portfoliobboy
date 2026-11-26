import { oneRidePreview } from './productPreviewData.js'

// The images show customer-app screens, not a simulated live trip.
export const oneRideStory = {
  headline: 'One local service. Connected customer, rider and operations workflows.',
  introduction: 'OneRide brings motorcycle ride booking, parcel delivery, ride sharing and local-store orders together for Balingasag. My work connects the mobile experience with the API, web clients and administrative tools behind it.',
  contributions: [
    { title: 'Customer and rider experiences', text: 'Built mobile workflows with React Native and Expo, including maps, fare estimates, scheduled and recurring bookings.' },
    { title: 'The API and data layer', text: 'Built the Go/Gin backend with PostgreSQL and GORM, using OTP and JWT authentication and WebSockets for rider tracking.' },
    { title: 'Web and daily operations', text: 'Built React and TypeScript web and administrative workflows alongside rider and store operations, payments, ratings and SOS features.' },
  ],
  walkthrough: [
    { ...oneRidePreview.screenshots[0], title: 'A shared starting point', detail: 'The home screen brings store discovery, transport and delivery entry points into one customer workspace.', observation: 'Visible here: store cards, a destination prompt and the service area.' },
    { ...oneRidePreview.screenshots[1], title: 'Find a local store', detail: 'Customers can browse categories and scan featured and nearby stores before opening a store.', observation: 'Visible here: category filters, store search, ratings and open-state labels. Values are those shown in the published screenshot.' },
    { ...oneRidePreview.screenshots[2], title: 'Keep orders in view', detail: 'The orders screen groups ongoing, completed and cancelled orders. This published image shows the empty state before an order is placed.', observation: 'Visible here: order-status filters and the no-active-orders state. A live trip is not shown.' },
  ],
  evidence: [
    { title: 'Published customer app', detail: 'The Android app is publicly listed on Google Play. The listing describes ride booking, delivery, ride sharing, local stores and GPS tracking.', href: oneRidePreview.sourceUrl, label: 'View the Google Play listing' },
    { title: 'Public product website', detail: 'The product site explains the service flows and currently labels the offering as beta testing in Balingasag.', href: 'https://landing-oneride.vercel.app/', label: 'Explore the public website' },
  ],
  checkedAt: '27 November 2026',
}
