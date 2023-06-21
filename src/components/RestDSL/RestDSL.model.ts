import { IIntegration, IStepProps, IStepPropsBranch } from '../../types';

export const restDSLTableColumns = {
  method: 'Method',
  path: 'Path',
  consumes: 'Consumes',
  produces: 'Produces',
  uri: 'URI',
  actions: 'Actions',
};

export interface IRestFlow {
  id: string;
  path: string;
  description: string;
  flow: IIntegration;
  operationsCount: number | undefined;
}

export interface IRestBranch {
  method: string;
  path: string;
  branch: IStepPropsBranch;
}

export interface IRowValues {
  method: string;
  consumes: string[];
  produces: string[];
  direct: string;
  consumesStep: IStepProps | undefined;
  directStep: IStepProps | undefined;
}
