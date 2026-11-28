import { test, expect } from '@playwright/test'

async function openAlex(page, path = '/projects') {
  await page.goto(path)
  await page.getByRole('button', { name: 'Open Alex, AI Portfolio Assistant' }).click()
  return page.getByRole('dialog', { name: 'Alex', exact: true })
}

test('Alex greeting opens call booking from a project route', async ({ page }) => {
  await page.goto('/projects/zalio-crm')
  await page.locator('.alex-greeting').getByRole('button', { name: 'Book a call', exact: true }).click()
  await expect(page).toHaveURL('/#book-a-call')
  await expect(page.getByRole('heading', { name: 'Prefer to talk it through? Book a call.' })).toBeInViewport()
})

test('project needs produce evidence cards and an enquiry without provider requests', async ({ page }) => {
  const panel = await openAlex(page)
  const requests = []
  page.on('request', request => requests.push(request.url()))
  await panel.getByRole('button', { name: 'Find projects', exact: true }).click()
  await panel.getByRole('textbox', { name: 'Describe your project' }).fill('I need a CRM with automated follow-ups')
  await panel.getByRole('button', { name: 'Send question' }).click()
  const project = panel.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Zalio CRM', exact: true }) })
  await expect(project).toContainText('Led the CRM module')
  await expect(project.getByRole('link', { name: 'Read case study' })).toHaveAttribute('href', '/projects/zalio-crm')
  await panel.getByRole('button', { name: 'Start a project enquiry', exact: true }).click()
  await expect(page).toHaveURL(/\/#contact$/)
  await expect(page.locator('#contact-message')).toHaveValue(/I need a CRM with automated follow-ups/)
  expect(requests.filter(url => !new URL(url).hostname.match(/^(127\.0\.0\.1|localhost)$/))).toEqual([])
})

test('recruiter comparison accepts pasted lines and keeps uncertainty visible', async ({ page }) => {
  const panel = await openAlex(page)
  await panel.getByRole('button', { name: 'Check role fit', exact: true }).click()
  await panel.getByRole('textbox', { name: 'Paste job requirements' }).fill('React\nPython\nKubernetes\n10 years of React experience')
  await panel.getByRole('button', { name: 'Send question' }).click()
  const rows = panel.getByRole('list', { name: 'Requirement comparison' }).locator(':scope > li')
  await expect(rows).toHaveCount(4)
  await expect(rows.nth(0)).toContainText('Documented')
  await expect(rows.nth(2)).toContainText('Needs confirmation')
  await expect(rows.nth(3)).toContainText('Partly documented')
  await expect(rows.nth(0).getByRole('link').first()).toHaveAttribute('href', /^(\/#skills|\/projects\/)/)
})

test('a reviewed and edited brief reaches contact from a nested route without sending', async ({ page }) => {
  const posts = []
  page.on('request', request => { if (request.method() === 'POST') posts.push(request.url()) })
  const panel = await openAlex(page, '/projects/zalio-crm')
  await panel.getByRole('button', { name: 'Prepare a brief', exact: true }).click()
  for (const answer of ['CRM for our clinic', 'Three receptionists', 'Appointment reminders and a shared inbox', 'Budget to discuss; September target']) {
    await panel.getByRole('textbox', { name: 'Your answer' }).fill(answer)
    await panel.getByRole('button', { name: 'Send question' }).click()
    await expect(panel.locator('.alex-typing')).toHaveCount(0)
  }
  const review = panel.getByRole('textbox', { name: 'Review your project brief' })
  await expect(review).toHaveValue(/Three receptionists/)
  await expect(review).toBeFocused()
  const edited = `${await review.inputValue()}\nPlease include a migration plan.`
  await review.fill(edited)
  await panel.getByRole('button', { name: 'Review in contact form', exact: true }).click()
  await expect(page).toHaveURL(/\/#contact$/)
  await expect(page.locator('#contact-message')).toHaveValue(edited)
  await expect(page.locator('#contact-message')).toBeFocused()
  expect(posts).toEqual([])
})

test('switching modes preserves a pasted draft and the panel fits a small phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  const panel = await openAlex(page)
  await panel.getByRole('button', { name: 'Check role fit', exact: true }).click()
  await panel.getByRole('textbox', { name: 'Paste job requirements' }).fill('React\nPython')
  await panel.getByRole('button', { name: 'Find projects', exact: true }).click()
  await panel.getByRole('button', { name: 'Check role fit', exact: true }).click()
  await expect(panel.getByRole('textbox', { name: 'Paste job requirements' })).toHaveValue('React\nPython')
  await expect(panel.getByRole('button', { name: 'Send question' })).toBeInViewport()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
})

test('closing Alex preserves a typed draft during the current visit', async ({ page }) => {
  const panel = await openAlex(page)
  await panel.getByRole('button', { name: 'Check role fit', exact: true }).click()
  await panel.getByRole('textbox', { name: 'Paste job requirements' }).fill('React\nPython')
  await panel.getByRole('button', { name: 'Close Alex', exact: true }).click()
  await expect(panel).toHaveCount(0)
  await page.getByRole('button', { name: 'Open Alex, AI Portfolio Assistant' }).click()
  await expect(panel.getByRole('textbox', { name: 'Paste job requirements' })).toHaveValue('React\nPython')
  await expect(panel.getByRole('textbox', { name: 'Paste job requirements' })).toBeFocused()
  await page.reload()
  await page.getByRole('button', { name: 'Open Alex, AI Portfolio Assistant' }).click()
  await panel.getByRole('button', { name: 'Check role fit', exact: true }).click()
  await expect(panel.getByRole('textbox', { name: 'Paste job requirements' })).toHaveValue('')
})

test('an edited brief survives closing Alex without hidden focus or Escape handlers', async ({ page }) => {
  const panel = await openAlex(page, '/#contact')
  await panel.getByRole('button', { name: 'Prepare a brief', exact: true }).click()
  for (const answer of ['CRM for our clinic', 'Three receptionists', 'Appointment reminders', 'Budget to discuss']) {
    await panel.getByRole('textbox', { name: 'Your answer' }).fill(answer)
    await panel.getByRole('button', { name: 'Send question' }).click()
    await expect(panel.locator('.alex-typing')).toHaveCount(0)
  }
  const review = panel.getByRole('textbox', { name: 'Review your project brief' })
  const edited = `${await review.inputValue()}\nPlease include a migration plan.`
  await review.fill(edited)
  await panel.getByRole('button', { name: 'Close Alex', exact: true }).click()
  const contactName = page.getByRole('textbox', { name: 'Name', exact: true })
  await contactName.focus()
  await page.keyboard.press('Escape')
  await expect(contactName).toBeFocused()
  await page.getByRole('button', { name: 'Open Alex, AI Portfolio Assistant' }).click()
  await expect(review).toHaveValue(edited)
  await expect(review).toBeFocused()
})

test('a pending local reply cannot steal focus after Alex closes', async ({ page }) => {
  const panel = await openAlex(page, '/#contact')
  await panel.getByRole('textbox', { name: 'Ask Alex a question' }).fill('What are your skills?')
  await panel.getByRole('button', { name: 'Send question' }).click()
  await panel.getByRole('button', { name: 'Close Alex', exact: true }).click()
  const contactName = page.getByRole('textbox', { name: 'Name', exact: true })
  await contactName.focus()
  await expect(page.locator('.alex-msg-alex')).toHaveCount(2)
  await expect(contactName).toBeFocused()
  await expect(panel).toHaveCount(0)
})

test('an assistant enquiry preserves an existing contact draft for manual merging', async ({ page }) => {
  await page.goto('/#contact')
  await page.locator('#contact-subject').fill('Keep my existing project subject')
  await page.locator('#contact-message').fill('Keep my existing project details.')
  await page.getByRole('button', { name: 'Open Alex, AI Portfolio Assistant' }).click()
  const panel = page.getByRole('dialog', { name: 'Alex', exact: true })
  await panel.getByRole('button', { name: 'Find projects', exact: true }).click()
  await panel.getByRole('textbox', { name: 'Describe your project' }).fill('CRM with automated follow-ups')
  await panel.getByRole('button', { name: 'Send question' }).click()
  await panel.getByRole('button', { name: 'Start a project enquiry', exact: true }).click()
  await expect(page.locator('#contact-message')).toHaveValue('Keep my existing project details.')
  await expect(page.locator('#contact-subject')).toHaveValue('Keep my existing project subject')
  await expect(page.locator('#contact-prepared-subject')).toHaveValue('Project enquiry from the portfolio')
  await expect(page.locator('#contact-message')).toBeFocused()
  await expect(page.getByText('Your existing message was kept.', { exact: true })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Prepared enquiry to copy' })).toHaveValue(/CRM with automated follow-ups/)
})

test('a project request in general chat links to readable evidence on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const panel = await openAlex(page)
  await panel.getByRole('textbox', { name: 'Ask Alex a question' }).fill('I need a CRM with automated follow-ups')
  await panel.getByRole('button', { name: 'Send question' }).click()
  await panel.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Zalio CRM', exact: true }) }).getByRole('link', { name: 'Read case study' }).click()
  await expect(page).toHaveURL('/projects/zalio-crm')
  await expect(panel).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 1, name: 'Zalio CRM' })).toBeVisible()
})
