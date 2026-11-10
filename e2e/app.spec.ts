import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	// Mocka qualquer chamada de rede a uma API/Protheus real — o E2E nunca depende
	// de um Protheus de verdade. O appConfig.json (asset local) não é afetado.
	await page.route('**/api/**', (route) =>
		route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
	);
});

test('o app carrega sem erros de console', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (err) => errors.push(err.message));
	page.on('console', (msg) => {
		if (msg.type() === 'error') {
			errors.push(msg.text());
		}
	});

	await page.goto('/');
	await expect(page.locator('app-root')).toBeAttached();

	expect(errors).toEqual([]);
});

test('o menu e a toolbar do PO UI renderizam', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('po-menu')).toBeAttached();
	await expect(page.locator('po-toolbar')).toBeAttached();
});
