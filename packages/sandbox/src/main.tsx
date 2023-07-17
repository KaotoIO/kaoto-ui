// TODO: Fix prettierconfig to move all css imports to the top
//"importOrder": ["^@core/(.*)$", "^@server/(.*)$", "^@ui/(.*)$", "^[./]"]

// This import needs to be first in order to propagate the CSS variables
import '@patternfly/react-core/dist/styles/base.css';
import './index.css';
import ReactDOM from 'react-dom/client';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  /*
   * uniforms is not compatible with StrictMode yet
   * <React.StrictMode>
   * </React.StrictMode>,
   */
  <App />,
);
