/**
 * Headless UI verification for the Android/responsive layout.
 *
 * Usage:
 *   npm run build
 *   npx vite preview --port 4173 &
 *   npm i -D playwright && npx playwright install chromium   # once
 *   npm run verify:ui
 *
 * It renders the app at the viewport sizes that matter (small phone, phone,
 * landscape phone, tablet, desktop), asserts there is no horizontal overflow,
 * that bubbles stay inside their column, and writes screenshots to
 * ./ui-screenshots for a visual diff.
 */
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const BASE = process.env.UI_BASE_URL ?? 'http://127.0.0.1:4173';
const OUT = 'ui-screenshots';
const CHAT_URL = `${BASE}/?chat=/sample-chat.txt`;

const VIEWPORTS = [
  { name: 'phone-small', width: 360, height: 640, scale: 3, mobile: true },
  { name: 'phone', width: 390, height: 844, scale: 3, mobile: true },
  { name: 'phone-landscape', width: 844, height: 390, scale: 3, mobile: true },
  { name: 'tablet', width: 800, height: 1280, scale: 2, mobile: true },
  { name: 'desktop', width: 1440, height: 900, scale: 1, mobile: false },
];

const measure = (page) =>
  page.evaluate(() => {
    const root = document.documentElement;
    const bubbles = Array.from(document.querySelectorAll('.bubble'));
    const aside = document.querySelector('aside');
    return {
      overflowX: root.scrollWidth > root.clientWidth + 1,
      appBarHeight: Math.round(document.querySelector('header').getBoundingClientRect().height),
      bubbles: bubbles.length,
      widestBubbleRatio: bubbles.length
        ? Number(
            Math.max(...bubbles.map((b) => b.getBoundingClientRect().width / window.innerWidth)).toFixed(2)
          )
        : 0,
      clipped: bubbles.some((b) => b.getBoundingClientRect().right > window.innerWidth + 1),
      sidebarVisible: aside ? getComputedStyle(aside).display !== 'none' : false,
    };
  });

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const failures = [];

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.scale,
    isMobile: viewport.mobile,
    hasTouch: viewport.mobile,
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(String(error)));

  await page.goto(CHAT_URL, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${viewport.name}-light.png` });

  const metrics = await measure(page);
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  });
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${OUT}/${viewport.name}-dark.png` });

  const problems = [];
  if (metrics.overflowX) problems.push('horizontal page overflow');
  if (metrics.clipped) problems.push('a message bubble is clipped');
  if (metrics.widestBubbleRatio > 0.9) problems.push('bubble spans nearly the full width');
  if (metrics.sidebarVisible && viewport.width < 1024) problems.push('sidebar shown on a narrow viewport');
  if (!metrics.sidebarVisible && viewport.width >= 1024) problems.push('sidebar missing on desktop');
  if (pageErrors.length) problems.push(`page errors: ${pageErrors.join('; ')}`);

  console.log(
    `${viewport.name.padEnd(16)} ${JSON.stringify(metrics)} ${problems.length ? `❌ ${problems.join(', ')}` : '✅'}`
  );
  if (problems.length) failures.push(`${viewport.name}: ${problems.join(', ')}`);

  await context.close();
}

await browser.close();

if (failures.length) {
  console.error('\nUI verification failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log(`\nAll viewports passed. Screenshots written to ./${OUT}`);
