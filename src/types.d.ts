import { CSSProperties, ReactNode } from 'react';
import { ArrowHeadType, Edge, ElementId, FlowElement, Node } from 'react-flow-renderer/dist/types';

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

export interface IStepPropsParameters {
  [key: string]: any;
}

export interface IStepProps {
  apiVersion: string;
  description?: string;
  group?: string;
  icon: string;
  id: string;
  kameletType?: string;
  kind?: string;
  name: string;
  parameters?: IStepPropsParameters[];
  subType?: string; // should be 'KAMELET'
  title?: string;
  type: string; // e.g. 'START', 'MIDDLE', 'END'
  UUID: string;
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

export interface IVizStepProps extends IVizStepPropsNode, IVizStepPropsEdge {}

export interface IVizStepPropsNode extends Node {}

export interface IVizStepPropsEdge extends Omit<Edge, 'arrowHeadType' | 'source' | 'target'> {
  arrowHeadType?: string;
  source?: string;
  target?: string;
}
