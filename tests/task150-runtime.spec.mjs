import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/analytics/event', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '{"ok":true,"stored":false}',
  }));
});

test('rezerwacja 390 px ukrywa diagnostykę backendu i nie ma overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/api/reservation', (route) => route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({
      ok: false,
      accepted: false,
      code: 'RESERVATION_NOT_ACCEPTED',
      message: 'Supabase relation reservation_inquiries does not exist — private diagnostic',
      retry: true,
    }),
  }));

  await page.goto('/rezerwacja/?stay=camping', { waitUntil: 'domcontentloaded' });
  await page.locator('[data-field="dates.arrival"]').fill('2026-09-10');
  await page.locator('[data-field="dates.departure"]').fill('2026-09-12');
  await page.locator('[data-next]').click();
  await page.locator('[data-next]').click();
  await page.locator('[data-preset]').first().click();
  await page.locator('[data-next]').click();
  await page.locator('[data-field="details.name"]').fill('Jan Kowalski');
  await page.locator('[data-field="details.email"]').fill('jan@example.com');
  await page.locator('[data-country-search]').fill('Polska');
  await page.locator('[data-country-pick="PL"]').click();
  for (const key of ['quiet', 'consent', 'privacy']) {
    await page.locator(`[data-check="${key}"]`).check();
  }
  await page.locator('[data-next]').click();
  await page.locator('[data-submit]').click();

  const toast = page.locator('[data-reservation-viewport-toast]');
  await expect(toast).toBeVisible();
  await expect(toast).not.toContainText(/Supabase|PostgreSQL|relation|schema|provider/i);
  await expect(toast).toContainText(/Nie udało się|skontaktuj/i);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
});

test('CC SYSTEM Ustawienia pokazują status i odświeżają go bez reloadu', async ({ page }) => {
  let healthCalls = 0;
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    let body = { ok: true };
    if (path === '/api/inbox/list') body = { ok: true, inquiries: [] };
    else if (path === '/api/inbox/health') body = { ok: true, env: {}, tableCheck: { ok: true }, mailCenter: { ok: true, tables: {}, historyActive: true, draftsActive: true } };
    else if (path === '/api/system/health') {
      healthCalls += 1;
      body = {
        ok: true,
        supabase: { connected: true },
        resend: { configured: true },
        forms: { ok: true },
        modules: { mailCenter: { ok: true }, analytics: { ok: true } },
        tables: { camp_stays: { ok: true } },
      };
    } else if (path === '/api/camp/stays') body = { ok: true, stays: [] };
    else if (path === '/api/clients/list') body = { ok: true, clients: [], stats: {}, source: 'camp_stays' };
    else if (path === '/api/analytics/status') body = { ok: true, eventCount: 0, recentEvents: [], summary: {}, myStay: { ok: true } };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });

  await page.goto('/cc-gate-a8f3k9r2p6/');
  await page.locator('[data-login-form] input').fill('test-code');
  await page.locator('[data-login-form]').press('Enter');
  await page.locator('[data-view="settings"]').click();
  const settings = page.locator('.settings-offline');
  await expect(settings).toContainText('System');
  await expect(settings).toContainText('Supabase');
  await expect(settings).toContainText('Formularze');
  await expect(settings).toContainText('Mail Resend');
  await expect(settings).toContainText('CAMP baza');
  await expect(settings).toContainText('Mail Center');
  await expect(settings).toContainText('Analityka');
  await page.locator('[data-sidebar-toggle]').click();
  const before = healthCalls;
  await settings.locator('[data-system-health-refresh]').click();
  await expect.poll(() => healthCalls).toBeGreaterThan(before);
});

test('PL EN DE: rezerwacja, kontakt i CTA przechodzą smoke test mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/rezerwacja/', '/en/booking/', '/de/buchung/']) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-reservation-mini-game]')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), `${route} overflow`).toBeLessThanOrEqual(1);
  }
  for (const route of ['/kontakt/', '/en/kontakt/', '/de/kontakt/']) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('a[href^="tel:"]').first()).toBeAttached();
    await expect(page.locator('a[href^="mailto:"]').first()).toBeAttached();
  }
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('a[href^="/rezerwacja"]').first()).toBeAttached();
});
