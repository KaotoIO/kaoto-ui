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
  addNewFlow: (dsl: string) => void;
  deleteFlow: (flowId: string) => void;
  deleteAllFlows: () => void;
  setFlowName: (flowId: string, name: string) => void;

  /** General metadata management */
  setMetadata: (name: string, metadata: any) => void;
}

const getInitialState = (previousState: Partial<IFlowsStoreData> = {}): IFlowsStoreData => {
  const flow = FlowsService.getNewFlow(initDsl.name, {
    metadata: { namespace: initialSettings.namespace },
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

          /** Ensure that all the routes are unique... otherwise we would have problems */
          const flowsIdSet = new Set<string>();
          const flowsWithId = flowsWrapper.flows.map((flow) => {
            let id = flow.metadata?.name ?? FlowsService.getNewFlowId();

            if (flowsIdSet.has(id)) {
              id = FlowsService.getNewFlowId();
            }

            const metadata = { ...(flow.metadata ?? {}), name: id };
            const steps = FlowsService.regenerateUuids(id, flow.steps);

            allSteps.push(...steps);
            flowsIdSet.add(id);

            return { ...flow, metadata, id, steps };
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
      addNewFlow: (dsl) => {
        set((state) => {
          const flow = FlowsService.getNewFlow(dsl);
          const flows = state.flows.concat(flow);
          VisualizationService.displaySingleFlow(flow.id);

          return { flows };
        });
      },
      deleteFlow: (flowId) => {
        set((state) => {
          const flows = state.flows.filter((flow) => flowId !== flow.id);

          return { flows };
        });

        VisualizationService.deleteFlowFromVisibleFlows(flowId);
      },
      deleteAllFlows: () => {
        set((state) => {
          return getInitialState({ ...state, flows: [] });
        });

        VisualizationService.removeAllVisibleFlows();
      },
      setFlowName: (flowId, name) => {
        set((state) => {
          const flows = state.flows;
          const integrationIndex = flows.findIndex((integration) => integration.id === flowId);
          if (integrationIndex === -1) {
            return state;
          }

          const flow = {
            ...flows[integrationIndex],
            id: name,
            steps: FlowsService.regenerateUuids(name, flows[integrationIndex].steps),
            metadata: { ...flows[integrationIndex].metadata, name },
          };

          flows.splice(integrationIndex, 1, flow);
          const flowsIds = flows.map((flow) => flow.id);
          VisualizationService.renameVisibleFlow(flowId, name);
          VisualizationService.setVisibleFlows(flowsIds);

          return { flows: flows.slice() };
        });
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
