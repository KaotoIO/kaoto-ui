const { merge } = require('webpack-merge');
const prod = require('../webpack.prod.js');
const path = require('path');
const webpack = require('webpack');
const { version } = require('../package.json');

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  staticDirs: ['../public'],
  addons: ['@storybook/addon-essentials'],
  babel: async (options: any) => {
    // Update your babel configuration here
    return options;
  },
  docs: {
    autodocs: true,
  },
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop: { parent: { fileName: string } }) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  webpackFinal: async (config: any, {}: any) => {
    // Make whatever fine-grained changes you need
    // Return the altered config

    const updatedConfig = merge(config, {
      resolve: {
        alias: {
          '@kaoto/api': path.resolve(__dirname, '../src/api/'),
          '@kaoto/assets': path.resolve(__dirname, '../src/assets/'),
          '@kaoto/components': path.resolve(__dirname, '../src/components/'),
          '@kaoto/constants': path.resolve(__dirname, '../src/constants/'),
          '@kaoto/hooks': path.resolve(__dirname, '../src/hooks/'),
          '@kaoto/layout': path.resolve(__dirname, '../src/layout/'),
          '@kaoto/types': path.resolve(__dirname, '../src/types/'),
          '@kaoto/routes': path.resolve(__dirname, '../src/routes/'),
          '@kaoto/services': path.resolve(__dirname, '../src/services/'),
          '@kaoto/store': path.resolve(__dirname, '../src/store/'),
          '@kaoto/utils': path.resolve(__dirname, '../src/utils/'),
        },
      },
    });

    updatedConfig.module.rules.unshift({
      test: /\.(tsx|ts|jsx)?$/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            experimentalWatchApi: true,
          },
        },
      ],
    });

    updatedConfig.plugins.push(
      new webpack.DefinePlugin({
        KAOTO_VERSION: JSON.stringify(version),
        KAOTO_API: JSON.stringify('/api'),
      }),
    );

    return updatedConfig;
  },
};
