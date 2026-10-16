import { expect, test } from 'playwright/test';

test('trip redesign screenshot', async ({ page }) => {
  await page.goto('/#/v2');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: 'Apply for €360', exact: true }).first().click();
  await page.getByRole('button', { name: 'Send application', exact: true }).click();
  await expect(page.getByText('Load confirmed', { exact: true }).first()).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'View trip', exact: true }).click();
  await expect(page).toHaveURL(/#\/trip\/nordcargo$/);
  await expect(page.getByRole('button', { name: 'Navigate in Google Maps', exact: true })).toBeVisible();
  const map = await page.evaluate(() => {
    const svg = document.querySelector('main svg, div[class*="top-[var(--nav-bar-back-h)]"] img');
    const main = document.querySelector('div[class*="top-[var(--nav-bar-back-h)]"]');
    const summary = document.querySelector('section[aria-label="Trip summary"]');
    const dump = (el: Element | null) => {
      if (!el) return 'NONE';
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return `${Math.round(r.width)}x${Math.round(r.height)} top=${Math.round(r.top)} display=${cs.display} vis=${cs.visibility} op=${cs.opacity}`;
    };
    return `MAP=${dump(svg)} CONTENT(scrollH=${main?.scrollHeight} scrollTop=${main?.scrollTop}) SUMMARY=${dump(summary)}`;
  });
  console.log('MAP:', map);
  await page.screenshot({ path: 'test-results/trip-redesign.png', fullPage: false });
});
