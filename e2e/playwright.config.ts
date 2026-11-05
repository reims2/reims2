import { defineConfig, devices, Project } from '@playwright/test'

try {
  process.loadEnvFile()
} catch {
  // .env is optional
}

export const authFile = '.auth/user.json'

const browsers = {
  chromium: 'Desktop Chrome',
  firefox: 'Desktop Firefox',
  webkit: 'Desktop Safari',
}

// opt-in, so a plain `playwright test` doesn't overwrite the guide's images
const screenshots: Project | undefined =
  process.env.SCREENSHOTS || process.env.VISUAL
    ? {
        name: 'screenshots',
        testMatch: /screenshots\.spec\.ts/,
        use: { ...devices['Desktop Chrome'], storageState: authFile },
        dependencies: ['setup'],
        // VISUAL=1 compares with the images in visual/ instead, in order so SKUs match (visual.yml)
        ...(process.env.VISUAL && {
          fullyParallel: false,
          retries: 0,
          snapshotPathTemplate: '{testDir}/../visual/{arg}{ext}',
          // the default 0.2 missed bolder button text in Vuetify 4.3, rendering noise stays far below 0.05
          expect: { toHaveScreenshot: { threshold: 0.05 } },
        }),
      }
    : undefined

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // a test that only passes on retry still fails the run, so one retry only labels it flaky
  retries: process.env.CI ? 1 : 0,
  failOnFlakyTests: !!process.env.CI,
  // tests create their own data, so they can share the stack
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    actionTimeout: 5000,
    navigationTimeout: 5000,
  },
  expect: {
    timeout: 8000,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    ...Object.entries(browsers).map(([name, device]) => ({
      name,
      use: { ...devices[device], storageState: authFile },
      testIgnore: /screenshots\.spec\.ts/,
      // tests that free SKUs on sm, other browsers would add to sm concurrently
      grepInvert: name === 'chromium' ? undefined : /@one-browser/,
      dependencies: ['setup'],
    })),
    ...(screenshots ? [screenshots] : []),
  ],
})
