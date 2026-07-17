import pw from 'file:///C:/Users/aiman/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pw;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1.5 });
const page = await ctx.newPage();
await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4500);

// Capture the boundary around each section by scrolling to its top and shooting a window that spans the seam.
async function boundary(selectorTop, name) {
  const y = await page.evaluate(sel => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return window.scrollY + r.top;
  }, selectorTop);
  if (y == null) { console.log(name, 'selector not found'); return; }
  await page.evaluate(yy => window.scrollTo(0, yy - 260), y);
  await page.waitForTimeout(500);
  await page.screenshot({ path: name });
}

await boundary('#featured', 't-hero-featured.png');   // hero -> featured
await boundary('#about', 't-how-why.png');             // howitworks -> whystayzy (light->dark)
await boundary('#faq', 't-testi-faq.png');             // testimonials -> faq (dark->light)

await browser.close();
