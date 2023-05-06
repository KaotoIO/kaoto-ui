import { StepsService } from '@kaoto/services';
import { IIntegration, IStepProps, IViewProps } from '@kaoto/types';
import isEqual from 'lodash.isequal';
import { temporal } from 'zundo';
import { create } from 'zustand';
import { initialFlows } from '../stubs';
import { useNestedStepsStore } from './nestedStepsStore';
import { initDsl, initialSettings } from './settingsStore';

export interface IFlowsStore {
  // Data
  flows: IIntegration[];
  properties: Record<string, unknown>;
  views: IViewProps[];

  // Handler methods
  appendStep: (integrationId: string, newStep: IStepProps) => void;
  deleteStep: (integrationId: string, stepUUID: string) => void;
}

export const flowsInitialState: Pick<IFlowsStore, 'flows' | 'properties' | 'views'> = {
  flows: [{
    id: `${initDsl.name}-1`,
    dsl: initDsl.name,
    metadata: { name: initialSettings.name, namespace: initialSettings.namespace },
    steps: [],
    params: [],
  }],
  properties: {},
  views: [],
};

/**
 * This store has duplicated code as we can see on
 * how are we dealing with regenerating UUIDs and setting
 * them in the correspondig integration.
 *
 * The goal is to have a working version first to include
 * support for multiple routes and then make another pass
 * to clean the duplication and hopefully get a smaller
 * API for the consumers
 */
export const useFlowsStore = create<IFlowsStore>()(
  temporal(
    (set) => ({
      ...flowsInitialState,

      /**
       * Overriding the default route for demo purposes
       * To be removed once the final feature is complete
       */
      ...{ flows: initialFlows },

      appendStep: (integrationId, newStep) => {
        set((state: IFlowsStore): IFlowsStore => {
          const integrationIndex = state.flows.findIndex((integration) => integration.id === integrationId);
          if (integrationIndex === -1) {
            return state;
          }

          newStep.integrationId = integrationId;
          const clonedSteps = state.flows[integrationIndex].steps.slice();
          clonedSteps.push(newStep);
          const stepsWithNewUuids = StepsService.regenerateUuids(clonedSteps, `${integrationId}|`);
          state.flows[integrationIndex].steps = stepsWithNewUuids;
          useNestedStepsStore.getState().updateSteps(StepsService.extractNestedSteps(stepsWithNewUuids));

          return state;
        });
      },
      deleteStep: (integrationId: string, stepUUID: string) => {
        set((state) => {
          const integrationIndex = state.flows.findIndex((integration) => integration.id === integrationId);
          if (integrationIndex === -1) {
            return state;
          }

          const filteredSteps = state.flows[integrationIndex].steps.slice().filter((step: IStepProps) => step.UUID !== stepUUID);
          const stepsWithNewUuids = StepsService.regenerateUuids(filteredSteps, `${integrationId}|`);
          state.flows[integrationIndex].steps = stepsWithNewUuids;
          useNestedStepsStore.getState().updateSteps(StepsService.extractNestedSteps(stepsWithNewUuids));

          return state;
        });
      },
    }),
    {
      partialize: (state) => {
        const { flows: integrations } = state;
        return { integrations };
      },
      equality: (a, b) => isEqual(a, b),
    }
  )
);
