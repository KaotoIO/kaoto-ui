import { AlertVariant } from '@patternfly/react-core';

export interface IStepExtensionApi {
  notifyKaoto: (message: { title: string; body: string; variant: AlertVariant }) => void;
}
