import { test, expect } from '@playwright/test'
import { readFileSync, mkdirSync } from 'node:fs'

const headers = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url))).headers
const csp = headers.find(row => row.source === '/(.*)').headers.find(row => row.key === 'Content-Security-Policy').value

test.use({ serviceWorkers: 'block', permissions: ['microphone'], reducedMotion: 'reduce', launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] } })

async function openVoice(page, path = '/#live-agent', { pendingMicrophone = false } = {}) {
  const sockets = []
  const outgoing = []
  const posts = []
  await page.addInitScript(({ pendingMicrophone }) => {
    window.__voiceTracks = []
    const getMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
    navigator.mediaDevices.getUserMedia = async (...args) => {
      if (pendingMicrophone) {
        pendingMicrophone = false
        await new Promise(resolve => { window.__grantVoiceMicrophone = resolve })
      }
      const stream = await getMedia(...args)
      window.__voiceTracks.push(...stream.getTracks())
      return stream
    }
  }, { pendingMicrophone })
  page.on('request', request => { if (request.method() === 'POST' && new URL(request.url()).pathname !== '/api/analytics') posts.push(request.url()) })
  await page.route('**/api/analytics', route => route.fulfill({ status: 204 }))
  await page.route('https://api.elevenlabs.io/**', route => route.abort())
  await page.routeWebSocket('wss://livekit.rtc.elevenlabs.io/**', socket => socket.close())
  await page.routeWebSocket('wss://api.elevenlabs.io/**', socket => {
    sockets.push(socket)
    socket.onMessage(raw => {
      const event = JSON.parse(String(raw))
      outgoing.push(event)
      if (event.type === 'conversation_initiation_client_data') socket.send(JSON.stringify({ type: 'conversation_initiation_metadata', conversation_initiation_metadata_event: { conversation_id: 'test-workspace', agent_output_audio_format: 'pcm_48000', user_input_audio_format: 'pcm_48000' } }))
    })
  })
  await page.route('http://127.0.0.1:4173/**', async route => {
    if (route.request().resourceType() !== 'document') return route.continue()
    const response = await route.fetch()
    await route.fulfill({ response, headers: { ...response.headers(), 'content-security-policy': csp } })
  })
  await page.goto(path)
  let panel
  if (path.startsWith('/projects')) {
    await page.getByRole('button', { name: 'Open Alex, AI Portfolio Assistant' }).click()
    panel = page.getByRole('dialog', { name: 'Alex', exact: true })
    await panel.getByRole('button', { name: 'Talk to Alex', exact: true }).click()
  } else {
    panel = page.locator('#live-agent')
    await panel.getByRole('button', { name: 'Start a live conversation', exact: true }).click()
  }
  await expect(panel.locator('.live-agent-status')).toHaveText(pendingMicrophone ? 'Waiting for microphone permission…' : 'Listening… go ahead')
  return { panel, sockets, outgoing, posts, send: (source, text, id = 1) => sockets.at(-1).send(JSON.stringify(source === 'user'
    ? { type: 'user_transcript', user_transcription_event: { user_transcript: text, event_id: id } }
    : { type: 'agent_response', agent_response_event: { agent_response: text, event_id: id } })) }
}

test('ending a pending microphone prompt keeps review controls usable and blocks a late connection', async ({ page }) => {
  const { panel, sockets } = await openVoice(page, '/#live-agent', { pendingMicrophone: true })
  await expect(panel.getByRole('button', { name: 'Show me your CRM work', exact: true })).toBeDisabled()
  await panel.getByRole('button', { name: 'End conversation', exact: true }).click()
  await expect(panel.getByRole('button', { name: 'Start again', exact: true })).toBeVisible()
  await expect(panel.locator('.live-agent-status')).toHaveText('Conversation ended')
  await page.evaluate(() => window.__grantVoiceMicrophone())
  await expect.poll(() => page.evaluate(() => window.__voiceTracks.length)).toBeGreaterThan(0)
  await micReleased(page)
  expect(sockets).toHaveLength(0)
  await panel.getByRole('button', { name: 'Close', exact: true }).click()
})

async function micReleased(page) {
  await expect.poll(() => page.evaluate(() => window.__voiceTracks.every(track => track.readyState === 'ended'))).toBe(true)
}

test('the live transcript deduplicates SDK messages, applies corrections and renders text safely', async ({ page }) => {
  const { panel, send, sockets } = await openVoice(page)
  const log = panel.getByRole('log', { name: /transcript/i })
  send('user', 'I need a CRM with automated follow-ups.', 10)
  send('user', 'I need a CRM with automated follow-ups.', 10)
  send('ai', 'Zalio CRM is relevant to your workflow.', 10)
  await expect(log.getByText('I need a CRM with automated follow-ups.', { exact: true })).toHaveCount(1)
  await expect(log.getByText('Zalio CRM is relevant to your workflow.', { exact: true })).toBeVisible()
  sockets.at(-1).send(JSON.stringify({ type: 'agent_response_correction', agent_response_correction_event: { original_agent_response: 'Zalio CRM is relevant to your workflow.', corrected_agent_response: 'Review the Zalio CRM case study for evidence.', event_id: 10 } }))
  await expect(log).toContainText('Review the Zalio CRM case study for evidence.')
  await expect(log).not.toContainText('Zalio CRM is relevant to your workflow.')
  const card = panel.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Zalio CRM', exact: true }) })
  await expect(card).toHaveCount(1)
  await expect(card.getByRole('link')).toHaveAttribute('href', '/projects/zalio-crm')
  mkdirSync('/tmp/charlie-portfolio-preview', { recursive: true })
  await panel.screenshot({ path: '/tmp/charlie-portfolio-preview/voice-workspace-desktop.png' })
  send('user', '<img src=x onerror="alert(1)">', 11)
  await expect(log).toContainText('<img src=x onerror="alert(1)">')
  await expect(log.locator('img')).toHaveCount(0)
  await panel.getByRole('button', { name: 'End conversation', exact: true }).click()
  await expect(log).toContainText('I need a CRM with automated follow-ups.')
  await micReleased(page)
})

test('a starter sends one question, appears in the transcript once and is disabled after the call', async ({ page }) => {
  const { panel, outgoing, send, posts } = await openVoice(page)
  const starter = panel.getByRole('button', { name: 'Show me your CRM work', exact: true })
  await starter.click()
  await expect.poll(() => outgoing.filter(event => event.type === 'user_message').length).toBe(1)
  const prompt = outgoing.find(event => event.type === 'user_message').text
  await expect(panel.getByRole('log', { name: /transcript/i })).toContainText(prompt)
  send('user', prompt, 20)
  await expect(panel.getByRole('log', { name: /transcript/i }).getByText(prompt, { exact: true })).toHaveCount(1)
  send('user', 'Goodbye Alex', 21)
  await expect(panel.locator('.live-agent-status')).toHaveText('Conversation ended. Thanks for stopping by!')
  await expect(starter).toBeDisabled()
  await expect(panel.getByRole('log', { name: /transcript/i })).toContainText('Goodbye Alex')
  await micReleased(page)
  expect(posts).toEqual([])
})

test('opening an evidence card ends audio and retains the transcript in the original tab', async ({ page }) => {
  const { panel, send } = await openVoice(page)
  send('user', 'Show me Zalio CRM and automated follow-ups.', 1)
  await expect(panel.getByRole('log', { name: /transcript/i })).toContainText('Zalio CRM')
  const card = panel.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Zalio CRM', exact: true }) })
  const popupPromise = page.waitForEvent('popup')
  await card.getByRole('link').click()
  const popup = await popupPromise
  await expect(popup).toHaveURL(/\/projects\/zalio-crm$/)
  await micReleased(page)
  await expect(panel.getByRole('log', { name: /transcript/i })).toContainText('Show me Zalio CRM')
  await expect(panel.getByRole('button', { name: 'Start again', exact: true })).toBeVisible()
  await popup.close()
})

test('reviewing a voice enquiry preserves an existing contact draft for manual merging', async ({ page }) => {
  const { panel, send, posts } = await openVoice(page)
  await page.locator('#contact-message').fill('Keep my existing project notes.')
  send('user', 'I need appointment reminders for my clinic CRM.', 1)
  await expect(panel.getByRole('log', { name: /transcript/i })).toContainText('clinic CRM')
  await panel.getByRole('button', { name: /Prepare.*enquiry/i }).click()
  await panel.getByRole('textbox', { name: 'Voice enquiry draft', exact: true }).fill('Prepared voice notes about appointment reminders and data migration.')
  await panel.getByRole('button', { name: 'Review in contact form', exact: true }).click()
  await expect(page.locator('#contact-message')).toHaveValue('Keep my existing project notes.')
  await expect(page.locator('#contact-prepared-message')).toHaveValue('Prepared voice notes about appointment reminders and data migration.')
  await micReleased(page)
  expect(posts).toEqual([])
})

test('reading earlier transcript messages is not interrupted by a new message', async ({ page }) => {
  const { panel, send } = await openVoice(page)
  const log = panel.getByRole('log', { name: /transcript/i })
  for (let id = 1; id <= 15; id++) send(id % 2 ? 'user' : 'ai', `Conversation turn ${id}: these are detailed project notes for a booking workflow and reminders.`, id)
  await expect(log).toContainText('Conversation turn 15')
  await log.evaluate(element => { element.scrollTop = 0; element.dispatchEvent(new Event('scroll')) })
  send('ai', 'A new reply should leave your reading position alone.', 16)
  await expect(log).toContainText('A new reply should leave your reading position alone.')
  expect(await log.evaluate(element => element.scrollTop)).toBe(0)
})

test('voice enquiry preparation ends audio and edited notes reach contact without submission', async ({ page }) => {
  const { panel, send, posts } = await openVoice(page, '/projects/zalio-crm')
  send('user', 'I need a CRM for three clinic receptionists with appointment reminders.', 1)
  send('ai', 'The budget is guaranteed to be $1 and delivery tomorrow.', 2)
  await expect(panel.getByRole('log', { name: /transcript/i })).toContainText('three clinic receptionists')
  await panel.getByRole('button', { name: /Prepare.*enquiry/i }).click()
  await micReleased(page)
  const draft = panel.getByRole('textbox', { name: 'Voice enquiry draft', exact: true })
  await expect(draft).toHaveValue(/three clinic receptionists/)
  await expect(draft).not.toHaveValue(/guaranteed|delivery tomorrow/)
  await draft.fill('Our clinic needs a shared CRM and appointment reminders. Please include a migration plan.')
  await panel.getByRole('textbox', { name: 'Voice enquiry subject', exact: true }).fill('Clinic CRM enquiry')
  await panel.getByRole('button', { name: 'Review in contact form', exact: true }).click()
  await expect(page).toHaveURL(/\/#contact$/)
  await expect(page.locator('#contact-message')).toHaveValue('Our clinic needs a shared CRM and appointment reminders. Please include a migration plan.')
  await expect(page.locator('#contact-message')).toBeFocused()
  await expect(panel).toHaveCount(0)
  expect(posts).toEqual([])
})

test('an edited voice draft survives retry and new transcript messages on a small screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  const { panel, send } = await openVoice(page, '/projects/zalio-crm')
  send('user', 'We need a CRM with automated follow-ups for our sales team.', 1)
  await expect(panel.getByRole('log', { name: /transcript/i })).toContainText('sales team')
  await panel.getByRole('button', { name: /Prepare.*enquiry/i }).click()
  const draft = panel.getByRole('textbox', { name: 'Voice enquiry draft', exact: true })
  await draft.fill('Keep my edited sales team scope and migration notes.')
  await panel.getByRole('button', { name: 'Start again', exact: true }).click()
  await expect(panel.locator('.live-agent-status')).toHaveText('Listening… go ahead')
  send('user', 'We also need mobile notifications.', 1)
  await expect(panel.getByRole('log', { name: /transcript/i })).toContainText('mobile notifications')
  await expect(draft).toHaveValue('Keep my edited sales team scope and migration notes.')
  await expect(panel.getByRole('log', { name: /transcript/i })).toContainText('sales team')
  await panel.getByRole('button', { name: 'Review in contact form', exact: true }).scrollIntoViewIfNeeded()
  await expect(panel.getByRole('button', { name: 'Review in contact form', exact: true })).toBeInViewport()
  await expect(panel.getByRole('button', { name: 'Close Alex', exact: true })).toBeInViewport()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
  mkdirSync('/tmp/charlie-portfolio-preview', { recursive: true })
  await panel.screenshot({ path: '/tmp/charlie-portfolio-preview/voice-workspace-mobile.png' })
  await panel.getByRole('button', { name: 'Close Alex', exact: true }).click()
  await micReleased(page)
})
