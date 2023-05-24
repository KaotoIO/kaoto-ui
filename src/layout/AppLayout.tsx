import { WaitingPage } from '../components/WaitingPage';
import { useSettingsStore } from '../store';
import { fetchBackendVersion, fetchCapabilities } from '@kaoto/api';
import { sleep } from '@kaoto/utils';
import { Panel } from '@patternfly/react-core';
import { ReactNode, useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';

interface IAppLayout {
  children: ReactNode;
}

export const AppLayout = ({ children }: IAppLayout) => {
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [message, setMessage] = useState('Trying to reach the Kaoto API');
  const [fetching, setFetching] = useState(true);
  const { namespace, setSettings } = useSettingsStore(
    ({ settings, setSettings }) => ({ namespace: settings.namespace, setSettings }),
    shallow,
  );

  useEffect(() => {
    // Method that tries to connect to capabilities/version endpoint and evaluate if the API is available
    const tryApiAvailable = (retries: number) => {
      fetchBackendVersion()
        .then((response) => {
          if (response) {
            setBackendAvailable(true);
            setMessage('Trying to reach the Kaoto API');
            setSettings({ backendVersion: response });
          }
        })
        .catch(() => {
          if (retries > 0) {
            sleep(1_000).then(() => {
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

  useEffect(() => {
    /** Dispatch call for getting the available capabilities without waiting for it */
    fetchCapabilities(namespace).then((capabilities) => {
      if (Array.isArray(capabilities?.dsls)) {
        setSettings({ capabilities: capabilities.dsls });
      }
    }).catch((reason) => {
      console.error('Error when fetching capabilities', reason);
    });
  }, [namespace, setSettings]);

  return (
    <Panel style={{ flexGrow: 1 }}>
      {backendAvailable ? children : <WaitingPage fetching={fetching} message={message} />}
    </Panel>
  );
};
