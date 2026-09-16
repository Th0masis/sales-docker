import { chromium } from 'playwright-chromium'

const baseUrl = process.env.SLIDES_URL ?? 'http://127.0.0.1:3030'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
const openSlide = async slideNumber => {
  let lastError

  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      await page.goto(`${baseUrl}/${slideNumber}`, { waitUntil: 'domcontentloaded', timeout: 3000 })
      await page.locator('.slide-id').first().waitFor({ timeout: 3000 })
      return
    } catch (error) {
      lastError = error
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  throw lastError
}

try {
  for (const slideNumber of [1, 7, 11, 14]) {
    await openSlide(slideNumber)
  }

  await openSlide(12)
  const cards = page.locator('.ot-use-card')
  if (await cards.count() !== 6) throw new Error('Slide 12 should show six use-case cards')

  await cards.first().click()
  await page.locator('.ot-use-detail').waitFor()
  await page.locator('.ot-use-close').click()
  await page.locator('.ot-use-card').first().waitFor()

  console.log('Browser smoke checks passed')
} finally {
  await browser.close()
}