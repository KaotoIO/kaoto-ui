import './App.css';
import { AlertProvider, MASLoading } from './layout';
import { AppLayout } from './layout/AppLayout';
import { AppRoutes } from './routes';
import '@patternfly/patternfly/patternfly-theme-dark.css';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/react-core/dist/styles/base.css';
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
