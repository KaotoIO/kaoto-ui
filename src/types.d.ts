import { Edge, Node } from 'react-flow-renderer';

declare module '*.yaml' {
  const content: { [key: string]: any };
  export default content;
}

declare global {
  interface Window {
    __remotes__: Record<string, string>;
  }

  const __webpack_init_sharing__: any;
  const __webpack_share_scopes__: any;
}

export interface ISettings {
  dsl: string;
  integrationName: string;
  namespace: string;
}

export interface IStepPropsParameters {
  [key: string]: any;
}

export interface IStepProps {
  apiVersion?: string;
  description?: string;
  group?: string;
  icon?: string;
  id?: string;
  kameletType?: string;
  kind?: string;
  name: string;
  parameters?: IStepPropsParameters[];

  // should be 'KAMELET' for now
  subType?: string;
  title?: string;

  // e.g. 'START', 'MIDDLE', 'END'
  type: string;

  // generated only for integration steps
  UUID?: string;
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
  dsl: string;
  icon?: string;
  kind?: string;
  label: string;
  UUID?: string;
  index: number;
  onDropChange: (arg1: any, arg2: any) => void;
  onMiniCatalogClickAdd: (arg: any) => void;
  settings: ISettings;
}

export interface IVizStepPropsNode extends Node {}

export interface IVizStepPropsEdge extends Omit<Edge, 'arrowHeadType' | 'source' | 'target'> {
  arrowHeadType?: string;
  source?: string;
  target?: string;
}
