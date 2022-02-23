import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/utilities/Display/display.css';
import '@patternfly/patternfly/utilities/Flex/flex.css';
import '@patternfly/patternfly/utilities/Sizing/sizing.css';
import '@patternfly/patternfly/utilities/Spacing/spacing.css';

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
