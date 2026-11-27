// Production Vite previews do not serve Vercel's BotID challenge endpoint.
// This supplies only a client challenge for UI tests whose /api/contact calls
// are intercepted separately. It cannot pass real hosted verification.
export async function mockContactBotChallenge(page) {
  await page.route('**/149e9513-01fa-4fb0-aad4-566afd725d1b/**/c.js?*', route => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: 'window.V_C.push({b:1,v:"ui-test-only",e:"ui-test-only",d:0});',
  }))
}
