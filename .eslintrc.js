module.exports = {
  root: true,
  ignorePatterns: ['.eslintrc.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
  },
  plugins: [
    '@typescript-eslint',
    'jest',
    'jsx-a11y',
    'react',
  ],
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier', // this needs to stay last to be able to override other configs
  ],
  rules: {
    "no-undef": "off",
    "no-unused-vars": "off",
    "import/default": "off",
    "import/named": "off",
    "import/namespace": "off",
    "import/no-duplicates": "off",
    "import/no-named-as-default": "off",
    "import/no-named-as-default-member": "off",
    "import/no-unresolved": "off",
    "jsx-a11y/accessible-emoji": "warn",
    "react/jsx-boolean-value": "off",
    "react/prop-types": "off",
    "react/no-unescaped-entities": "off",
    "react/react-in-jsx-scope": "off",
    "react/jsx-one-expression-per-line": "off",
    "react/jsx-wrap-multilines": "off",
    "react/destructuring-assignment": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  },
  settings: {
    'import/extensions': ['.js', '.jsx'],
    'import/resolver': { node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] } },
    "linkComponents": [
      // Components used as alternatives to <a> for linking, eg. <Link to={ url } />
      "Hyperlink",
      {"name": "Link", "linkAttribute": "to"}
    ],
    react: {
      version: 'detect',
    },
  }
};
