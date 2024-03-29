import '@patternfly/patternfly/patternfly-theme-dark.css';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/utilities/Accessibility/accessibility.css';
import '@patternfly/patternfly/utilities/Display/display.css';
import '@patternfly/patternfly/utilities/Flex/flex.css';
import '@patternfly/patternfly/utilities/Sizing/sizing.css';
import '@patternfly/patternfly/utilities/Spacing/spacing.css';
import 'reactflow/dist/style.css';
import { AlertProvider } from '../src/layout';
import { initialize, mswDecorator } from 'msw-storybook-addon';
import steps from '../src/stubs/steps/steps.default';
import { rest } from 'msw';

initialize({
  onUnhandledRequest(req, print) {
    if (req.url.pathname.startsWith('/static/')) {
      return;
    }

    print.warning();
  }
});

export const decorators = [
  mswDecorator,
  (Story: any) => (
    <AlertProvider>
      <Story />
    </AlertProvider>
  ),
];

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  options: {
    storySort: {
      method: 'alphabetical'
    }
  },
  msw: {
    handlers: {
      steps: rest.get(
        'http://localhost:8081/v1/steps?dsl=Camel%20Route&namespace=default',
        (_req, res, ctx) => {
          return res(ctx.status(200), ctx.json(steps))
        }
      ),
    }
  }
}
