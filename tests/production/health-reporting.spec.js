import { test, expect } from '@playwright/test'

test.use({
  serviceWorkers: 'block', permissions: ['microphone'], reducedMotion: 'reduce',
  launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] },
})

async function prepare(page, { denyMicrophone = false, denySdkMicrophone = false, privacy = '', brokenInstaller = false, offlineTelemetry = false, failStart = false } = {}) {
  const events = []
  const sockets = []
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(({ denyMicrophone, denySdkMicrophone, privacy, brokenInstaller }) => {
    window.__healthTracks = []
    if (privacy === 'gpc') Object.defineProperty(navigator, 'globalPrivacyControl', { value: true, configurable: true })
    if (privacy === 'dnt') Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true })
    if (brokenInstaller) {
      const add = window.addEventListener.bind(window)
      window.addEventListener = (type, ...args) => {
        if (type === 'unhandledrejection' && String(args[0]).includes('app_unhandled_rejection')) throw new Error('test-only reporter initialization failure')
        return add(type, ...args)
      }
    }
    const getMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
    navigator.mediaDevices.getUserMedia = async (...args) => {
      // Our precheck and the SDK permission probe use audio:true; the SDK's
      // final input uses a constraint object, even under StrictMode replay.
      if (denyMicrophone || (denySdkMicrophone && args[0]?.audio !== true)) throw new DOMException('private permission explanation', 'NotAllowedError')
      const stream = await getMedia(...args)
      window.__healthTracks.push(...stream.getTracks())
      return stream
    }
  }, { denyMicrophone, denySdkMicrophone, privacy, brokenInstaller })
  await page.route('**/api/analytics', route => {
    events.push(route.request().postDataJSON())
    return offlineTelemetry ? route.abort() : route.fulfill({ status: 204 })
  })
  // Every provider HTTP/socket request is blocked or locally fulfilled. These
  // tests never create a real conversation or consume provider credits.
  await page.route('https://api.elevenlabs.io/**', route => route.abort())
  await page.routeWebSocket('wss://livekit.rtc.elevenlabs.io/**', socket => socket.close())
  await page.routeWebSocket('wss://api.elevenlabs.io/**', socket => {
    sockets.push(socket)
    socket.onMessage(raw => {
      if (JSON.parse(String(raw)).type !== 'conversation_initiation_client_data') return
      if (failStart) return socket.close({ code: 1011, reason: 'private@example.test private start failure' })
      socket.send(JSON.stringify({
        type: 'conversation_initiation_metadata',
        conversation_initiation_metadata_event: { conversation_id: 'local-health-fixture', agent_output_audio_format: 'pcm_48000', user_input_audio_format: 'pcm_48000' },
      }))
    })
  })
  await page.goto('/#live-agent')
  await expect(page.locator('.footer-analytics-note')).toHaveCount(1)
  return { events, sockets, errors, panel: page.locator('#live-agent') }
}

const healthEvents = events => events.filter(event => event.event === 'portfolio_health_error')
const privatePattern = /private@example|private transcript|private diagnostic|private-token|conversation_id|stack|filename|message|reason|https?:/i

async function startVoice(panel) {
  await panel.getByRole('button', { name: 'Start a live conversation', exact: true }).click()
  await expect(panel.locator('.live-agent-status')).toHaveText('Listening… go ahead')
}

async function emitPrivateErrors(page) {
  await page.evaluate(() => {
    const privateValue = 'private@example.test private transcript private-token'
    for (let n = 0; n < 3; n++) {
      window.dispatchEvent(new ErrorEvent('error', { message: privateValue, error: new Error(privateValue), filename: `https://private.example/${privateValue}` }))
      window.dispatchEvent(new PromiseRejectionEvent('unhandledrejection', { promise: Promise.resolve(), reason: new Error(privateValue) }))
      const image = document.createElement('img')
      image.dataset.private = privateValue
      document.body.append(image)
      image.dispatchEvent(new Event('error'))
      image.remove()
    }
  })
}

test('global browser failures send only deduplicated fixed categories with no private details', async ({ page }) => {
  const { events, errors } = await prepare(page)
  await emitPrivateErrors(page)
  await expect.poll(() => healthEvents(events).length).toBe(3)
  expect(healthEvents(events).map(event => event.properties)).toEqual([
    { surface: 'app', code: 'app_unhandled' },
    { surface: 'app', code: 'app_unhandled_rejection' },
    { surface: 'app', code: 'asset_load_failed' },
  ])
  expect(JSON.stringify(healthEvents(events))).not.toMatch(privatePattern)
  expect(errors).toEqual([])
})

test('telemetry network failures stay bounded without blocking the page or recursively reporting themselves', async ({ page }) => {
  const { events, errors } = await prepare(page, { offlineTelemetry: true })
  await emitPrivateErrors(page)
  await expect.poll(() => healthEvents(events).length).toBe(3)
  await page.waitForTimeout(150)
  await emitPrivateErrors(page)
  expect(healthEvents(events)).toHaveLength(3)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  expect(errors).toEqual([])
})

test('a reporter initialization exception does not prevent React rendering', async ({ page }) => {
  const { events, errors } = await prepare(page, { brokenInstaller: true })
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await emitPrivateErrors(page)
  expect(healthEvents(events)).toEqual([])
  expect(errors).toEqual([])
})

for (const privacy of ['dnt', 'gpc']) test(`${privacy} suppresses browser and voice health reports while controls remain usable`, async ({ page }) => {
  const { events, sockets, panel, errors } = await prepare(page, { privacy })
  await emitPrivateErrors(page)
  await startVoice(panel)
  sockets[0].close({ code: 1011, reason: 'private@example.test private diagnostic' })
  await expect(panel.getByRole('button', { name: 'Continue in text', exact: true })).toBeVisible()
  expect(healthEvents(events)).toEqual([])
  expect(errors).toEqual([])
})

test('a rejected provider start sends one fixed start category without provider diagnostic text', async ({ page }) => {
  const { events, panel } = await prepare(page, { failStart: true })
  await panel.getByRole('button', { name: 'Start a live conversation', exact: true }).click()
  await expect(panel.getByRole('button', { name: 'Continue in text', exact: true })).toBeVisible()
  await expect.poll(() => healthEvents(events).length).toBe(1)
  expect(healthEvents(events)[0].properties).toEqual({ surface: 'voice_home', code: 'voice_start_failed' })
  expect(JSON.stringify(healthEvents(events))).not.toMatch(privatePattern)
})

test('provider error and disconnect callbacks send one connection failure and release audio', async ({ page }) => {
  const { events, sockets, panel, errors } = await prepare(page)
  await startVoice(panel)
  sockets[0].send(JSON.stringify({ type: 'user_transcript', user_transcription_event: { user_transcript: 'private transcript private@example.test', event_id: 1 } }))
  sockets[0].send(JSON.stringify({ type: 'error', error_event: { error_type: 'service_unavailable', message: 'private@example.test private diagnostic' } }))
  sockets[0].close({ code: 1011, reason: 'private@example.test private diagnostic' })
  await expect(panel.getByRole('button', { name: 'Continue in text', exact: true })).toBeVisible()
  await expect.poll(() => healthEvents(events).length).toBe(1)
  expect(healthEvents(events)[0].properties).toEqual({ surface: 'voice_home', code: 'voice_connection_lost' })
  await expect.poll(() => page.evaluate(() => window.__healthTracks.every(track => track.readyState === 'ended'))).toBe(true)
  expect(JSON.stringify(healthEvents(events))).not.toMatch(privatePattern)
  expect(errors).toEqual([])
})

test('a failed starter send emits only the send category and keeps voice controls usable', async ({ page }) => {
  const { events, panel, errors } = await prepare(page)
  await startVoice(panel)
  await page.evaluate(() => {
    const send = WebSocket.prototype.send
    WebSocket.prototype.send = function (data) {
      if (typeof data === 'string' && JSON.parse(data).type === 'user_message') throw new Error('private diagnostic private@example.test')
      return send.call(this, data)
    }
  })
  await panel.getByRole('button', { name: 'Show me your CRM work', exact: true }).click()
  await expect(panel.getByRole('alert')).toContainText('could not be sent')
  await expect.poll(() => healthEvents(events).length).toBe(1)
  expect(healthEvents(events)[0].properties).toEqual({ surface: 'voice_home', code: 'voice_send_failed' })
  await panel.getByRole('button', { name: 'End conversation', exact: true }).click()
  expect(healthEvents(events)).toHaveLength(1)
  expect(JSON.stringify(healthEvents(events))).not.toMatch(privatePattern)
  expect(errors).toEqual([])
})

test('permission refusal never creates a provider connection or a health incident', async ({ page }) => {
  const { events, sockets, panel, errors } = await prepare(page, { denyMicrophone: true })
  await panel.getByRole('button', { name: 'Start a live conversation', exact: true }).click()
  await expect(panel.getByRole('alert')).toContainText('Microphone access was blocked')
  expect(sockets).toHaveLength(0)
  expect(healthEvents(events)).toEqual([])
  expect(errors).toEqual([])
})

test('permission revoked between the precheck and SDK access does not create a false service incident', async ({ page }) => {
  const { events, panel, errors } = await prepare(page, { denySdkMicrophone: true })
  await panel.getByRole('button', { name: 'Start a live conversation', exact: true }).click()
  await expect(panel.getByRole('button', { name: 'Continue in text', exact: true })).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.__healthTracks.every(track => track.readyState === 'ended'))).toBe(true)
  await page.waitForTimeout(150)
  expect(healthEvents(events)).toEqual([])
  expect(errors).toEqual([])
})

for (const ending of ['manual', 'goodbye', 'no-input', 'timer', 'provider-timer', 'cleanup']) test(`${ending} ends release audio without a false incident`, async ({ page }) => {
  if (ending === 'timer') await page.clock.install()
  const { events, sockets, panel, errors } = await prepare(page)
  await startVoice(panel)
  if (ending === 'manual') await panel.getByRole('button', { name: 'End conversation', exact: true }).click()
  if (ending === 'goodbye') sockets[0].send(JSON.stringify({ type: 'user_transcript', user_transcription_event: { user_transcript: 'Thank you, goodbye Alex!', event_id: 2 } }))
  if (ending === 'no-input') sockets[0].close({ code: 1000, reason: 'No input' })
  if (ending === 'timer') await page.clock.fastForward(60_000)
  if (ending === 'provider-timer') sockets[0].send(JSON.stringify({ type: 'error', error_event: { error_type: 'max_duration_exceeded', message: 'private diagnostic timer limit' } }))
  if (ending === 'cleanup') await page.getByRole('link', { name: 'Projects', exact: true }).first().click()
  await expect.poll(() => page.evaluate(() => window.__healthTracks.every(track => track.readyState === 'ended'))).toBe(true)
  await page.waitForTimeout(150)
  expect(healthEvents(events)).toEqual([])
  expect(errors).toEqual([])
})
