import { defineConfig } from '@playwright/test';

const urlBase = process.env.URL_BASE || process.env.BASE_URL || 'https://serverest.dev';

/**
 * Configuração Playwright voltada apenas a testes de API (sem browser).
 */
export default defineConfig({
  testDir: './testes',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/resultados-junit.xml' }],
    ['allure-playwright', { detail: true, suiteTitle: 'ServeRest API' }],
  ],
  use: {
    baseURL: urlBase,
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  },
});
