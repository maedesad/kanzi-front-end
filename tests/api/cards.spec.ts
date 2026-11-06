import { expect, test } from '@playwright/test';

test('real API shapes drive discovery, draft selection, saving and read-only saved cards', async ({ page }) => {
  const card = { word: 'Unfamiliar', pronunciation: '/ˌʌnfəˈmɪliə/', meanings: [
    { definition: 'Not known to you.', examples: ['This word is unfamiliar.'] },
    { definition: 'Not experienced before.', examples: ['We entered unfamiliar surroundings.'] },
  ] };
  const cards = new Map<string, typeof card>();
  let generated = 0;
  let savedPayload: unknown;
  await page.route('http://127.0.0.1:5174/api/**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === '/api/cards' && request.method() === 'GET') return route.fulfill({ json: [...cards.keys()] });
    if (path === '/api/cards' && request.method() === 'POST') {
      savedPayload = request.postDataJSON(); cards.set('Unfamiliar', savedPayload as typeof card);
      return route.fulfill({ status: 201, json: savedPayload });
    }
    if (path === '/api/cards/Unfamiliar/generate') { generated++; return route.fulfill({ json: card }); }
    if (path === '/api/cards/Unfamiliar') return route.fulfill({ json: cards.get('Unfamiliar') });
    throw new Error(`Unexpected API request: ${request.method()} ${path}`);
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Add New Word', exact: true }).click();
  await page.getByRole('textbox').fill('Unfamiliar');
  expect(generated).toBe(0);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  const result = page.getByRole('article', { name: 'Unfamiliar' });
  await expect(result.getByText('New', { exact: true })).toBeVisible();
  await result.getByRole('button', { name: 'View word' }).click();
  await expect(page.getByRole('tab')).toHaveCount(2);
  await expect(page.getByText('Translation not available yet.')).toBeVisible();
  await expect(page.locator('.example-card')).toHaveCount(1);
  await page.getByRole('checkbox').click();
  await expect(page.getByRole('tab')).toHaveCount(1);
  await page.getByRole('button', { name: 'Add This Word', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Delete word', exact: true })).toBeDisabled();
  await expect(page.getByRole('checkbox')).toBeDisabled();
  expect(savedPayload).toEqual({ ...card, meanings: [card.meanings[1]] });
  await page.reload();
  await expect(page.getByRole('tab')).toHaveCount(1);
  expect(generated).toBe(1);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByText('1 word', { exact: true })).toBeVisible();
});

test('offline API errors stay visible and do not become empty search results', async ({ page }) => {
  await page.route('http://127.0.0.1:5174/api/**', route => route.fulfill({ status: 503, json: { detail: 'API temporarily unavailable' } }));
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('API temporarily unavailable');
  await page.getByRole('button', { name: 'Add New Word', exact: true }).click();
  await page.getByRole('textbox').fill('Unfamiliar');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('API temporarily unavailable');
  await expect(page.getByText('No matching words')).toHaveCount(0);
});
