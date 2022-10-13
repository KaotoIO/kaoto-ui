import request from './request';
import { IIntegration, IStepProps } from '@kaoto/types';

const apiVersion = '/v1';

/**
 * Returns a list of all capabilities, including all
 * domain-specific languages (DSLs)
 * Returns { dsls: { [val: string]: string }[] }
 */
export async function fetchCapabilities(namespace?: string) {
  try {
    const resp = await request.get({
      endpoint: `${apiVersion}/capabilities`,
      contentType: 'application/json',
      queryParams: {
        namespace: namespace ?? 'default',
      },
    });

    return await resp.json();
  } catch (err) {
    return err;
  }
}

export async function fetchDefaultNamespace() {
  try {
    const resp = await request.get({
      endpoint: `${apiVersion}/capabilities/namespace`,
      contentType: 'application/json',
    });
    return await resp.json();
  } catch (err) {
    return err;
  }
}

/**
 * Fetch all Catalog Steps, optionally with specified query params
 * @param queryParams
 * @param cache
 */
export async function fetchCatalogSteps(
  queryParams?: {
    // e.g. 'KameletBinding'
    dsl?: string;
    // e.g. 'Kamelet'
    kind?: string;
    // e.g. 'START', 'END', 'MIDDLE'
    type?: string;
    namespace?: string;
  },
  cache?: RequestCache | undefined
) {
  try {
    const resp = await request.get({
      endpoint: `${apiVersion}/steps`,
      cache,
      queryParams: {
        ...queryParams,
        namespace: queryParams?.namespace ?? 'default',
      },
    });

    return await resp.json();
  } catch (err) {
    console.error(err);
    return err;
  }
}

/**
 * Given the list of steps, returns the list of potential
 * DSLs compatible with said list. This is an idempotent operation.
 */
export async function fetchCompatibleDSLs(props: { namespace?: string; steps: IStepProps[] }) {
  try {
    const resp = await request.post({
      endpoint: `${apiVersion}/integrations/dsls`,
      contentType: 'application/json',
      body: props.steps,
      queryParams: {
        namespace: props.namespace ?? 'default',
      },
    });

    return await resp.json();
  } catch (err) {
    return err;
  }
}

/**
 * Fetches a single deployment CRD, optionally for a specific namespace
 * @param name
 * @param namespace
 */
export async function fetchDeployment(name: string, namespace?: string): Promise<string | unknown> {
  try {
    const resp = await request.get({
      endpoint: `${apiVersion}/deployment/${name}`,
      contentType: 'application/json',
      queryParams: {
        namespace: namespace ?? 'default',
      },
    });

    return await resp.text();
  } catch (err) {
    return err;
  }
}

/**
 * Fetches all deployments, optionally for a specific namespace
 * @param cache
 * @param namespace
 */
export async function fetchDeployments(cache?: RequestCache | undefined, namespace?: string) {
  try {
    const resp = await request.get({
      endpoint: `${apiVersion}/deployments`,
      contentType: 'application/json',
      cache,
      queryParams: {
        namespace: namespace ?? 'default',
      },
    });

    return await resp.json();
  } catch (err) {
    return err;
  }
}

/**
 * Fetches a single deployment's logs, optionally for a specific namespace and a specific number of lines
 * @param name
 * @param namespace
 * @param lines
 */
export async function fetchDeploymentLogs(
  name: string,
  namespace?: string,
  lines?: number
): Promise<ReadableStream | unknown> {
  try {
    const resp = await request.get({
      endpoint: `${apiVersion}/deployments/${name}/logs`,
      contentType: 'application/json',
      queryParams: {
        namespace: namespace ?? 'default',
        lines,
      },
    });

    return await resp.body;
  } catch (err) {
    return err;
  }
}

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
export async function fetchIntegrationJson(
  data: string | IStepProps[],
  dsl: string,
  namespace?: string
) {
  try {
    const resp = await request.post({
      endpoint: `${apiVersion}/integrations`,
      contentType: typeof data === 'string' ? 'text/yaml' : 'application/json',
      body: typeof data === 'string' ? data : { steps: data },
      queryParams: {
        dsl,
        namespace: namespace ?? 'default',
      },
    });

    return await resp.json();
  } catch (err) {
    console.error(err);
    return err;
  }
}

/**
 * Returns the source code as a string, typically a Custom Resource in
 * YAML. Usually to update the Code Editor after a change in the integration
 * from the Visualization.
 * Requires a list of all new steps.
 * @param newIntegration
 * @param namespace
 */
export async function fetchIntegrationSourceCode(newIntegration: IIntegration, namespace?: string) {
  try {
    const resp = await request.post({
      endpoint: `${apiVersion}/integrations?dsl=${newIntegration.metadata.dsl.name}`,
      contentType: 'application/json',
      body: newIntegration,
      queryParams: {
        namespace: namespace ?? 'default',
      },
    });

    return await resp.text();
  } catch (err) {
    return err;
  }
}

/**
 * Returns views, or step extensions (JSON).
 * Typically, used after updating the integration from the YAML Editor,
 * or for step replacement that requires an updated array of views.
 * Accepts an integration's source code (string) or JSON.
 * @param data
 * @param namespace
 */
export async function fetchViews(data: IStepProps[], namespace?: string) {
  try {
    const resp = await request.post({
      endpoint: `${apiVersion}/view-definitions`,
      contentType: 'application/json',
      body: data,
      queryParams: {
        namespace: namespace ?? 'default',
      },
    });

    return await resp.json();
  } catch (err) {
    console.error(err);
    return err;
  }
}

/**
 * Starts an integration deployment
 * @param integrationSource
 * @param name
 * @param namespace
 */
export async function startDeployment(integrationSource: string, name: string, namespace?: string) {
  try {
    const params = namespace ? `?namespace=${namespace}` : '';
    const resp = await request.post({
      endpoint: `${apiVersion}/deployments/${name.toLowerCase()}${params}`,
      contentType: 'text/yaml',
      body: integrationSource,
    });

    return await resp.text();
  } catch (err) {
    throw err;
  }
}

/**
 * Stops an integration deployment
 * @param name
 * @param namespace
 */
export async function stopDeployment(name: string, namespace?: string) {
  try {
    const resp = await request.delete({
      endpoint: `${apiVersion}/deployments/${name.toLowerCase()}`,
      contentType: 'application/json',
      queryParams: { namespace: namespace ?? 'default' },
    });

    return await resp.text();
  } catch (err) {
    throw err;
  }
}
