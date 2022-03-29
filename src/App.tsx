import { AlertProvider, MASLoading } from './components';
import { AppLayout } from './layouts/AppLayout';
import { AppRoutes } from './routes';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/react-core/dist/styles/base.css';
import { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import './App.css';

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
