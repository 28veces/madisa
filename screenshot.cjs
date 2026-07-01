const { chromium } = require('playwright');
const { mkdirSync, existsSync } = require('fs');

const OUT = '/tmp/madisa-shots';
if (!existsSync(OUT)) mkdirSync(OUT);
const EXE = '/home/maveces/.playwright/chromium-1223/chrome-linux64/chrome';

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto('http://localhost:3000/admin/articulos');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${OUT}/articulos.png`, fullPage: true });
  console.log('✓ artículos:', page.url());

  await browser.close();
})();
