/* eslint-disable */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const { dependencies, federatedModuleName, peerDependencies } = require('./package.json');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
// const CopyPlugin = require('copy-webpack-plugin');
// const FederatedTypesPlugin = require('@module-federation/typescript');

const isPatternflyStyles = (stylesheet) =>
  stylesheet.includes('@patternfly/react-core/') ||
  stylesheet.includes('@patternfly/react-code-editor') ||
  stylesheet.includes('monaco-editor-webpack-plugin');

const deps = require('./package.json').dependencies;

module.exports = () => {
  return {
    entry: path.resolve(__dirname, 'src', 'index.tsx'),
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
          test: /\.css|s[ac]ss$/i,
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
          test: /\.(ttf|eot|woff|woff2)$/,
          type: 'asset/resource',
        },
        {
          test: /\.(svg|jpg|jpeg|png|gif)$/i,
          type: 'asset/inline',
        },
      ],
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      publicPath: 'auto',
    },
    optimization: {
      splitChunks: false,
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
      new MonacoWebpackPlugin({
        languages: ['yaml'],
        globalAPI: true,
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
      // new CopyPlugin({
      //   patterns: [
      //     {
      //       from: path.resolve(__dirname, 'src', '@kaoto'),
      //       to: path.resolve(__dirname, 'dist', '@kaoto'),
      //     },
      //   ],
      // }),
      new webpack.container.ModuleFederationPlugin({
        name: federatedModuleName,
        filename: 'remoteEntry.js',
        library: { type: 'var', name: federatedModuleName },
        // exposes: ['./src/@kaoto/index.ts'],
        shared: {
          ...deps,
          react: {
            eager: true,
            singleton: true,
            requiredVersion: peerDependencies['react'],
          },
          'react-dom': {
            eager: true,
            singleton: true,
            requiredVersion: peerDependencies['react-dom'],
          },
          'react-router-dom': {
            requiredVersion: dependencies['react-router-dom'],
          },
          '@patternfly/patternfly/': {
            singleton: true,
            eager: true,
            requiredVersion: peerDependencies['@patternfly/patternfly'],
          },
          '@patternfly/react-core/': {
            singleton: true,
            eager: true,
            requiredVersion: peerDependencies['@patternfly/react-core'],
          },
        },
      }),
      // new FederatedTypesPlugin(),
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
