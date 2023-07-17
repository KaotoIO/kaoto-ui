import { useFlowsStore } from './FlowsStore';
import { useDeploymentStore } from './deploymentStore';
import { useIntegrationSourceStore } from './integrationSourceStore';
import { useNestedStepsStore } from './nestedStepsStore';
import { useSettingsStore } from './settingsStore';
import { useVisualizationStore } from './visualizationStore';
import { mountStoreDevtool } from 'simple-zustand-devtools';

let isDevMode = false;
try {
  isDevMode = NODE_ENV === 'development';
} catch (error) {
  console.info('NODE_ENV is not defined');
}

if (isDevMode) {
  mountStoreDevtool('deploymentStore', useDeploymentStore);
  mountStoreDevtool('flowsStore', useFlowsStore);
  mountStoreDevtool('integrationSourceStore', useIntegrationSourceStore);
  mountStoreDevtool('nestedStepsStore', useNestedStepsStore);
  mountStoreDevtool('settingsStore', useSettingsStore);
  mountStoreDevtool('visualizationStore', useVisualizationStore);
}

export * from './deploymentStore';
export * from './FlowsStore';
export * from './FlowsStoreFacade';
export * from './integrationSourceStore';
export * from './nestedStepsStore';
export * from './settingsStore';
export * from './visualizationStore';
