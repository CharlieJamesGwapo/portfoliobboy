import { test, expect } from '@playwright/test'
import { mkdirSync, readFileSync } from 'node:fs'

const config = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'))
const csp = config.headers.find(rule => rule.source === '/(.*)').headers.find(h => h.key === 'Content-Security-Policy').value

test.use({
  serviceWorkers: 'block',
  permissions: ['microphone'],
  launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] },
})

async function prepare(page, onSocket) {
  await page.route('**/api/analytics', route => route.fulfill({ status: 204 }))
  // Exercise the real built SDK with generated audio and local signalling;
  // no request may create a provider conversation or use a real microphone.
  await page.addInitScript(() => {
    window.__voiceTracks = []
    const getUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
    navigator.mediaDevices.getUserMedia = async (...args) => {
      const stream = await getUserMedia(...args)
      window.__voiceTracks.push(...stream.getTracks())
      return stream
    }
  })
  await page.route('https://api.elevenlabs.io/**', route => route.abort())
  await page.routeWebSocket('wss://livekit.rtc.elevenlabs.io/**', socket => socket.close())
  await page.routeWebSocket('wss://api.elevenlabs.io/**', onSocket)
  await page.route('http://127.0.0.1:4173/', async route => {
    const response = await route.fetch()
    await route.fulfill({ response, headers: { ...response.headers(), 'content-security-policy': csp } })
  })
  await page.goto('/#live-agent')
  test.skip(await page.locator('#live-agent').count() === 0, 'Optional live voice is not configured in this build')
  await page.getByRole('button', { name: 'Start a live conversation', exact: true }).click()
}

function startVoice(socket) {
  socket.send(JSON.stringify({
    type: 'conversation_initiation_metadata',
    conversation_initiation_metadata_event: {
      conversation_id: 'test-voice', agent_output_audio_format: 'pcm_48000', user_input_audio_format: 'pcm_48000',
    },
  }))
}

test('voice reaches the greeting over WebSocket under production CSP and closes cleanly', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  let sentAudio = false
  let closed = false
  await prepare(page, socket => {
    socket.onClose(() => { closed = true })
    socket.onMessage(message => {
      const event = JSON.parse(String(message))
      if (event.type === 'conversation_initiation_client_data') startVoice(socket)
      if (event.user_audio_chunk && !sentAudio) {
        sentAudio = true
        const pcm = Buffer.alloc(48000 * 2)
        for (let i = 0; i < 48000; i++) pcm.writeInt16LE(Math.round(Math.sin(i * 2 * Math.PI * 440 / 48000) * 1200), i * 2)
        socket.send(JSON.stringify({ type: 'audio', audio_event: { audio_base_64: pcm.toString('base64'), event_id: 1 } }))
      }
    })
  })
  await expect(page.locator('.live-agent-status')).toHaveText('Assistant is speaking')
  await expect(page.locator('#live-agent')).toContainText('limited to 1 minute')
  await expect(page.locator('.live-agent-clock')).toContainText('Time left')
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => { document.documentElement.dataset.theme = theme }, theme)
    for (const button of await page.locator('.live-agent-controls button').all()) {
      const contrast = await button.evaluate(element => {
        const luminance = color => {
          const channels = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(value => {
            const n = value / 255
            return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4
          })
          return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
        }
        const style = getComputedStyle(element)
        const values = [luminance(style.color), luminance(style.backgroundColor)].sort((a, b) => a - b)
        return (values[1] + 0.05) / (values[0] + 0.05)
      })
      expect(contrast, `${theme} button text contrast`).toBeGreaterThanOrEqual(4.5)
    }
  }
  mkdirSync('/tmp/charlie-portfolio-preview', { recursive: true })
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 960 })
    const panel = page.locator('#live-agent')
    await panel.scrollIntoViewIfNeeded()
    const bounds = await panel.boundingBox()
    expect(bounds.x).toBeGreaterThanOrEqual(0)
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
    for (const button of await page.locator('.live-agent-controls button').all()) {
      const touch = await button.boundingBox()
      expect(touch.height).toBeGreaterThanOrEqual(44)
      expect(touch.width).toBeGreaterThanOrEqual(44)
    }
    await panel.screenshot({ path: `/tmp/charlie-portfolio-preview/live-voice-${width}.png` })
  }
  expect(sentAudio).toBe(true)
  await page.locator('#live-agent').getByRole('button', { name: 'Mute', exact: true }).click()
  await expect(page.locator('#live-agent').getByRole('button', { name: 'Unmute', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.locator('#live-agent').getByRole('button', { name: 'End conversation', exact: true }).click()
  await expect(page.locator('#live-agent').getByRole('button', { name: 'Start again', exact: true })).toBeVisible()
  await page.locator('#live-agent').getByRole('button', { name: 'Close', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Start a live conversation', exact: true })).toBeVisible()
  await expect.poll(() => closed).toBe(true)
  await expect.poll(() => page.evaluate(() => window.__voiceTracks.every(track => track.readyState === 'ended'))).toBe(true)
  expect(errors).toEqual([])
})

test('a visitor farewell ends the call immediately, while mentioning goodbye keeps it open', async ({ page }) => {
  let connection
  let closed = false
  await prepare(page, socket => {
    connection = socket
    socket.onClose(() => { closed = true })
    socket.onMessage(message => {
      if (JSON.parse(String(message)).type === 'conversation_initiation_client_data') startVoice(socket)
    })
  })
  await expect(page.locator('.live-agent-status')).toHaveText('Listening… go ahead')
  connection.send(JSON.stringify({ type: 'user_transcript', user_transcription_event: { user_transcript: "Don't say goodbye yet", event_id: 1 } }))
  await expect(page.locator('.live-agent-status')).toHaveText('Listening… go ahead')
  connection.send(JSON.stringify({ type: 'user_transcript', user_transcription_event: { user_transcript: 'Thank you, goodbye Alex!', event_id: 2 } }))
  await expect(page.locator('.live-agent-status')).toHaveText('Conversation ended. Thanks for stopping by!')
  await expect.poll(() => closed).toBe(true)
  await expect.poll(() => page.evaluate(() => window.__voiceTracks.every(track => track.readyState === 'ended'))).toBe(true)
  await expect(page.getByRole('button', { name: 'Start again', exact: true })).toBeVisible()
})

test('the one-minute deadline ends audio even when timer updates were throttled', async ({ page }) => {
  await page.clock.install()
  let closed = false
  let connection
  await prepare(page, socket => {
    connection = socket
    socket.onClose(() => { closed = true })
    socket.onMessage(message => {
      if (JSON.parse(String(message)).type === 'conversation_initiation_client_data') startVoice(socket)
    })
  })
  await expect(page.locator('.live-agent-status')).toHaveText('Listening… go ahead')
  connection.send(JSON.stringify({ type: 'user_transcript', user_transcription_event: { user_transcript: 'I need automated CRM reminders.', event_id: 1 } }))
  await expect(page.getByRole('log', { name: /transcript/i })).toContainText('I need automated CRM reminders.')
  await page.clock.fastForward(59_000)
  await expect(page.locator('.live-agent-clock')).toContainText('0:01')
  expect(closed).toBe(false)
  await page.clock.runFor(1000)
  await expect(page.locator('.live-agent-status')).toHaveText('Time limit reached. Thanks for trying it!')
  await expect.poll(() => closed).toBe(true)
  await expect.poll(() => page.evaluate(() => window.__voiceTracks.every(track => track.readyState === 'ended'))).toBe(true)
  await expect(page.getByRole('log', { name: /transcript/i })).toContainText('I need automated CRM reminders.')
})

test('a server hangup before the greeting is a failed start rather than a completed conversation', async ({ page }) => {
  await prepare(page, socket => {
    socket.onMessage(message => {
      const event = JSON.parse(String(message))
      if (event.type === 'conversation_initiation_client_data') startVoice(socket)
      if (event.user_audio_chunk) socket.close({ code: 1000, reason: 'Agent disconnected' })
    })
  })
  await expect(page.locator('#live-agent [role="alert"]')).toContainText('ended before it could respond')
  await expect(page.locator('.live-agent-status')).toHaveText('Could not connect')
  await expect.poll(() => page.evaluate(() => window.__voiceTracks.every(track => track.readyState === 'ended'))).toBe(true)
  await page.locator('#live-agent').getByRole('button', { name: 'Close', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Start a live conversation', exact: true })).toBeVisible()
})

test('an unexpected provider disconnect is explained and a visitor can retry', async ({ page }) => {
  let attempts = 0
  await prepare(page, socket => {
    attempts++
    socket.onMessage(message => {
      const event = JSON.parse(String(message))
      if (event.type === 'conversation_initiation_client_data') startVoice(socket)
      if (event.user_audio_chunk && attempts === 1) socket.close({ code: 1011, reason: 'Voice service unavailable' })
    })
  })
  await expect(page.locator('#live-agent [role="alert"]')).toContainText('voice connection was interrupted')
  await expect(page.locator('.live-agent-status')).toHaveText('Could not connect')
  await page.getByRole('button', { name: 'Start again', exact: true }).click()
  await expect(page.locator('.live-agent-status')).toHaveText('Listening… go ahead')
  await expect(page.locator('#live-agent [role="alert"]')).toHaveCount(0)
  expect(attempts).toBe(2)
  await page.locator('#live-agent').getByRole('button', { name: 'End conversation', exact: true }).click()
})
