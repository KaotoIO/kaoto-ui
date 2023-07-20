import { RequestService } from './requestService';
import { IDsl, IFlowsWrapper, IRawDsl, IStepProps } from '@kaoto/types';

const apiVersion = '/v1';

/**
 * Returns the backend version
 */
export async function fetchBackendVersion(): Promise<string> {
  try {
    const resp = await RequestService.get({
      endpoint: `${apiVersion}/capabilities/version`,
    });

    return await resp.text();
  } catch (err) {
    throw new Error(`Unable to fetch Backend version ${err}`);
  }
}

/**
 * Returns a list of all capabilities, including all
 * domain-specific languages (DSLs)
 */
export async function fetchCapabilities(namespace?: string): Promise<IDsl[]> {
  try {
    const response = await RequestService.get({
      endpoint: `${apiVersion}/capabilities`,
      contentType: 'application/json',
      queryParams: {
        namespace: namespace ?? 'default',
      },
    });

    const payload = await response.json();

    if (!Array.isArray(payload?.dsls) || !payload?.dsls?.length) {
      throw new Error('Invalid response from capabilities endpoint');
    }

    return payload.dsls.map((dsl: IRawDsl) => new IDsl(dsl));
  } catch (err) {
    throw new Error(`Unable to fetch Capabilities ${err}`);
  }
}

export async function fetchDefaultNamespace() {
  try {
    const resp = await RequestService.get({
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
    previousStep?: string;
    followingStep?: string;
  },
  cache?: RequestCache | undefined,
) {
  try {
    if (!queryParams?.previousStep) {
      delete queryParams?.previousStep;
    }
    if (!queryParams?.followingStep) {
      delete queryParams?.followingStep;
    }
    const resp = await RequestService.get({
      endpoint: `${apiVersion}/steps`,
      cache,
      queryParams: {
        ...queryParams,
        namespace: queryParams?.namespace ?? 'default',
      },
    });

    return await resp.json();
  } catch (err) {
    return err;
  }
}

/**
 * Given the list of steps, returns the list of potential
 * DSLs compatible with said list. This is an idempotent operation.
 */
export async function fetchCompatibleDSLs(props: { namespace?: string; steps: IStepProps[] }) {
  try {
    const resp = await RequestService.post({
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
    const resp = await RequestService.get({
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
    const resp = await RequestService.get({
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
  lines?: number,
): Promise<ReadableStream | unknown> {
  try {
    const resp = await RequestService.get({
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
  data: string,
  dsl: string,
  namespace?: string,
): Promise<IFlowsWrapper> {
  const resp = await RequestService.post({
    endpoint: `/v2/integrations`,
    contentType: 'text/yaml',
    body: data,
    queryParams: {
      dsl,
      namespace: namespace ?? 'default',
    },
  });

  return resp.json();
}

/**
 * Returns the source code as a string, typically a Custom Resource in
 * YAML. Usually to update the Code Editor after a change in the integration
 * from the Visualization.
 * Requires a list of all new steps.
 * @param flows
 * @param namespace
 */
export async function fetchIntegrationSourceCode(flowsWrapper: IFlowsWrapper, namespace?: string) {
  try {
    const dsl = flowsWrapper.flows[0]?.dsl;
    const resp = await RequestService.post({
      endpoint: `/v2/integrations?dsl=${dsl}`,
      contentType: 'application/json',
      body: flowsWrapper,
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
 * @todo Fetch this from backend
 * @param dsl
 */
export async function fetchMetadataSchema(dsl: string): Promise<{ [key: string]: any }> {
  if (['Kamelet', 'Camel Route', 'Integration'].includes(dsl)) {
    return Promise.resolve({
      beans: {
        title: 'Beans',
        description: 'Beans Configuration',
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: {
              type: 'string',
              description: 'Bean name',
            },
            type: {
              type: 'string',
              description:
                'What type to use for creating the bean. Can be one of: #class,#type,bean,groovy,joor,language,mvel,ognl. #class or #type then the bean is created via the fully qualified classname, such as #class:com.foo.MyBean The others are scripting languages that gives more power to create the bean with an inlined code in the script section, such as using groovy.',
            },
            properties: {
              type: 'object',
              description: 'Optional properties to set on the created local bean',
            },
          },
          required: ['name', 'type'],
        },
      },
    });
  }
  return Promise.resolve({});
}

export async function fetchStepDetails(id?: string, namespace?: string) {
  try {
    const resp = await RequestService.get({
      endpoint: `${apiVersion}/steps/id/${id}`,
      queryParams: {
        namespace: namespace ?? 'default',
      },
    });

    return resp.json();
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
    const resp = await RequestService.post({
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
  const params = namespace ? `?namespace=${namespace}` : '';
  const resp = await RequestService.post({
    endpoint: `${apiVersion}/deployments/${name.toLowerCase()}${params}`,
    contentType: 'text/yaml',
    body: integrationSource,
  });

  return await resp.text();
}

/**
 * Stops an integration deployment
 * @param deploymentName
 * @param namespace
 */
export async function stopDeployment(deploymentName: string, namespace?: string) {
  const resp = await RequestService.delete({
    endpoint: `${apiVersion}/deployments/${deploymentName.toLowerCase()}`,
    contentType: 'application/json',
    queryParams: { namespace: namespace ?? 'default' },
  });

  return await resp.text();
}
