export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  features: {
    storyStoreV7: true,
  },
  stories: [
    {
      directory: '../src',
      files: '*.stories.*',
    },
  ],
};
