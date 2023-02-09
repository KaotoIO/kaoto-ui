import { WaitingPage } from '../components/WaitingPage';
import { fetchCapabilities } from '@kaoto/api';
import { sleep } from '@kaoto/utils';
import { Panel } from '@patternfly/react-core';
import { ReactNode, useEffect, useState } from 'react';

interface IAppLayout {
  children: ReactNode;
}
const AppLayout = ({ children }: IAppLayout) => {
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [message, setMessage] = useState('Trying to reach the Kaoto API');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    // Method that tries to connect to capabilities endpoint and evaluate if the API is available
    const tryApiAvailable = (retries: number) => {
      fetchCapabilities()
        .then((resp) => {
          if (resp) {
            setBackendAvailable(true);
            setMessage('Trying to reach the Kaoto API');
          }
        })
        .catch(() => {
          if (retries > 0) {
            sleep(1000).then(() => {
              tryApiAvailable(retries - 1);
            });
          } else {
            setBackendAvailable(false);
            setMessage('Kaoto API is unreachable');
            setFetching(false);
          }
        });
    };
    // try to fetch api for 120seconds
    tryApiAvailable(120);
  }, []);

  return (
    <Panel style={{ flexGrow: 1 }}>
      {backendAvailable ? children : <WaitingPage fetching={fetching} message={message} />}
    </Panel>
  );
};

export { AppLayout };
