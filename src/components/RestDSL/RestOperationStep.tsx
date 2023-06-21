import { SelectedStep } from '../../providers';
import { IDataTestID, IStepProps } from '../../types';
import { IRestBranch, IRowValues, restDSLTableColumns } from './RestDSL.model';
import { Button, Chip } from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';
import { FunctionComponent, useContext } from 'react';

interface IRestOperationStep extends IDataTestID {
  restBranch: IRestBranch;
  path: string;
}

const getRowValues = (restStep: IRestBranch): IRowValues => {
  // TODO: Validate the steps in a better way to avoid the need of the ! operator
  const consumesStep = restStep.branch.steps[0];
  const directStep = restStep.branch.steps[1];

  const consumes =
    consumesStep?.parameters?.find((param) => param.id === 'consumes')?.value?.split(',') ?? [];
  const produces =
    consumesStep?.parameters?.find((param) => param.id === 'produces')?.value?.split(',') ?? [];
  const direct = directStep?.parameters?.find((param) => param.id === 'name')?.value ?? '';

  return {
    method: restStep.method,
    consumes,
    produces,
    direct,
    consumesStep,
    directStep,
  };
};

export const RestOperationStep: FunctionComponent<IRestOperationStep> = (props) => {
  const { editStep } = useContext(SelectedStep);

  const rowValues = getRowValues(props.restBranch);

  return (
    <Tr
      className="rest-visualization__row"
      data-method={rowValues.method}
      data-testid={props['data-testid']}
    >
      <Td dataLabel={restDSLTableColumns.method} modifier="fitContent">
        <span className="rest-visualization__row__method pf-u-font-family-redhatVF-monospace">
          {rowValues.method}
        </span>
      </Td>
      <Td dataLabel={restDSLTableColumns.path}>
        <span className="pf-u-font-family-redhatVF-monospace">{props.path}</span>
      </Td>
      <Td dataLabel={restDSLTableColumns.consumes}>
        {rowValues.consumes.map((consume) => (
          <Chip key={consume} isReadOnly>
            {consume}
          </Chip>
        ))}
      </Td>
      <Td dataLabel={restDSLTableColumns.produces}>
        {rowValues.produces.map((produce) => (
          <Chip key={produce} isReadOnly>
            {produce}
          </Chip>
        ))}
      </Td>
      <Td dataLabel={restDSLTableColumns.uri}>
        <span className="pf-u-font-family-redhatVF-monospace">direct:{rowValues.direct}</span>
      </Td>
      <Td dataLabel={restDSLTableColumns.actions} modifier="fitContent">
        <Button
          onClick={() => {
            editStep(rowValues.consumesStep as IStepProps);
          }}
        >
          Edit
        </Button>
      </Td>
    </Tr>
  );
};
