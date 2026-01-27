const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
    },
  },
  env: {
    apiUrl: 'http://localhost:4000/api'
  }
});