import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    specPattern: 'cypress/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: false,
    video: false,
    screenshotOnRunFailure: false,
  },
});
