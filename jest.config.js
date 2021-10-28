module.exports = {
  // An array of directory names to be searched recursively up from the requiring module's location
  moduleDirectories: ['node_modules', '<rootDir>/src'],

  // A map to module names that allow stubbing out resources with a single module
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },

  // Preset for our Jest configuration base
  preset: 'ts-jest/presets/js-with-ts',
  //preset: 'ts-jest',

  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],

  // Environment used for testing
  testEnvironment: 'jsdom',
  //testEnvironment: 'jest-environment-jsdom',
};
