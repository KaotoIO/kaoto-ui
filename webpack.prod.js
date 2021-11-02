/* eslint-disable */
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = merge(common('production', { mode: 'production' }), {
  mode: 'production',
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
});
