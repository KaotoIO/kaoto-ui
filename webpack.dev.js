const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common('development'), {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    allowedHosts: 'all',

    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },

    historyApiFallback: true,

    port: 1337,

    static: {
      directory: './dist',
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      KAOTO_API: JSON.stringify(process.env.KAOTO_API || 'http://localhost:8081'),
    }),
  ],
  stats: 'errors-warnings',
});
