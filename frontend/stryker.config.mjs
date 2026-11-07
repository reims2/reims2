// mutation testing for the matching core, `pnpm test:mutation`, report in reports/mutation
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  testRunner: 'vitest',
  plugins: ['@stryker-mutator/vitest-runner'],
  mutate: [
    'src/lib/philscore.ts',
    'src/lib/blurscore.ts',
    'src/lib/interleave.ts',
  ],
  coverageAnalysis: 'perTest',
  reporters: ['clear-text', 'html', 'progress'],
  htmlReporter: { fileName: 'reports/mutation/index.html' },
  thresholds: { high: 90, low: 80, break: 90 },
  tempDirName: '.stryker-tmp',
}
