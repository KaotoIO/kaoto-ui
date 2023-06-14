import { IDataTestID, IVisibleFlowsInformation } from '@kaoto/types';
import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Title,
} from '@patternfly/react-core';
import { CubesIcon as PatternFlyCubesIcon, EyeSlashIcon as PatternFlyEyeSlashIcon } from '@patternfly/react-icons';
import { FunctionComponent } from 'react';

interface IVisualizationEmptyState extends IDataTestID {
  visibleFlowsInformation: IVisibleFlowsInformation;
}

const CubesIcon: FunctionComponent = (props) => <PatternFlyCubesIcon data-testid="cubes-icon" {...props} />;
const EyeSlashIcon: FunctionComponent = (props) => <PatternFlyEyeSlashIcon data-testid="eye-slash-icon" {...props} />;

export const VisualizationEmptyState: FunctionComponent<IVisualizationEmptyState> = (props) => {
  return (
    <Bullseye>
      <EmptyState data-testid={props['data-testid']}>
        <EmptyStateIcon
          icon={props.visibleFlowsInformation.totalFlowsCount === 0 ? CubesIcon : EyeSlashIcon}
        />
        <Title headingLevel="h4" size="md">
          {props.visibleFlowsInformation.totalFlowsCount === 0 ? (
            <p>There are no routes defined</p>
          ) : (
            <p>There are no visible routes</p>
          )}
        </Title>
        <EmptyStateBody>
          {props.visibleFlowsInformation.totalFlowsCount === 0 ? (
            <p>You can create a new route using the New route button</p>
          ) : (
            <p>You can toggle the visibility of a route by using Routes list</p>
          )}
        </EmptyStateBody>
      </EmptyState>
    </Bullseye>
  );
};
