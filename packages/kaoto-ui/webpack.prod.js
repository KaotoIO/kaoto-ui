const { merge } = require('webpack-merge');
const { common } = require('./webpack.common.js');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const webpack = require('webpack');

module.exports = merge(common('production'), {
  devtool: 'source-map',
  optimization: {
    minimizer: [
      new CssMinimizerPlugin({
        minimizerOptions: {
          processorOptions: {
            preset: ['default', { mergeLonghand: false }], // Fixes bug in PF Select component https://github.com/patternfly/patternfly-react/issues/5650#issuecomment-822667560
          },
        },
      }),
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      /**
       * This ENV needs to be set when running the yarn build command, i.e.:
       * KAOTO_API=/api yarn build
       * this is on purpose since we would fallback to '/api' which is the
       * default path for kaoto-standalone
       */
      KAOTO_API: JSON.stringify(process.env.KAOTO_API ?? '/api'),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(tsx|ts|jsx)?$/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
});
