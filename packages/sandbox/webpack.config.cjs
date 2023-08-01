const webpack = require('webpack');
const path = require('path');
const { merge } = require('webpack-merge');
const webpackCommonConfig = require('../kaoto-ui/webpack.dev');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { federatedModuleName } = require('../kaoto-ui/package.json');

webpackCommonConfig.plugins = webpackCommonConfig.plugins.filter((plugin) => {
  return (
    !(plugin instanceof HtmlWebpackPlugin) &&
    !(plugin instanceof webpack.container.ModuleFederationPlugin)
  );
});
webpackCommonConfig.module = undefined;
webpackCommonConfig.resolve = undefined;

module.exports = merge(webpackCommonConfig, {
  entry: {
    index: path.resolve(__dirname, './src/main.tsx'),
    'kaoto-editor': path.resolve(__dirname, './src/envelope/KaotoEditorEnvelopeApp.ts'),
    'serverless-workflow-text-editor': path.resolve(
      __dirname,
      './src/envelope/ServerlessWorkflowTextEditorEnvelopeApp.ts',
    ),
  },
  output: {
    path: path.resolve('./dist'),
    hashDigestLength: 8,
    filename: 'assets/[id]-[chunkhash].js',
    assetModuleFilename: 'assets/[name]-[hash][ext]',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
      {
        test: /\.m?js/, // related to: https://github.com/webpack/webpack/discussions/16709
        resolve: {
          fullySpecified: false,
        },
      },
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
      {
        test: /\.(sa|sc|c)ss$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        type: 'asset/resource',
      },
      {
        test: /\.(svg|jpg|jpeg|png|gif)$/i,
        type: 'asset/inline',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      favicon: path.resolve(__dirname, 'src/assets', 'favicon.svg'),
      chunks: ['index'],
      template: path.resolve(__dirname, 'webpack-template-index.html'),
      filename: 'index.html',
    }),
    new HtmlWebpackPlugin({
      favicon: path.resolve(__dirname, 'src/assets', 'favicon.svg'),
      chunks: ['kaoto-editor'],
      template: path.resolve(__dirname, 'webpack-template-index.html'),
      filename: 'envelope-kaoto-editor.html',
    }),
    new HtmlWebpackPlugin({
      favicon: path.resolve(__dirname, 'src/assets', 'favicon.svg'),
      chunks: ['serverless-workflow-text-editor'],
      template: path.resolve(__dirname, 'webpack-template-index.html'),
      filename: 'envelope-serverless-workflow-text-editor.html',
    }),
    new webpack.container.ModuleFederationPlugin({
      name: federatedModuleName,
      filename: 'remoteEntry.js',
      library: { type: 'var', name: federatedModuleName },
      shared: {
        react: {
          eager: true,
        },
        'react-dom': {
          eager: true,
        },
      },
    }),
  ],
  ignoreWarnings: [/Failed to parse source map/],
  resolve: {
    fallback: {
      path: require.resolve('path-browserify'),
    },
    extensions: ['.js', '.ts', '.tsx', '.jsx'],
    modules: ['node_modules'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, './tsconfig.json'),
      }),
    ],
    symlinks: false,
    cacheWithContext: false,
  },
});
