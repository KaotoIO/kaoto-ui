import { IIntegration, IStepProps } from '../types';
/**
 * Returns a list of all capabilities, including all
 * domain-specific languages (DSLs)
 * Returns { dsls: { [val: string]: string }[] }
 */
export declare function fetchCapabilities(namespace?: string): Promise<any>;
/**
 * Fetch all Catalog Steps, optionally with specified query params
 * @param queryParams
 * @param cache
 */
export declare function fetchCatalogSteps(queryParams?: {
    dsl?: string;
    kind?: string;
    type?: string;
    namespace?: string;
}, cache?: RequestCache | undefined): Promise<any>;
/**
 * Given the list of steps, returns the list of potential
 * DSLs compatible with said list. This is an idempotent operation.
 */
export declare function fetchCompatibleDSLs(props: {
    namespace?: string;
    steps: IStepProps[];
}): Promise<any>;
/**
 * Fetches a single deployment CRD, optionally for a specific namespace
 * @param name
 * @param namespace
 */
export declare function fetchDeployment(name: string, namespace?: string): Promise<string | unknown>;
/**
 * Fetches all deployments, optionally for a specific namespace
 * @param cache
 * @param namespace
 */
export declare function fetchDeployments(cache?: RequestCache | undefined, namespace?: string): Promise<any>;
/**
 * Fetches a single deployment's logs, optionally for a specific namespace and a specific number of lines
 * @param name
 * @param namespace
 * @param lines
 */
export declare function fetchDeploymentLogs(name: string, namespace?: string, lines?: number): Promise<ReadableStream | unknown>;
/**
 * Returns integration in JSON, or type @IIntegration
 * Accepts YAML or steps as type IStepProps[].
 * Typically, used after updating the integration from the YAML Editor,
 * or for step replacement that requires an updated array of views.
 * YAML Custom Resource, but doesn't have to be.
 * @param data
 * @param dsl - The DSL that is being used across Kaoto
 * @param namespace
 */
export declare function fetchIntegrationJson(data: string | IStepProps[], dsl: string, namespace?: string): Promise<any>;
/**
 * Returns the source code as a string, typically a Custom Resource in
 * YAML. Usually to update the Code Editor after a change in the integration
 * from the Visualization.
 * Requires a list of all new steps.
 * @param newIntegration
 * @param namespace
 */
export declare function fetchIntegrationSourceCode(newIntegration: IIntegration, namespace?: string): Promise<any>;
/**
 * Returns views, or step extensions (JSON).
 * Typically, used after updating the integration from the YAML Editor,
 * or for step replacement that requires an updated array of views.
 * Accepts an integration's source code (string) or JSON.
 * @param data
 * @param namespace
 */
export declare function fetchViews(data: IStepProps[], namespace?: string): Promise<any>;
/**
 * Starts an integration deployment
 * @param integrationSource
 * @param name
 * @param namespace
 */
export declare function startDeployment(integrationSource: string, name: string, namespace?: string): Promise<string>;
/**
 * Stops an integration deployment
 * @param name
 * @param namespace
 */
export declare function stopDeployment(name: string, namespace?: string): Promise<string>;
