import { defineConfig } from 'cypress';
import dotenv from 'dotenv';

export default defineConfig({
  projectId: 'zfop6s',
  videoUploadOnPasses: false,

  e2e: {
    setupNodeEvents(_on, config) {
      dotenv.config();
      config.env.KAOTO_API = process.env.KAOTO_API;
      return config
    },
    baseUrl: 'http://localhost:1337',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    viewportWidth: 1920,
    viewportHeight: 1080,
    defaultCommandTimeout: 8000,
    scrollBehavior: false,
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  },
});
