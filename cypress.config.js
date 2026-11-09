import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // The tests open /cypress/harness.html. Serve this directory first: npm run serve:test
    baseUrl: 'http://127.0.0.1:8765',
    specPattern: 'cypress/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: false,
    video: false,
    screenshotOnRunFailure: false,
  },
});
