/* eslint-disable */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const { dependencies, federatedModuleName } = require('./package.json');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isPatternflyStyles = (stylesheet) =>
  stylesheet.includes('@patternfly/react-styles/css/') ||
  stylesheet.includes('@patternfly/react-core/');

module.exports = () => {
  return {
    entry: {
      app: path.resolve(__dirname, 'src', 'index.tsx'),
    },
    module: {
      rules: [
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
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
          include: (stylesheet) => !isPatternflyStyles(stylesheet),
          sideEffects: true,
        },
        {
          test: /\.css$/,
          include: isPatternflyStyles,
          use: ['null-loader'],
          sideEffects: true,
        },
        {
          test: /\.(svg|jpg|jpeg|png|gif)$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 5000,
              },
            },
          ],
        },
        {
          test: /\.yaml$/,
          use: 'yaml-loader',
        },
      ],
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
      new HtmlWebpackPlugin({
        favicon: path.resolve(__dirname, 'src/assets/images', 'favicon.svg'),
        template: path.resolve(__dirname, 'public', 'index.html'),
      }),
      new Dotenv({
        systemvars: true,
        silent: true,
      }),
      new MiniCssExtractPlugin({
        insert: (linkTag) => {
          const preloadLinkTag = document.createElement('link');
          preloadLinkTag.rel = 'preload';
          preloadLinkTag.as = 'style';
          preloadLinkTag.href = linkTag.href;
          document.head.appendChild(preloadLinkTag);
          document.head.appendChild(linkTag);
        },
      }),
      new webpack.container.ModuleFederationPlugin({
        name: federatedModuleName,
        shared: {
          react: {
            eager: true,
            singleton: true,
            requiredVersion: dependencies['react'],
          },
          'react-dom': {
            eager: true,
            singleton: true,
            requiredVersion: dependencies['react-dom'],
          },
          'react-router-dom': {
            singleton: true,
            eager: true,
            requiredVersion: dependencies['react-router-dom'],
          },
          '@patternfly/quickstarts': {
            singleton: true,
            requiredVersion: '*',
          },
        },
      }),
    ],
    resolve: {
      extensions: ['.js', '.ts', '.tsx', '.jsx'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: path.resolve(__dirname, './tsconfig.json'),
        }),
      ],
      symlinks: false,
      cacheWithContext: false,
    },
  };
};
