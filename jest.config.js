const path = require('path');

module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  collectCoverageFrom: [
    '<rootDir>/src/**/*.{ts,tsx}',
    '!<rootDir>/src/**/*.(test|stories).{ts,tsx}',
    '!<rootDir>/src/**/index.ts',
    '!<rootDir>/src/store/data/**',
    '!<rootDir>/src/stubs/**',
  ],

  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],

  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest',
  },

  moduleNameMapper: {
    '\\.(css|less)$': path.resolve(__dirname, './src/__mocks__/styleMock.js'),
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      path.resolve(__dirname, './src/__mocks__/fileMock.js'),
    '@patternfly/react-code-editor': path.resolve(
      __dirname,
      './src/__mocks__/reactCodeEditorMock.js',
    ),
    '@kaoto/api': path.resolve(__dirname, './src/api'),
    '@kaoto/assets': path.resolve(__dirname, './src/assets'),
    '@kaoto/components': path.resolve(__dirname, './src/components'),
    '@kaoto/constants': path.resolve(__dirname, './src/constants'),
    '@kaoto/hooks': path.resolve(__dirname, './src/hooks'),
    '@kaoto/layout': path.resolve(__dirname, './src/layout'),
    '@kaoto/types': path.resolve(__dirname, './src/types'),
    '@kaoto/routes': path.resolve(__dirname, './src/routes'),
    '@kaoto/services': path.resolve(__dirname, './src/services'),
    '@kaoto/store': path.resolve(__dirname, './src/store'),
    '@kaoto/utils': path.resolve(__dirname, './src/utils'),
    '@kie-tools/uniforms-patternfly/dist/esm': path.resolve(
      __dirname,
      'node_modules/@kie-tools/uniforms-patternfly/dist/cjs',
    ),
    '@patternfly/react-core/next': path.resolve(
      __dirname,
      'node_modules/@patternfly/react-core/dist/js/next',
    ),
  },

  roots: ['<rootDir>'],

  // A preset that is used as a base for Jest's configuration
  preset: 'ts-jest',

  // The path to a module that runs some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: [path.resolve(__dirname, './setupTests.ts')],

  modulePathIgnorePatterns: ['<rootDir>/dist/'],

  testEnvironment: 'jsdom',
};
