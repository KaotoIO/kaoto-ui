import { IDsl } from './dsl.model';
import { Edge, Node } from 'reactflow';

declare global {
  interface Window {
    __remotes__: Record<string, string>;
  }

  // const __webpack_init_sharing__: any;
  const __webpack_share_scopes__: any;
}
export enum CodeEditorMode {
  FREE_EDIT = 0,
  READ_ONLY = 1,
  TWO_WAY_SYNC = 2,
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
  id: string;
  dsl: string;
  metadata: IIntegrationMetadata;
  description?: string;
  params: IIntegrationParams[];
  steps: IStepProps[];
}

export interface IIntegrationMetadata {
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
  dsl: IDsl;
  editorIsLightMode: boolean;
  uiLightMode: boolean;
  editorMode: CodeEditorMode;

  // name used for VS Code
  name: string;
  // Cluster namespace
  namespace: string;

  /** Current backend version */
  backendVersion: string;
  /**
   * All capabilities supported by the backend regardless
   * of the current steps.
   */
  capabilities: IDsl[];
}

/**
 * The API for extending Kaoto, typically via
 * a Generic or Step Extension
 */
export interface IKaotoApi {
  getDeployment: (deploymentName: string, namespace?: string) => Promise<string | unknown>;
  getIntegrationSource: () => string;
  notifyKaoto: (title: string, body?: string, variant?: string) => void;
  startDeployment: (
    integration: any,
    deploymentName: string,
    namespace?: string,
  ) => Promise<string | unknown>;
  step: IStepProps;
  stepParams: { [p: string]: any };
  stopDeployment: (deploymentName: string, namespace?: string) => void;
  updateStep: (step: IStepProps) => void;
  updateStepParams: (newValues: { [s: string]: unknown } | ArrayLike<unknown>) => void;
  fetchStepDetails: (stepId: string) => Promise<IStepProps>;
}

export interface INestedStep {
  branchIndex: number;
  branchUuid: string;
  parentStepUuid: string;
  pathToBranch: string[] | undefined;
  pathToParentStep: string[] | undefined;
  pathToStep: string[] | undefined;
  stepUuid: string;
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
  UUID: string;

  // IntegrationID to which this step belongs to
  integrationId: string;
}

export interface IStepPropsBranch {
  branchUuid: string;
  condition?: string;
  identifier: string;
  steps: IStepProps[];
  parameters?: IStepPropsParameters[];
}

export interface IStepPropsParameters {
  id: string;
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
  previousStep?: string;
  followingStep?: string;
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

export type IVizStepNodeDataBranch = Partial<IStepPropsBranch> & {
  /**
   * An optional label for the branch (e.g. 'if', 'else', 'otherwise')
   */
  branchIdentifier?: string;
  branchStep: boolean;

  /**
   * The branch node's immediate parent
   */
  parentStepUuid?: string;
  /**
   * The UUID of the node *after* the branch parent
   */
  parentStepNextUuid: string;

  /**
   * The UUID of the original (n=1) branch's parent node
   */
  rootStepUuid: string;

  /**
   * The UUID of the node *after* the original (n=1) branch's
   * parent node (used for connecting branch steps back)
   */
  rootStepNextUuid: string;
};

/**
 * Used to extend React Flow's `Node` type
 */
export type IVizStepNode = Node & {
  data: IVizStepNodeData;
};

export interface IVizStepNodeData {
  branchInfo?: IVizStepNodeDataBranch;
  handleDeleteStep?: HandleDeleteStepFn;
  icon?: string;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  isPlaceholder?: boolean;
  kind?: string;
  label: string;
  previousStepUuid?: string;
  nextStepUuid?: string;
  step: IStepProps;
}

/**
 * Used to extend React Flow's `Edge` type
 */
export type IVizStepPropsEdge = Edge & {
  arrowHeadType?: string;
};

/**
 * DTO Interface used for the backend communication
 */
export interface IFlowsWrapper {
  flows: IIntegration[];
  properties: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export type HandleDeleteStepFn = (integrationId: string, UUID: string) => void;

export * from './dsl.model';
export * from './react-components.model';
export * from './validation.model';
export * from './visualization.model';
