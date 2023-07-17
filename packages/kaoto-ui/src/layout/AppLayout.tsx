import { Panel } from '@patternfly/react-core';
import { FunctionComponent, PropsWithChildren } from 'react';

export const AppLayout: FunctionComponent<PropsWithChildren> = ({ children }) => {
  return <Panel style={{ flexGrow: 1 }}>{children}</Panel>;
};
