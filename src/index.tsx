import * as React from 'react';
import ReactDOM from "react-dom";
import '@patternfly/react-core/dist/styles/base.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { AppRoutes } from './routes';
import './App.css';

const App: React.FunctionComponent = () => (
  <Router>
    <AppLayout>
      <AppRoutes />
    </AppLayout>
  </Router>
);

ReactDOM.render(<App />, document.getElementById("root") as HTMLElement);
