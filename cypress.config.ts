import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'zfop6s',
  videoUploadOnPasses: false,

  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config);
    },
    baseUrl: 'http://localhost:1337',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    viewportWidth: 1920,
    viewportHeight: 1080,
    scrollBehavior: false,
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  },
});
