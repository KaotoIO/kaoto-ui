const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  stories: [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],
  babel: async options => ({
    ...options,
    presets: [
      ["@babel/preset-env", { shippedProposals: true }],
      "@babel/preset-typescript",
      ["@babel/preset-react", { runtime: "automatic" }],
    ],
    plugins: ["@babel/plugin-transform-typescript", ...options.plugins],
  }),
  // babel: async (options) => {
  //   return {
  //     ...options,
  //     plugins: [
  //       ['@babel/plugin-transform-typescript', { isTSX: true }],
  //       ...options.plugins,
  //     ],
  //   };
  // },
  // babel: async options => {
  //   return {
  //     ...options,
  //     plugins: options.plugins.filter(x => !(typeof x === 'string' && x.includes('plugin-transform-classes'))),
  //   };
  // },
  core: {
    // builder: "@storybook/builder-webpack5"
    builder: 'webpack5',
  },
  framework: "@storybook/react",
  typescript: {
    allowSyntheticDefaultImports: true,
  },
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: [
        {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [
              require('@babel/preset-typescript').default,
              [require('@babel/preset-react').default, { runtime: 'automatic' }],
              require('@babel/preset-env').default,
            ],
          },
        },
      ],
    })

    config.resolve.plugins = [
      ...(config.resolve.plugins || []),
      new TsconfigPathsPlugin({
        extensions: config.resolve.extensions,
      }),
    ];

    config.resolve.extensions.push('.ts', '.tsx')

    return config
  },
};
