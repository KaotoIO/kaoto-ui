import { IStepProps } from '../types';
import request from './request';

export function deleteIntegration(name: string) {
  return request.delete({
    endpoint: `/integrations/${name}`,
    contentType: 'application/json',
  });
}

/**
 * Update the integration from the Visualization. Requires a list of all new steps.
 * @param newSteps
 */
export async function updateIntegrationFromViz(newSteps: IStepProps[]) {
  try {
    const resp = await request.post({
      endpoint: '/integrations/customResource',
      contentType: 'application/json',
      body: { name: 'Updated integration', steps: newSteps, views: [] },
    });

    return await resp.text();
  } catch (err) {
    return console.error(err);
  }
}

/**
 * Update the integration from the YAML Editor.
 * @param newYAML
 */
export async function updateYAML(newYAML: string) {
  try {
    const resp = await request.post({
      endpoint: '/viewdefinition',
      contentType: 'text/yaml',
      body: newYAML,
    });

    return await resp.json();
  } catch (err) {
    console.error(err);
  }
}
