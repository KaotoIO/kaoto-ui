/*
 * Copyright 2022 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const { DefinePlugin } = require('webpack');
const { inspect } = require('util');

module.exports = () => {
  const hola = {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
      index: path.resolve(__dirname, './src/index.tsx'),
      'kaoto-editor-envelope': path.resolve(__dirname, './src/envelope/KaotoEditorEnvelopeApp.ts'),
      'serverless-workflow-text-editor-envelope': path.resolve(__dirname, './src/envelope/ServerlessWorkflowTextEditorEnvelopeApp.ts'),
    },
    output: {
      path: path.resolve('./dist/dev-webapp'),
      filename: '[name].js',
      chunkFilename: '[name].bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          enforce: "pre",
          use: ["source-map-loader"],
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
          use: [
            'style-loader',
            'css-loader',
            'sass-loader',
          ],
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
      new CopyPlugin({
        patterns: [
          { from: path.resolve(__dirname, './static/resources'), to: './resources' },
          { from: path.resolve(__dirname, './static/index.html'), to: './index.html' },
          { from: path.resolve(__dirname, './static/favicon.svg'), to: './favicon.svg' },
          {
            from: path.resolve(__dirname, './static/envelope/kaoto-editor-envelope.html'),
            to: './kaoto-editor-envelope.html',
          },
          {
            from: path.resolve(__dirname, './static/envelope/serverless-workflow-text-editor-envelope.html'),
            to: './serverless-workflow-text-editor-envelope.html',
          },
        ],
      }),
      new MonacoWebpackPlugin({
        languages: ['json'],
        customLanguages: [
          {
            label: 'yaml',
            entry: ['monaco-yaml', 'vs/basic-languages/yaml/yaml.contribution'],
            worker: {
              id: 'monaco-yaml/yamlWorker',
              entry: 'monaco-yaml/yaml.worker.js',
            },
          },
        ],
      }),
      new NodePolyfillPlugin({
        includeAliases: ['path'],
      }),
      new DefinePlugin({
        'process.env.KAOTO_API': JSON.stringify("http://localhost:8081")
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
    ignoreWarnings: [/Failed to parse source map/],
    devServer: {
      allowedHosts: 'all',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
      historyApiFallback: true,
      port: 1338,
      static: [{ directory: path.join(__dirname) }],
    },
  };

  console.log(inspect(hola, { colors: true, depth: null }));

  return hola;
};
