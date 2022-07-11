import { IDeployment } from '../types';
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

interface IDeploymentProvider {
  initialState?: IDeployment;
  children: ReactNode;
}

export type IUseDeployment = [IDeployment, Dispatch<SetStateAction<IDeployment>>];

const initialOrChangedDeployment: IDeployment = {
  crd: '',
  date: '',
  errors: [],
  name: 'integration',
  namespace: 'default',
  status: 'Stopped',
  type: 'KameletBinding',
};

/**
 * Provider
 * @param initialState
 * @param children
 * @constructor
 */
function DeploymentProvider({ initialState, children }: IDeploymentProvider) {
  const [deployment, setDeployment] = useState<IDeployment>(
    initialState ?? initialOrChangedDeployment
  );

  return (
    <deploymentContext.Provider value={[deployment, setDeployment]}>
      {children}
    </deploymentContext.Provider>
  );
}

/**
 * Create context
 */
const deploymentContext = createContext<IUseDeployment>([initialOrChangedDeployment, () => null]);

/**
 * Convenience hook
 */
function useDeploymentContext() {
  const context = useContext(deploymentContext);
  if (!context) {
    throw new Error('useDeploymentContext must be used within DeploymentProvider!');
  }
  return context;
}

export { DeploymentProvider, useDeploymentContext };
