/**
 * Render the compatibility banner into a standalone page.
 *
 * The harness exists because a real WebView old enough to fail the transport
 * cannot be installed here; what CAN be verified is the plugin's own contract:
 * the built bundle registers under its package name, `apply` registers both
 * slots, the injected faces produce a verdict the components render, and the
 * banner survives dismissal. React and jsx-runtime resolve to the same build
 * the shell seed table exposes.
 */
import { chromium } from '/opt/dsh-browser/playwright.mjs'

const OLD_UA = 'Mozilla/5.0 (Linux; Android 7.0; SM-G9300) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.98 Mobile Safari/537.36'
const PAGE = process.env.HARNESS_URL ?? 'http://127.0.0.1:4173/dsh/'
const browser = await chromium.launch({ executablePath: '/opt/dsh-browser/chromium', headless: true })

async function run(label) {
  const ctx = await browser.newContext({ userAgent: OLD_UA, viewport: { width: 900, height: 460 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  const logs = []
  page.on('console', m => logs.push(m.type() + ': ' + m.text().slice(0, 200)))
  page.on('pageerror', e => logs.push('pageerror: ' + e.message.slice(0, 200)))
  await page.goto(PAGE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  const banner = await page.$('[data-browser-compat-banner]')
  console.log(`[${label}] registered logs:`)
  console.log(logs.filter(l => l.includes('[harness]')).join('\n') || '(none)')
  if (banner === null) {
    console.log(`[${label}] banner: ABSENT`)
    console.log(logs.filter(l => !l.includes('[harness]')).join('\n'))
    await ctx.close()
    return false
  }
  const text = (await page.textContent('[data-browser-compat-banner]')).replace(/\s+/g, ' ')
  console.log(`[${label}] banner: PRESENT`)
  console.log(`[${label}] text: ${text}`)
  await page.screenshot({ path: '/tmp/harness/banner.png', clip: { x: 0, y: 0, width: 900, height: 240 } })
  const close = await page.$('[data-browser-compat-banner] button')
  await close.click()
  await page.waitForTimeout(300)
  const gone = (await page.$('[data-browser-compat-banner]')) === null
  console.log(`[${label}] dismiss works: ${gone}`)
  await ctx.close()
  return true
}

const ok = await run('simulated old engine')
await browser.close()
process.exitCode = ok ? 0 : 1
