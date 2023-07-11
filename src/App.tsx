import './App.css';
import { CapabilitiesProvider } from './providers';
import { useFlowsStore } from './store';
import { bindUndoRedo } from './utils';
import { AlertProvider, AppLayout, MASLoading } from '@kaoto/layout';
import { AppRoutes } from '@kaoto/routes';
import '@patternfly/patternfly/patternfly-theme-dark.css';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/utilities/Accessibility/accessibility.css';
import '@patternfly/patternfly/utilities/BackgroundColor/BackgroundColor.css';
import '@patternfly/patternfly/utilities/Display/display.css';
import '@patternfly/patternfly/utilities/Flex/flex.css';
import '@patternfly/patternfly/utilities/Sizing/sizing.css';
import '@patternfly/patternfly/utilities/Spacing/spacing.css';
import '@patternfly/patternfly/utilities/Text/text.css';
import { Suspense } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import 'reactflow/dist/style.css';

const { undo, redo } = useFlowsStore.temporal.getState();

bindUndoRedo(undo, redo);

export const App = () => {
  return (
    <CapabilitiesProvider>
      <AlertProvider>
        <Router>
          <Suspense fallback={<MASLoading />}>
            <AppLayout>
              <AppRoutes />
            </AppLayout>
          </Suspense>
        </Router>
      </AlertProvider>
    </CapabilitiesProvider>
  );
};

export default App;
