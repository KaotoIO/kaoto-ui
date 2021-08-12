declare module '*.yaml' {
  const content: { [key: string]: any }
  export default content
}

declare var process : {
  env: {
    REACT_APP_API_URL: string
  }
}

export interface IStepParameter {
  default?: string;
  description?: string;
  id?: string;
  label?: string;
  type?: string;
  value?: string;
}

/**
 * TODO: Check swagger for accurate types
 */
export interface IStepProps {
  description?: string,
  group?: string,
  icon?: string,
  id: string,
  kameletType?: string,
  kind?: string,
  name?: string,
  parameters?: IStepParameter[],
  subType?: string, // should be 'KAMELET'
  title?: string,
  type?: string // e.g. 'CONNECTOR'
}

export interface IViewData {
  steps?: IStepProps[]
}
