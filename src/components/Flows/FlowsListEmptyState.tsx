import { IDataTestID } from '@kaoto/types';
import { EmptyState, EmptyStateBody, EmptyStateIcon, Title } from '@patternfly/react-core';
import { ListIcon } from '@patternfly/react-icons';
import { FunctionComponent } from 'react';

export const FlowsListEmptyState: FunctionComponent<IDataTestID> = (props) => {
  return (
    <EmptyState data-testid={props['data-testid']}>
      <EmptyStateIcon icon={ListIcon} />
      <Title headingLevel="h4" size="md">
        There's no routes to show
      </Title>
      <EmptyStateBody>You could create a new route using the New route button</EmptyStateBody>
    </EmptyState>
  );
};
