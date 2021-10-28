module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier', // this needs to stay last to be able to override other configs
  ],
  overrides: [
    {
      files: ['**/*.tsx'],
      rules: {
        'react/prop-types': 'off',
        'react/no-unescaped-entities': 'off',
      },
    },
    {
      files: ['**/*.js', '**/*.(spec|test).(ts|tsx)'], // Allow commonjs modules for js files
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'react/no-unescaped-entities': 'off',
      },
    },
    {
      files: ['**/*.stories.*'],
      rules: {
        'import/no-anonymous-default-export': 'off',
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'jest',
    'react',
    //'react-hooks'
  ],
  rules: {
    // prefer spaces (2) over tabs for indentation
    indent: ['error', 2],
    // all lines to have semicolons to end statements
    //semi: ['error', 'always'],
    '@typescript-eslint/no-explicit-any': 'warn',
    //'@typescript-eslint/ban-ts-comment': 'off',
    //'@typescript-eslint/no-unused-vars': 'off',
    'no-unused-vars': 'off',
    'react-hooks/exhaustive-deps': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
