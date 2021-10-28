/* eslint-disable */
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');
const packageJsonName = require('./package.json').name;
const packageJsonDeps = require('./package.json').dependencies;
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const isPatternflyStyles = (stylesheet) =>
  stylesheet.includes('@patternfly/react-styles/css/') ||
  stylesheet.includes('@patternfly/react-core/');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src', 'index.ts'),
  devServer: {
    client: {
      overlay: true,
    },
    static: {
      directory: './dist',
    },
    port: 3001,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      'Cache-Control': 'no-store',
    },
    //allowedHosts: 'all',
    //hot: true
  },
  module: {
    rules: [
      {
        test: /\.(tsx|ts|jsx)?$/,
        //exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              experimentalWatchApi: true,
              // use ForkTsCheckerWebpackPlugin instead
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
      {
        test: /\.css$/,
        include: isPatternflyStyles,
        use: ['null-loader'],
        sideEffects: true,
      },
      {
        test: /\.(svg|png|jpg|woff|woff2|ico)$/,
        type: 'asset/resource',
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
      {
        test: /\.yaml$/,
        use: 'yaml-loader',
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'auto',
  },
  plugins: [
    new Dotenv({
      systemvars: true,
      silent: true,
    }),

    // The following plugin picks up any process.env vars,
    // which dotenv has a hold of automatically on import
    //new EnvironmentPlugin(['REACT_APP_API_URL']),

    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html'),
    }),

    new ModuleFederationPlugin({
      name: packageJsonName,
      shared: {
        react: { singleton: true, eager: true, requiredVersion: packageJsonDeps.react },
        'react-dom': {
          singleton: true,
          eager: true,
          requiredVersion: packageJsonDeps['react-dom'],
        },
      },
    }),
  ],
  resolve: {
    cacheWithContext: false,
    extensions: ['.js', '.ts', '.tsx', '.jsx'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, './tsconfig.json'),
      }),
    ],
    symlinks: false,
  },
};
