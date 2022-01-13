import React from 'react';
import { AlertProps } from '@rhoas/app-services-ui-shared';
import {
  AlertGroup,
  Alert,
  AlertActionCloseButton,
  AlertVariant,
} from '@patternfly/react-core';

type AlertToastGroupProps = {
  alerts: AlertProps[];
  onCloseAlert: (key: string | undefined) => void;
};

export const MASAlertToastGroup: React.FunctionComponent<AlertToastGroupProps> =
  ({ alerts, onCloseAlert }: AlertToastGroupProps) => {
    return (
      <AlertGroup isToast>
        {alerts.map(
          ({ id, variant, title, description, dataTestId, ...rest }) => (
            <Alert
              key={id}
              isLiveRegion
              variant={AlertVariant[variant]}
              variantLabel=''
              title={title}
              actionClose={
                <AlertActionCloseButton
                  title={title}
                  onClose={() => onCloseAlert(id)}
                />
              }
              data-testid={dataTestId}
              {...rest}
            >
              {description}
            </Alert>
          )
        )}
      </AlertGroup>
    );
  };
