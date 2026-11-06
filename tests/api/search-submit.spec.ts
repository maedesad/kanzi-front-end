import { expect, test } from '@playwright/test';

test('Search sends POST generate and retrying the same word sends a new request', async ({ page }) => {
  const requests: { method: string; path: string }[] = [];
  const card = { word: 'Apple', pronunciation: '/ˈæpəl/', meanings: [
    { definition: 'A round fruit.', examples: ['She ate an apple.'] },
  ] };
  await page.route('**/api/cards', route => route.fulfill({ json: [] }));
  await page.route('**/api/cards/Apple/generate', route => {
    requests.push({ method: route.request().method(), path: new URL(route.request().url()).pathname });
    return requests.length === 1 ? route.fulfill({ status: 502, json: { detail: 'Generation temporarily failed' } }) :
      route.fulfill({ json: card });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Add New Word', exact: true }).click();
  await page.getByRole('textbox').fill('Apple');
  expect(requests).toHaveLength(0);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Generation temporarily failed');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByRole('article', { name: 'Apple', exact: true })).toBeVisible();
  expect(requests).toEqual([
    { method: 'POST', path: '/api/cards/Apple/generate' },
    { method: 'POST', path: '/api/cards/Apple/generate' },
  ]);
});
