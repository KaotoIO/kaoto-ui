import './App.css';
import { AlertProvider, AppLayout, MASLoading } from '@kaoto/layout';
import { AppRoutes } from '@kaoto/routes';
import '@patternfly/patternfly/patternfly-theme-dark.css';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/utilities/Accessibility/accessibility.css';
import '@patternfly/patternfly/utilities/Display/display.css';
import '@patternfly/patternfly/utilities/Flex/flex.css';
import '@patternfly/patternfly/utilities/Sizing/sizing.css';
import '@patternfly/patternfly/utilities/Spacing/spacing.css';
import { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

export const App = () => {
  return (
    <AlertProvider>
      <Router>
        <Suspense fallback={<MASLoading />}>
          <AppLayout>
            <AppRoutes />
          </AppLayout>
        </Suspense>
      </Router>
    </AlertProvider>
  );
};

export default App;
