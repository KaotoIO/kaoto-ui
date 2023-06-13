import { FlowsService } from '../services/FlowsService';
import { NestedStepsService } from '../services/NestedStepsService';
import { VisualizationService } from '../services/visualizationService';
import { useNestedStepsStore } from './nestedStepsStore';
import { initDsl, initialSettings } from './settingsStore';
import { IFlowsWrapper, IIntegration, IStepProps, IViewProps } from '@kaoto/types';
import { setDeepValue } from '@kaoto/utils';
import isEqual from 'lodash.isequal';
import { temporal } from 'zundo';
import { create } from 'zustand';

interface IInsertOptions {
  (flowId: string, newStep: IStepProps, options: { mode: 'append' }): void;
  (flowId: string, newStep: IStepProps, options: { mode: 'insert'; index: number }): void;
  (flowId: string, newStep: IStepProps, options: { mode: 'replace'; index: number }): void;
  (
    flowId: string,
    newStep: IStepProps,
    options: { mode: 'replace'; path: string[] | undefined },
  ): void;
  (
    flowId: string,
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
  deleteStep: (flowId: string, stepUUID: string) => void;
  updateViews: (views: IViewProps[]) => void;
  setFlowsWrapper: (flowsWrapper: IFlowsWrapper) => void;

  /** General flow management */
  addNewFlow: (dsl: string, flowId?: string) => void;
  deleteFlow: (flowId: string) => void;
  deleteAllFlows: () => void;

  setMetadata: (name: string, metadata: any) => void;
}

const getInitialState = (previousState: Partial<IFlowsStoreData> = {}): IFlowsStoreData => {
  const flow = FlowsService.getNewFlow(initDsl.name, undefined, {
    metadata: { name: initialSettings.name, namespace: initialSettings.namespace },
  });
  VisualizationService.displaySingleFlow(flow.id);

  return {
    ...previousState,
    flows: previousState.flows ?? [flow],
    properties: {},
    views: [],
    metadata: {},
  };
};

export const useFlowsStore = create<IFlowsStore>()(
  temporal(
    (set) => ({
      ...getInitialState(),

      insertStep: (flowId, newStep, options) => {
        set((state: IFlowsStore): IFlowsStore => {
          const integrationIndex = state.flows.findIndex(
            (integration) => integration.id === flowId,
          );
          if (integrationIndex === -1) {
            return state;
          }

          newStep.integrationId = flowId;
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

          const stepsWithNewUuids = FlowsService.regenerateUuids(flowId, clonedSteps);
          state.flows[integrationIndex].steps = stepsWithNewUuids;
          state.flows = [...state.flows];
          useNestedStepsStore
            .getState()
            .updateSteps(NestedStepsService.extractNestedSteps(stepsWithNewUuids));

          return { ...state };
        });
      },
      deleteStep: (flowId: string, stepUUID: string) => {
        set((state) => {
          const integrationIndex = state.flows.findIndex(
            (integration) => integration.id === flowId,
          );
          if (integrationIndex === -1) {
            return state;
          }

          const filteredSteps = state.flows[integrationIndex].steps
            .slice()
            .filter((step: IStepProps) => step.UUID !== stepUUID);
          const stepsWithNewUuids = FlowsService.regenerateUuids(flowId, filteredSteps);
          state.flows[integrationIndex].steps = stepsWithNewUuids;
          useNestedStepsStore
            .getState()
            .updateSteps(NestedStepsService.extractNestedSteps(stepsWithNewUuids));

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
            const id = flow.id ?? `${flow.dsl}-${index}`;
            const steps = FlowsService.regenerateUuids(id, flow.steps);
            allSteps.push(...steps);

            return { ...flow, id, steps };
          });

          useNestedStepsStore
            .getState()
            .updateSteps(NestedStepsService.extractNestedSteps(allSteps));

          const flowsIds = flowsWithId.map((flow) => flow.id);
          VisualizationService.setVisibleFlows(flowsIds);

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
          const flow = FlowsService.getNewFlow(dsl, flowId);
          const flows = state.flows.concat(flow);
          VisualizationService.displaySingleFlow(flow.id);

          return { ...state, currentDsl: dsl, flows };
        }),
      deleteFlow: (flowId) =>
        set((state) => {
          const filteredFlows = state.flows.filter((flow) => flowId !== flow.id);
          VisualizationService.deleteFlowFromVisibleFlows(flowId);

          return {
            ...state,
            flows: filteredFlows,
          };
        }),
      deleteAllFlows: () => {
        set((state) => getInitialState({ ...state, flows: [] }));
        VisualizationService.removeAllVisibleFlows();
      },

      setMetadata: (name, metadata) =>
        set((state) => {
          const newMetadata = { ...state.metadata };
          newMetadata[name] = metadata;
          return { ...state, metadata: newMetadata };
        }),
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
