import { WaitingPage } from '../components/WaitingPage';
import { useSettingsStore } from '../store';
import { IDsl } from '../types';
import { sleep } from '../utils';
import { fetchBackendVersion, fetchCapabilities } from '@kaoto/api';
import { FunctionComponent, PropsWithChildren, createContext, useCallback, useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';

export const Capabilities = createContext<IDsl[]>([]);

export const CapabilitiesProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [message, setMessage] = useState('Trying to reach the Kaoto API');
  const [fetching, setFetching] = useState(true);
  const { namespace, capabilities, setSettings } = useSettingsStore(
    (state) => ({
      namespace: state.settings.namespace,
      capabilities: state.settings.capabilities,
      setSettings: state.setSettings,
    }),
    shallow,
  );

  const notifyBackendUnavailable = useCallback(() => {
    setBackendAvailable(false);
    setMessage('Kaoto API is unreachable');
    setFetching(false);
  }, []);

  useEffect(() => {
    // Method that tries to connect to capabilities/version endpoint and evaluate if the API is available
    const tryApiAvailable = (retries: number) => {
      fetchBackendVersion()
        .then((response) => {
          if (response) {
            setBackendAvailable(true);
            setSettings({ backendVersion: response });
          }
        })
        .catch(() => {
          if (retries > 0) {
            sleep(1_000).then(() => {
              tryApiAvailable(retries - 1);
            });
          } else {
            notifyBackendUnavailable();
          }
        });
    };
    // try to fetch api for 120seconds
    tryApiAvailable(120);
  }, []);

  useEffect(() => {
    /** Dispatch call for getting the available capabilities without waiting for it */
    fetchCapabilities(namespace)
      .then((capabilities) => {
        setSettings({ capabilities });
      })
      .catch((reason) => {
        console.error('Error when fetching capabilities', reason);
        notifyBackendUnavailable();
      });
  }, []);

  return (
    <Capabilities.Provider value={capabilities}>
      {backendAvailable && capabilities.length ? (
        children
      ) : (
        <WaitingPage fetching={fetching} message={message} />
      )}
    </Capabilities.Provider>
  );
};
