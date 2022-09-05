const path = require('path');

module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.e2e.json',
    },
  },

  moduleNameMapper: {
    '\\.(css|less)$': path.resolve(__dirname, './src/__mocks__/styleMock.js'),
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      path.resolve(__dirname, './src/__mocks__/fileMock.js'),
    '@patternfly/react-code-editor': path.resolve(
      __dirname,
      './src/__mocks__/reactCodeEditorMock.js'
    ),
  },

  // A preset that is used as a base for Jest's configuration
  preset: 'ts-jest',

  // The path to a module that runs some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: [path.resolve(__dirname, './setupTests.ts')],

  testEnvironment: 'jsdom',
};
