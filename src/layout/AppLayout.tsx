import WaitingPage from '../components/WaitingPage';
import { Panel } from '@patternfly/react-core';
import { ReactNode, useState } from 'react';

interface IAppLayout {
  children: ReactNode;
}
const AppLayout = ({ children }: IAppLayout) => {
  const [backendAvailable, setBackendAvailable] = useState(false);

  return (
    <Panel style={{ flexGrow: 1 }}>
      {backendAvailable ? children : <WaitingPage setBackendAvailable={setBackendAvailable} />}
    </Panel>
  );
};

export { AppLayout };
