declare module '*.yaml' {
  const content: { [key: string]: any }
  export default content
}

declare var process : {
  env: {
    REACT_APP_API_URL: string;
  }
}

/**
 * TODO: Check swagger for accurate types
 */
export interface IStepProps {
  apiVersion: string;
  description?: string;
  group?: string;
  icon: string;
  id: string;
  kameletType?: string;
  kind?: string;
  name: string;
  parameters?: any[];
  subType?: string; // should be 'KAMELET'
  title?: string;
  type: string; // e.g. 'START', 'MIDDLE', 'END'
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
}

export interface IViewData {
  steps: IStepProps[];
  views: IViewProps[];
}

export interface IVizStepProps {
  id: string;
  label: string;
  position: {
    x?: number;
    y?: number;
  },
  temporary: boolean
}

