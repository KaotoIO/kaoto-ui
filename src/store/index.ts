import { useDeploymentStore } from './deploymentStore';
import { useFlowsStore } from './flowsStore';
import { useIntegrationJsonStore } from './integrationJsonStore';
import { useIntegrationSourceStore } from './integrationSourceStore';
import { useNestedStepsStore } from './nestedStepsStore';
import { useSettingsStore } from './settingsStore';
import { useVisualizationStore } from './visualizationStore';
import { mountStoreDevtool } from 'simple-zustand-devtools';

if (process.env.NODE_ENV === 'development') {
  mountStoreDevtool('deploymentStore', useDeploymentStore);
  mountStoreDevtool('flowsStore', useFlowsStore);
  mountStoreDevtool('integrationJsonStore', useIntegrationJsonStore);
  mountStoreDevtool('integrationSourceStore', useIntegrationSourceStore);
  mountStoreDevtool('nestedStepsStore', useNestedStepsStore);
  mountStoreDevtool('settingsStore', useSettingsStore);
  mountStoreDevtool('visualizationStore', useVisualizationStore);
}

export * from './deploymentStore';
export * from './flowsStore';
export * from './integrationJsonStore';
export * from './integrationSourceStore';
export * from './nestedStepsStore';
export * from './settingsStore';
export * from './visualizationStore';
