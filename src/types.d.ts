import { Edge, Node } from 'react-flow-renderer';

declare global {
  interface Window {
    __remotes__: Record<string, string>;
  }

  const __webpack_init_sharing__: any;
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

export interface IStepProps {
  branches?: IStepPropsBranch[];
  description?: string;
  group?: string;
  icon?: string;
  id?: string;

  // e.g. 'Kamelet', 'Camel-Connector', 'EIP'
  kind?: string;
  name: string;

  // parameters provided for this step
  parameters?: IStepPropsParameters[];
  required?: string[];
  title?: string;

  // e.g. 'START', 'MIDDLE', 'END'
  type: string;

  // generated only for integration steps
  UUID?: string;
}

export interface IStepPropsBranch {
  steps?: IStepProps[];
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
  connectorType: string;
  handleUpdateViews?: (newViews: IViewProps[]) => void;
  icon?: string;
  kind?: string;
  label: string;
  UUID?: string;
  onDropChange: (arg1: any, arg2: any) => void;
  onMiniCatalogClickAdd: (selectedStep: IStepProps) => void;
  onMiniCatalogClickInsert: (selectedStep: IStepProps, idx: number) => void;
}

export interface IVizStepPropsNode extends Node {
  data: IVizStepNodeData;
}

export interface IVizStepPropsEdge extends Omit<Edge, 'arrowHeadType' | 'source' | 'target'> {
  arrowHeadType?: string;
  source?: string;
  target?: string;
}
