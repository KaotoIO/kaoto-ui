import { IDataTestID, IIntegration, IStepPropsBranch } from '../../types';
import { IRestBranch, restDSLTableColumns } from './RestDSL.model';
import { RestOperationStep } from './RestOperationStep';
import { TableComposable, Tbody, Th, Thead, Tr } from '@patternfly/react-table';
import { FunctionComponent, useEffect, useState } from 'react';

interface IRestFlow extends IDataTestID {
  flow: IIntegration;
}

const getRestBranches = (branches: IStepPropsBranch[] = []) => {
  /**
   * Each branch holds a single step representing a HTTP verb
   * like GET, POST, PUT, DELETE
   */
  return branches
    .reduce((acc, branch) => {
      /** The HTTP verb step */
      const httpVerbStep = branch.steps?.[0];
      const method = httpVerbStep.name;

      /**
       * Each branch of the HTTP verb step holds up to 2 steps:
       * "consumes": representing a path and consumes/produces parameters
       * "direct": representing the URI of the operation
       */
      const restBranches =
        httpVerbStep.branches?.map((branch) => {
          const consumesStep = branch.steps[0];
          const path = consumesStep?.parameters?.find((param) => param.id === 'uri')?.value ?? '';

          return {
            method,
            path,
            branch,
          };
        }) ?? ([] as IRestBranch[]);

      return acc.concat(restBranches);
    }, [] as IRestBranch[])
    .sort((a, b) => a.path.localeCompare(b.path));
};

export const RestFlow: FunctionComponent<IRestFlow> = (props) => {
  const [restBranches, setRestBranches] = useState<IRestBranch[]>(
    getRestBranches(props.flow.steps[0].branches),
  );

  useEffect(() => {
    setRestBranches(getRestBranches(props.flow.steps[0].branches));
  }, [props.flow.steps]);

  return (
    <TableComposable aria-label="Rest DSL definition table">
      <Thead>
        <Tr>
          <Th>{restDSLTableColumns.method}</Th>
          <Th>{restDSLTableColumns.path}</Th>
          <Th>{restDSLTableColumns.consumes}</Th>
          <Th>{restDSLTableColumns.produces}</Th>
          <Th>{restDSLTableColumns.uri}</Th>
          <Th>{restDSLTableColumns.actions}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {restBranches.map((restBranch) => (
          <RestOperationStep
            key={restBranch.branch.branchUuid}
            restBranch={restBranch}
            path={restBranch.path}
          />
        ))}
      </Tbody>
    </TableComposable>
  );
};
