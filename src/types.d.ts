declare module '*.yaml' {
  const content: { [key: string]: any }
  export default content
}

declare var process : {
  env: {
    REACT_APP_API_URL: string
  }
}

/**
 * TODO: Check swagger for accurate types
 */
export interface IStepProps {
  apiVersion?: string,
  description?: string,
  group?: string,
  icon?: string,
  id: string,
  kameletType?: string,
  kind?: string,
  name?: string,
  parameters?: any[],
  subType?: string, // should be 'KAMELET'
  title?: string,
  type?: string // e.g. 'CONNECTOR'
}

export interface IViewDataResponse {
  id?: string; // Optional since we only care about steps for now
  name?: string; // Optional since we only care about steps for now
  steps?: IStepProps[];
  type?: string; // Optional since we only care about steps for now
}

export interface IViewData extends Array<IViewDataResponse> {}
