import { IStepProps } from '../types';
import request from './request';

export async function fetchCatalogSteps(queryParams?: {
  // e.g. 'KameletBinding'
  dsl?: string;
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
 * Returns a list of all domain-specific languages (DSLs)
 */
export async function fetchAllDSLs() {
  try {
    const resp = await request.get({
      endpoint: '/languages',
      contentType: 'application/json',
    });

    return await resp.json();
  } catch (err) {
    return err;
  }
}

/**
 * Returns a list of domain-specific languages (DSLs) compatible
 * with existing steps. Will also include the respective YAML/CRD
 * for each compatible DSL.
 */
export async function fetchCompatibleDSLsAndCRDs(props: { type?: string; steps: IStepProps[] }) {
  try {
    const resp = await request.post({
      endpoint: '/integrations/customResources?type=' + props.type,
      contentType: 'application/json',
      body: { name: 'Updated integration', steps: props.steps },
    });

    return await resp.json();
  } catch (err) {
    return err;
  }
}

export async function fetchDeployments() {
  try {
    const resp = await request.get({
      endpoint: '/integrations',
      contentType: 'application/json',
    });

    return await resp.json();
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

export async function startDeployment(integration: any) {
  try {
    const resp = await request.post({
      endpoint: '/integrations',
      contentType: 'application/json',
      body: integration,
    });

    return await resp.text();
  } catch (err) {
    return err;
  }
}

export async function stopDeployment(integration: any) {
  try {
    const resp = await request.delete({
      endpoint: '/integrations',
      contentType: 'application/json',
      body: integration,
    });

    return await resp.text();
  } catch (err) {
    return err;
  }
}
