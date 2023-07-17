/* eslint-disable */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { dependencies, federatedModuleName, version } = require('./package.json');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const isPatternflyStyles = (stylesheet) =>
  stylesheet.includes('@patternfly/react-core/') ||
  stylesheet.includes('@patternfly/react-code-editor') ||
  stylesheet.includes('monaco-editor-webpack-plugin');

const common = (mode) => {
  return {
    mode,
    entry: path.resolve(__dirname, 'src', 'index.tsx'),
    module: {
      rules: [
        {
          test: /\.(css|sass|scss)$/i,
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
          type: 'asset',
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
      new MonacoWebpackPlugin({
        languages: ['yaml'],
        globalAPI: true,
        customLanguages: [
          {
            label: 'yaml',
            entry: 'monaco-yaml',
            worker: {
              id: 'monaco-yaml/yamlWorker',
              entry: 'monaco-yaml/yaml.worker',
            },
          },
        ],
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
        filename: 'remoteEntry.js',
        library: { type: 'var', name: federatedModuleName },
        // exposes: ['./src/@kaoto/index.ts'],
        shared: {
          ...dependencies,
        },
      }),
      // new FederatedTypesPlugin(),
      new webpack.DefinePlugin({
        KAOTO_VERSION: JSON.stringify(version),
        NODE_ENV: JSON.stringify(mode),
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

module.exports = { common };
