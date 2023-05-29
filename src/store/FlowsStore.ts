import { useNestedStepsStore } from './nestedStepsStore';
import { initDsl, initialSettings } from './settingsStore';
import { FlowsService, StepsService } from '@kaoto/services';
import { IFlowsWrapper, IIntegration, IStepProps, IViewProps } from '@kaoto/types';
import { setDeepValue } from '@kaoto/utils';
import isEqual from 'lodash.isequal';
import { temporal } from 'zundo';
import { create } from 'zustand';

interface IInsertOptions {
  (integrationId: string, newStep: IStepProps, options: { mode: 'append' }): void;
  (integrationId: string, newStep: IStepProps, options: { mode: 'insert'; index: number }): void;
  (integrationId: string, newStep: IStepProps, options: { mode: 'replace'; index: number }): void;
  (
    integrationId: string,
    newStep: IStepProps,
    options: { mode: 'replace'; path: string[] | undefined },
  ): void;
  (
    integrationId: string,
    newStep: IStepProps,
    options: { mode: 'append' | 'insert' | 'replace'; index: number; path: string[] | undefined },
  ): void;
}

export interface IFlowsStoreData {
  flows: IIntegration[];
  properties: Record<string, unknown>;
  views: IViewProps[];
  metadata: Record<string, unknown>;
}

export interface IFlowsStore extends IFlowsStoreData {
  insertStep: IInsertOptions;
  deleteStep: (integrationId: string, stepUUID: string) => void;
  updateViews: (views: IViewProps[]) => void;
  setFlowsWrapper: (flowsWrapper: IFlowsWrapper) => void;

  /** General flow management */
  addNewFlow: (dsl: string, flowId?: string) => void;
  deleteAllFlows: () => void;
}

export const getInitialState = (previousState: Partial<IFlowsStoreData> = {}): IFlowsStoreData => {
  return {
    ...previousState,
    flows: previousState.flows ?? [
      FlowsService.getNewFlow(initDsl.name, undefined, {
        metadata: { name: initialSettings.name, namespace: initialSettings.namespace },
      }),
    ],
    properties: {},
    views: [],
    metadata: {},
  };
};

export const useFlowsStore = create<IFlowsStore>()(
  temporal(
    (set) => ({
      ...getInitialState(),

      insertStep: (integrationId, newStep, options) => {
        set((state: IFlowsStore): IFlowsStore => {
          const integrationIndex = state.flows.findIndex(
            (integration) => integration.id === integrationId,
          );
          if (integrationIndex === -1) {
            return state;
          }

          newStep.integrationId = integrationId;
          const clonedSteps = state.flows[integrationIndex].steps.slice();

          switch (options.mode) {
            case 'append':
              clonedSteps.push(newStep);
              break;

            case 'insert':
              clonedSteps.splice(options.index, 0, newStep);
              break;

            case 'replace':
              if ('path' in options) {
                setDeepValue(clonedSteps, options.path, newStep);
                break;
              }

              clonedSteps.splice(options.index, 1, newStep);
          }

          const stepsWithNewUuids = StepsService.regenerateUuids(integrationId, clonedSteps);
          state.flows[integrationIndex].steps = stepsWithNewUuids;
          state.flows = [...state.flows];
          useNestedStepsStore
            .getState()
            .updateSteps(StepsService.extractNestedSteps(stepsWithNewUuids));

          return { ...state };
        });
      },
      deleteStep: (integrationId: string, stepUUID: string) => {
        set((state) => {
          const integrationIndex = state.flows.findIndex(
            (integration) => integration.id === integrationId,
          );
          if (integrationIndex === -1) {
            return { ...state };
          }

          const filteredSteps = state.flows[integrationIndex].steps
            .slice()
            .filter((step: IStepProps) => step.UUID !== stepUUID);
          const stepsWithNewUuids = StepsService.regenerateUuids(integrationId, filteredSteps);
          state.flows[integrationIndex].steps = stepsWithNewUuids;
          useNestedStepsStore
            .getState()
            .updateSteps(StepsService.extractNestedSteps(stepsWithNewUuids));

          return { ...state, flows: [...state.flows] };
        });
      },
      updateViews: (views: IViewProps[]) => {
        set({ views });
      },
      setFlowsWrapper: (flowsWrapper) => {
        set((state) => {
          let allSteps: IStepProps[] = [];

          /**
           * TODO: Temporarily assign IDs to each flows and steps
           * This is needed until https://github.com/KaotoIO/kaoto-backend/issues/663 it's done
           */
          const flowsWithId = flowsWrapper.flows.map((flow, index) => {
            const id = `${flow.dsl}-${index}`;
            const steps = StepsService.regenerateUuids(id, flow.steps);
            allSteps.push(...steps);

            return { ...flow, id, steps };
          });

          useNestedStepsStore.getState().updateSteps(StepsService.extractNestedSteps(allSteps));

          return {
            ...state,
            flows: flowsWithId,
            properties: flowsWrapper.properties,
            metadata: flowsWrapper.metadata,
          };
        });
      },

      /** General flow management */
      addNewFlow: (dsl, flowId) =>
        set((state) => {
          const flows = state.flows.concat(FlowsService.getNewFlow(dsl, flowId));

          return { ...state, currentDsl: dsl, flows };
        }),
      deleteAllFlows: () => set((state) => getInitialState({ ...state, flows: [] })),
    }),
    {
      partialize: (state) => {
        const { flows } = state;
        return { flows };
      },
      equality: (a, b) => isEqual(a, b),
    },
  ),
);
