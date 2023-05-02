import { mountStoreDevtool } from 'simple-zustand-devtools';
import { useDeploymentStore } from './deploymentStore';
import { flowsStore } from './flowsStore';
import { useIntegrationJsonStore } from './integrationJsonStore';
import { useIntegrationSourceStore } from './integrationSourceStore';
import { useNestedStepsStore } from './nestedStepsStore';
import { useSettingsStore } from './settingsStore';
import { useStepCatalogStore } from './stepCatalogStore';
import { useVisualizationStore } from './visualizationStore';

if (process.env.NODE_ENV === 'development') {
  mountStoreDevtool('deploymentStore', useDeploymentStore);
  mountStoreDevtool('flowsStore', flowsStore);
  mountStoreDevtool('integrationJsonStore', useIntegrationJsonStore);
  mountStoreDevtool('integrationSourceStore', useIntegrationSourceStore);
  mountStoreDevtool('nestedStepsStore', useNestedStepsStore);
  mountStoreDevtool('settingsStore', useSettingsStore);
  mountStoreDevtool('stepCatalogStore', useStepCatalogStore);
  mountStoreDevtool('visualizationStore', useVisualizationStore);
}

export * from './deploymentStore';
export * from './flowsStore';
export * from './integrationJsonStore';
export * from './integrationSourceStore';
export * from './nestedStepsStore';
export * from './settingsStore';
export * from './stepCatalogStore';
export * from './visualizationStore';
