import { Edge, Node } from 'reactflow';

declare global {
  interface Window {
    __remotes__: Record<string, string>;
  }

  // const __webpack_init_sharing__: any;
  const __webpack_share_scopes__: any;
}

export interface IDeployment {
  // yaml CRD of deployment
  crd?: string;
  date: string;
  // array of errors
  errors: any[];
  // name of integration/deployment
  name: string;
  // defaults to 'default'
  namespace?: string;
  status: 'Invalid' | 'Creating' | 'Running' | 'Stopped';
  // e.g. 'Kamelet', 'KameletBinding'
  type: string;
}

export interface IIntegration {
  metadata: IIntegrationMetadata;
  params: IIntegrationParams[];
  steps: IStepProps[];
}

export interface IIntegrationMetadata {
  name: string;
  [key: string]: any;
}

export interface IIntegrationParams {
  id: string;
  title?: string;
  defaultValue?: {};
  description?: string;
  enum?: any[];
  enumeration?: {}[];
  examples?: {}[];
  nullable?: boolean;
  path?: boolean;
  type?: string;
  value?: {};
}

export interface ISettings {
  description?: string;
  // e.g. 'KameletBinding'
  dsl: string;
  icon?: string;
  // name of integration or deployment
  name: string;
  // Cluster namespace
  namespace: string;
}

/**
 * The API for extending Kaoto, typically via
 * a Generic or Step Extension
 */
export interface IKaotoApi {
  getDeployment: (name: string, namespace?: string) => Promise<string | unknown>;
  getIntegrationSource: (
    integration: IIntegration,
    dsl: string,
    namespace?: string
  ) => Promise<string | unknown>;
  notifyKaoto: (title: string, body?: string, variant?: string) => void;
  startDeployment: (
    integration: any,
    name: string,
    namespace?: string
  ) => Promise<string | unknown>;
  step: IStepProps;
  stepParams: { [p: string]: any };
  stopDeployment: (name: string, namespace?: string) => void;
  updateStep: (step: IStepProps) => void;
  updateStepParams: (newValues: { [s: string]: unknown } | ArrayLike<unknown>) => void;
}

export interface IStepProps {
  branches?: IStepPropsBranch[];
  description?: string;
  group?: string;
  icon?: string;
  id?: string;

  // e.g. 'Kamelet', 'Camel-Connector', 'EIP'
  kind?: string;

  // all steps, even if not EIP, contain this prop
  maxBranches: number;
  minBranches: number;
  name: string;

  // config parameters available for this step
  parameters?: IStepPropsParameters[];
  required?: string[];
  title?: string;

  // e.g. 'START', 'MIDDLE', 'END'
  type: string;

  // generated only for integration steps
  UUID?: string;
}

export interface IStepPropsBranch {
  condition: string;
  identifier: string;
  steps: IStepProps[];
  parameters?: IStepPropsParameters[];
}

export interface IStepPropsParameters {
  [key: string]: any;
}

export interface IStepQueryParams {
  // e.g. 'KameletBinding', 'Kamelet'
  dsl?: string;
  // e.g. 'Kamelet', 'Camel-Connector', 'EIP'
  kind?: string;
  // cluster namespace, defaults to 'default' if not provided
  namespace?: string;
  // e.g. 'START', 'END', 'MIDDLE'
  type?: string;
}

export interface IViewConstraintsProps {
  mandatory?: boolean;
  operation?: string;
  parameter?: string;
}

export interface IViewProps {
  id: string;
  name: string;
  type: string;
  constraints?: IViewConstraintsProps[];
  module?: string;
  scope?: string;
  step?: string;
  url?: string;
}

export interface IViewData {
  steps: IStepProps[];
  views: IViewProps[];
}

export interface IVizStepNodeData {
  icon?: string;
  kind?: string;
  label: string;
  step?: IStepProps;
  UUID?: string;
  branchInfo?: Partial<IStepPropsBranch> & {
    branchUuid?: string;
    parentUuid: string;
  };
}

/**
 * Used to extend React Flow's `Node` type
 */
export type IVizStepNode = Node & {
  data: IVizStepNodeData;
};

/**
 * Used to extend React Flow's `Edge` type
 */
export type IVizStepPropsEdge = Edge & {
  arrowHeadType?: string;
};
