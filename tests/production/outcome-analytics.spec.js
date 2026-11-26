import { test, expect } from '@playwright/test'

test.use({ serviceWorkers: 'block', permissions: ['microphone'], reducedMotion: 'reduce', launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] } })

async function prepare(page, { denyMicrophone = false, privacy = false } = {}) {
  const events = []
  const outgoing = []
  const sockets = []
  await page.addInitScript(({ denyMicrophone, privacy }) => {
    window.__voiceTracks = []
    if (privacy) Object.defineProperty(navigator, 'globalPrivacyControl', { value: true, configurable: true })
    const getMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
    navigator.mediaDevices.getUserMedia = async (...args) => {
      if (denyMicrophone) throw new DOMException('Permission denied', 'NotAllowedError')
      const stream = await getMedia(...args)
      window.__voiceTracks.push(...stream.getTracks())
      return stream
    }
  }, { denyMicrophone, privacy })
  await page.route('**/api/analytics', route => {
    events.push(route.request().postDataJSON())
    return route.fulfill({ status: 204 })
  })
  await page.route('https://api.elevenlabs.io/**', route => route.abort())
  await page.routeWebSocket('wss://livekit.rtc.elevenlabs.io/**', socket => socket.close())
  await page.routeWebSocket('wss://api.elevenlabs.io/**', socket => {
    sockets.push(socket)
    socket.onMessage(raw => {
    const event = JSON.parse(String(raw))
    outgoing.push(event)
    if (event.type === 'conversation_initiation_client_data') socket.send(JSON.stringify({ type: 'conversation_initiation_metadata', conversation_initiation_metadata_event: { conversation_id: 'test-outcomes', agent_output_audio_format: 'pcm_48000', user_input_audio_format: 'pcm_48000' } }))
    })
  })
  await page.goto('/#live-agent')
  const panel = page.locator('#live-agent')
  await panel.getByRole('button', { name: 'Start a live conversation', exact: true }).click()
  return { panel, events, outgoing, sockets, analyticsEnabled: await page.locator('.footer-analytics-note').count() > 0 }
}

test('explicit voice outcomes are counted without transcript or enquiry content', async ({ page }) => {
  const { panel, events, outgoing, analyticsEnabled } = await prepare(page)
  test.skip(!analyticsEnabled, 'Optional analytics build configuration is disabled')
  await expect(panel.locator('.live-agent-status')).toHaveText('Listening… go ahead')
  await expect.poll(() => events.filter(event => event.event === 'portfolio_voice_started').length).toBe(1)
  await expect.poll(() => outgoing.filter(event => event.type === 'contextual_update').length).toBe(1)
  const context = outgoing.find(event => event.type === 'contextual_update').text
  expect(context).toContain('Charlie')
  expect(context).toContain('/projects/zalio-crm')
  await panel.getByRole('button', { name: 'Show me your CRM work', exact: true }).click()
  await expect.poll(() => events.filter(event => event.event === 'portfolio_starter_used').length).toBe(1)
  const card = panel.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Zalio CRM', exact: true }) })
  const popupPromise = page.waitForEvent('popup')
  await card.getByRole('link').click()
  const popup = await popupPromise
  await popup.close()
  await expect.poll(() => events.filter(event => event.event === 'portfolio_project_opened').length).toBe(1)
  await panel.getByRole('button', { name: 'Prepare enquiry draft', exact: true }).click()
  await panel.getByRole('textbox', { name: 'Voice enquiry draft', exact: true }).fill('Private clinic details must never appear in analytics.')
  await panel.getByRole('button', { name: 'Review in contact form', exact: true }).click()
  await expect.poll(() => events.filter(event => event.event === 'portfolio_enquiry_reviewed').length).toBe(1)
  expect(events.some(event => event.event === 'portfolio_contact_submitted')).toBe(false)
  expect(JSON.stringify(events)).not.toMatch(/Private clinic|Show me your CRM work|email|transcript|message|conversation_id/)
  for (const event of events) expect(Object.keys(event).sort()).toEqual(['event', 'properties'])
})

test('global privacy control suppresses analytics without blocking a voice call', async ({ page }) => {
  const { panel, events, analyticsEnabled } = await prepare(page, { privacy: true })
  test.skip(!analyticsEnabled, 'Optional analytics build configuration is disabled')
  await expect(panel.locator('.live-agent-status')).toHaveText('Listening… go ahead')
  await panel.getByRole('button', { name: 'Show me your CRM work', exact: true }).click()
  await expect(panel.getByRole('log', { name: /transcript/i })).toContainText('Show me your CRM work')
  await panel.getByRole('button', { name: 'End conversation', exact: true }).click()
  expect(events).toEqual([])
})

test('a denied microphone offers a local text fallback with no detached voice connection', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  const { panel, events, outgoing } = await prepare(page, { denyMicrophone: true })
  await expect(panel.getByRole('alert')).toContainText('Microphone access was blocked')
  await panel.getByRole('button', { name: 'Continue in text', exact: true }).click()
  await expect(panel.locator('.live-agent-status')).toHaveText('Text mode · microphone off')
  await panel.getByRole('textbox', { name: 'Ask Alex in text', exact: true }).fill('I need a CRM with automated follow-ups for a clinic.')
  await panel.getByRole('button', { name: 'Send text question', exact: true }).click()
  await expect(panel.getByRole('log', { name: /transcript/i })).toContainText('clinic')
  await expect(panel.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Zalio CRM', exact: true }) })).toBeVisible()
  await panel.getByRole('textbox', { name: 'Ask Alex in text', exact: true }).fill('What is the guaranteed project price and delivery date?')
  await panel.getByRole('button', { name: 'Send text question', exact: true }).click()
  await expect(panel.getByRole('log', { name: /transcript/i })).toContainText(/confirm|discuss/i)
  await expect(panel.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Zalio CRM', exact: true }) })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
  await panel.getByRole('textbox', { name: 'Ask Alex in text', exact: true }).scrollIntoViewIfNeeded()
  await expect(panel.getByRole('textbox', { name: 'Ask Alex in text', exact: true })).toBeInViewport()
  await panel.screenshot({ path: '/tmp/charlie-portfolio-preview/alex-text-fallback-mobile.png' })
  await panel.getByRole('button', { name: 'Prepare enquiry draft', exact: true }).click()
  await expect(panel.getByRole('textbox', { name: 'Voice enquiry draft', exact: true })).toHaveValue(/clinic/)
  expect(outgoing).toEqual([])
  expect(events.some(event => event.event === 'portfolio_voice_started')).toBe(false)
})

test('provider failure can switch to text while retaining an edited draft and releasing audio', async ({ page }) => {
  const { panel, sockets, events } = await prepare(page)
  await expect(panel.locator('.live-agent-status')).toHaveText('Listening… go ahead')
  sockets[0].send(JSON.stringify({ type: 'user_transcript', user_transcription_event: { user_transcript: 'We need clinic CRM reminders and a migration plan.', event_id: 1 } }))
  await expect(panel.getByRole('log', { name: /transcript/i })).toContainText('clinic CRM')
  await panel.getByRole('button', { name: 'Prepare enquiry draft', exact: true }).click()
  const draft = panel.getByRole('textbox', { name: 'Voice enquiry draft', exact: true })
  await draft.fill('Keep my edited clinic scope and migration details.')
  await panel.getByRole('button', { name: 'Start again', exact: true }).click()
  await expect(panel.locator('.live-agent-status')).toHaveText('Listening… go ahead')
  sockets[1].close({ code: 1011, reason: 'Provider unavailable' })
  await expect(panel.getByRole('button', { name: 'Continue in text', exact: true })).toBeVisible()
  await panel.getByRole('button', { name: 'Continue in text', exact: true }).click()
  await expect(panel.locator('.live-agent-status')).toHaveText('Text mode · microphone off')
  await expect(draft).toHaveValue('Keep my edited clinic scope and migration details.')
  await expect(panel.getByRole('log', { name: /transcript/i })).toContainText('clinic CRM')
  await expect.poll(() => page.evaluate(() => window.__voiceTracks.every(track => track.readyState === 'ended'))).toBe(true)
  expect(sockets).toHaveLength(2)
  expect(JSON.stringify(events)).not.toMatch(/clinic|migration|Provider unavailable/)
})
