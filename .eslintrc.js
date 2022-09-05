module.exports = {
  extends: [
    'plugin:jest-dom/recommended',
    'plugin:react-hooks/recommended',
    'prettier', // this needs to stay last to be able to override other configs
  ],
  overrides: [
    {
      files: ['src/?(*.)+(spec|test|cy).[jt]s?(x)'],
      extends: ['plugin:testing-library/react'],
    },
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest-dom', 'react-hooks', 'testing-library'],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
