const { merge } = require('webpack-merge');
const prod = require('../webpack.prod.js');
const path = require('path');

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  staticDirs: ['../public'],
  addons: ['@storybook/addon-essentials'],
  babel: async (options) => {
    // Update your babel configuration here
    return options;
  },
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  core: {
    builder: 'webpack5',
  },
  framework: '@storybook/react',
  webpackFinal: async (config, { configType }) => {
    // Make whatever fine-grained changes you need
    // Return the altered config

    const updatedConfig = merge(config, {
      resolve: {
        alias: {
          '@kaoto/api': path.resolve(__dirname, '../src/api/'),
          '@kaoto/assets': path.resolve(__dirname, '../src/assets/'),
          '@kaoto/components': path.resolve(__dirname, '../src/components/'),
          '@kaoto/constants': path.resolve(__dirname, '../src/store/constants/'),
          '@kaoto/hooks': path.resolve(__dirname, '../src/hooks/'),
          '@kaoto/layout': path.resolve(__dirname, '../src/layout/'),
          '@kaoto/types': path.resolve(__dirname, '../src/types/'),
          '@kaoto/routes': path.resolve(__dirname, '../src/routes/'),
          '@kaoto/services': path.resolve(__dirname, '../src/services/'),
          '@kaoto/store': path.resolve(__dirname, '../src/store/'),
          '@kaoto/utils': path.resolve(__dirname, '../src/utils/'),
        }
      }
    });

    /**
     * The first rule from the array it's the typescript one,
     * it would be better to have a more deterministic way to ensure it*/
    const [existingTypescriptConfig, ...rest] = updatedConfig.module.rules;

    updatedConfig.module.rules = [
      {
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
      },
      ...rest,
    ];

    console.log(JSON.stringify(updatedConfig.module.rules, null, 4));

    return updatedConfig;
  },
};
