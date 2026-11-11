import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	fullyParallel: false,
	workers: 1,
	forbidOnly: !!process.env.CI,
	timeout: 120_000,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
	use: {
		baseURL: 'http://localhost:4200',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		// O comando gera o projeto (scaffold + install + build) e então sobe o `ng serve`.
		// O Playwright inicia o webServer ANTES do globalSetup, então a geração precisa
		// ficar aqui. O timeout cobre o tempo de geração + build.
		command: 'node e2e/serve.mjs',
		url: 'http://localhost:4200',
		reuseExistingServer: !process.env.CI,
		timeout: 1_200_000,
	},
});
