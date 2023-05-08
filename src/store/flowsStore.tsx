import { StepsService } from '@kaoto/services';
import { IIntegration, IStepProps, IViewProps } from '@kaoto/types';
import { setDeepValue } from '@kaoto/utils';
import isEqual from 'lodash.isequal';
import { temporal } from 'zundo';
import { create } from 'zustand';
import { initialFlows } from '../stubs';
import { useNestedStepsStore } from './nestedStepsStore';
import { initDsl, initialSettings } from './settingsStore';

interface IInsertOptions {
  (integrationId: string, newStep: IStepProps, options: { mode: 'append' }): void;
  (integrationId: string, newStep: IStepProps, options: { mode: 'insert', index: number }): void;
  (integrationId: string, newStep: IStepProps, options: { mode: 'replace', index: number }): void;
  (integrationId: string, newStep: IStepProps, options: { mode: 'replace', path: string[] }): void;
  (integrationId: string, newStep: IStepProps, options: { mode: 'replace', index?: number, path?: string[] }): void;
  (integrationId: string, newStep: IStepProps, options: { mode: 'append' | 'insert' | 'replace'; index: number, path: string[] }): void;
}

export interface IFlowsStore {
  // Data
  flows: IIntegration[];
  properties: Record<string, unknown>;
  views: IViewProps[];

  // Handler methods
  insertStep: IInsertOptions;
  deleteStep: (integrationId: string, stepUUID: string) => void;
  deleteAllIntegrations: () => void;
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
 * support for multiple flows and then make another pass
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

      insertStep: (integrationId, newStep, options) => {
        set((state: IFlowsStore): IFlowsStore => {
          const integrationIndex = state.flows.findIndex((integration) => integration.id === integrationId);
          if (integrationIndex === -1) {
            return state;
          }

          newStep.integrationId = integrationId;
          const clonedSteps = state.flows[integrationIndex].steps.slice();

          switch(options.mode) {
            case 'append':
              clonedSteps.push(newStep);
              break;

            case 'insert':
              clonedSteps.splice(options.index, 0, newStep);
              break;

            case 'replace':
              if ((options as any).path) {
                setDeepValue(clonedSteps, (options as any).path, newStep);
                break;
              }

              clonedSteps.splice((options as any).index, 1, newStep);
          }

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
      deleteAllIntegrations: () => set((state) => ({ ...state, ...flowsInitialState })),
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
