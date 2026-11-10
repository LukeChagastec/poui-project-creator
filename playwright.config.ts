import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	globalSetup: './e2e/global-setup.ts',
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
		command: 'node e2e/serve.mjs',
		url: 'http://localhost:4200',
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	},
});
