const path = require('path');

module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },

  // A preset that is used as a base for Jest's configuration
  preset: 'ts-jest',

  // The path to a module that runs some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: [path.resolve(__dirname, './setupTests.ts')],

  testEnvironment: 'jest-environment-jsdom',
};
