import replace from '@rollup/plugin-replace';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    replace({
      KAOTO_API: JSON.stringify('http://localhost:8081'),
      KAOTO_VERSION: JSON.stringify('v1.0.0'),
      preventAssignment: true,
    }),
  ],
  resolve: {
    alias: [
      { find: 'path', replacement: 'rollup-plugin-node-polyfills/polyfills/path' },
      {
        find: /~(.+)/,
        replacement: resolve(__dirname, '../../', 'node_modules/$1'),
      },
    ],
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        'kaoto-editor': resolve(__dirname, './envelope-kaoto-editor.html'),
        'serverless-workflow-text-editor': resolve(
          __dirname,
          './envelope-serverless-workflow-text-editor.html',
        ),
      },
    },
  },
});
