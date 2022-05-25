const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common('development'), {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    allowedHosts: 'all',

    client: {
      overlay: true,
    },

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
    
    stats: 'errors-only',
  },
  plugins: [
    new webpack.DefinePlugin({
      KAOTO_API: JSON.stringify(process.env.KAOTO_API || 'http://localhost:8081'),
    }),
  ],
});
