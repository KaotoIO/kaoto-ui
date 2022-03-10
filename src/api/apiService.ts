import { IStepProps } from '../types';
import request from './request';

export async function fetchCatalogSteps(queryParams?: {
  // e.g. 'KameletBinding'
  integrationType?: string;
  // e.g. 'Kamelet'
  kind?: string;
  // e.g. 'START', 'END', 'MIDDLE'
  type?: string;
}) {
  try {
    const resp = await request.get({
      endpoint: '/step',
      queryParams,
    });

    return await resp.json();
  } catch (err) {
    console.error(err);
    return err;
  }
}

/**
 * Returns the custom resource (YAML).
 * Usually to update the YAML after a change in the integration from the Visualization.
 * Requires a list of all new steps.
 * @param newSteps
 */
export async function fetchCustomResource(newSteps: IStepProps[]) {
  try {
    const resp = await request.post({
      endpoint: '/integrations/customResource',
      contentType: 'application/json',
      body: { name: 'Updated integration', steps: newSteps },
    });

    return await resp.text();
  } catch (err) {
    return err;
  }
}

/**
 * Returns view definitions (JSON).
 * Typically used after updating the integration from the YAML Editor,
 * or for step replacement that requires an updated array of views.
 * Accepts YAML or steps as type IStepProps[].
 * @param data
 */
export async function fetchViewDefinitions(data: string | IStepProps[]) {
  try {
    const resp = await request.post({
      endpoint: '/viewdefinition',
      contentType: typeof data === 'string' ? 'text/yaml' : 'application/json',
      body: data,
    });

    return await resp.json();
  } catch (err) {
    console.error(err);
    return err;
  }
}
