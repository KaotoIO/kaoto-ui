const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const ModuleFederationPlugin = require('webpack').container.ModuleFederationPlugin;
const path = require('path');
const packageJsonName = require('./package.json').name;
const packageJsonDeps = require('./package.json').dependencies;
require('dotenv').config();

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 3001,
    historyApiFallback: true,
    hot: true,
    headers: {
      'Cache-Control': 'no-store'
    }
  },
  resolve: {
    extensions: [ '.js', '.ts', '.tsx' ]
  },
  output: {
    publicPath: 'auto',
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        use: [
          { loader: 'ts-loader' }
        ]
      },
      {
        test: /\.m?js$/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' }
        ]
      },
      {
        test: /\.(svg|png|jpg|woff|woff2)$/,
        type: 'asset/resource'
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-react'],
        },
      },
      {
        test: /\.ya?ml$/,
        use: 'yaml-loader'
      }
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: packageJsonName,
      shared: {
        react: { singleton: true, eager: true, requiredVersion: packageJsonDeps.react },
        'react-dom': { singleton: true, eager: true, requiredVersion: packageJsonDeps["react-dom"] }
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new webpack.EnvironmentPlugin(['REACT_APP_API_URL'])
  ],
};

