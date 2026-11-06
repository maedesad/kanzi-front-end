import { test, expect } from '@playwright/test';

test('library search submits explicitly, supports Persian and handles empty results', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('7 words', { exact: true })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `test-results/library-${test.info().project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Search Vocabulary', exact: true }).click();
  await expect(page.getByRole('button', { name: /Responsibility/ })).toHaveCount(0);
  await page.getByRole('textbox', { name: 'Search vocabulary' }).fill('كنجكاوي');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByRole('button', { name: /Curiosity/ })).toBeVisible();
  await page.getByRole('textbox').fill('does-not-exist');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByText('No matching words')).toBeVisible();
});

test('draft meaning selection, adding, persistent deletion and word removal', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Add New Word', exact: true }).click();
  await page.getByRole('textbox').fill('present');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  const present = page.getByRole('article', { name: 'Present', exact: true });
  await present.getByRole('button', { name: 'View word' }).click();
  await expect(page.getByRole('tab')).toHaveCount(3);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `test-results/card-${test.info().project.name}.png`, fullPage: true });
  await page.getByRole('tab', { name: 'meaning 2' }).click();
  await expect(page.getByText('حاضر', { exact: true })).toBeVisible();
  await page.getByRole('checkbox').click();
  await expect(page.getByRole('tab')).toHaveCount(2);
  await page.getByRole('button', { name: 'Add This Word', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Delete word', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('tab')).toHaveCount(2);
  await page.getByRole('checkbox').click();
  await expect(page.getByRole('tab')).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole('tab')).toHaveCount(1);
  await expect(page.getByText('ارائه دادن', { exact: true })).toBeVisible();
  await page.getByRole('checkbox').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Delete word', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Delete word', exact: true }).click();
  await page.getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Vocabulary Library' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('empty drafts cannot be saved and compact screens stay within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/#/discover');
  await page.getByRole('textbox').fill('present');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('article', { name: 'Present', exact: true }).getByRole('button', { name: 'View word' }).click();
  for (const count of [2, 1, 0]) {
    await page.getByRole('checkbox').click();
    await expect(page.getByRole('tab')).toHaveCount(count);
  }
  await expect(page.getByRole('button', { name: 'Add This Word', exact: true })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('quick add updates labels, survives navigation and all assets load without overflow', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add New Word', exact: true }).click();
  await page.getByRole('textbox').fill('responsibility');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByText('Already Added', { exact: true }).first()).toBeVisible();
  const opportunity = page.getByRole('article', { name: 'Opportunity', exact: true });
  await opportunity.getByRole('button', { name: 'Add word', exact: true }).click();
  await expect(opportunity.getByText('Just added', { exact: true })).toBeVisible();
  await opportunity.getByRole('button', { name: 'View word' }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(opportunity.getByText('Just added', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox')).toHaveValue('responsibility');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(await page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
  await page.screenshot({ path: `test-results/search-${test.info().project.name}.png`, fullPage: true });
});
