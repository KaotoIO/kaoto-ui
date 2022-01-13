import './App.css';
import { AlertProvider, MASLoading } from './components';
import { AppLayout } from './layouts/AppLayout';
import { AppRoutes } from './routes';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/utilities/Accessibility/accessibility.css';
import '@patternfly/patternfly/utilities/Display/display.css';
import '@patternfly/patternfly/utilities/Flex/flex.css';
import '@patternfly/patternfly/utilities/Sizing/sizing.css';
import '@patternfly/patternfly/utilities/Spacing/spacing.css';
import { Suspense } from 'react';
import ReactDOM from 'react-dom';
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

ReactDOM.render(<App />, document.getElementById('app') as HTMLElement);
export default App;
