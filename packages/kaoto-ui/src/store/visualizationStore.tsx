import { IVizStepPropsEdge, IVizStepNode, IVisibleFlows } from '@kaoto/types';
import {
  Connection,
  EdgeChange,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import { create } from 'zustand';

export type RFState = {
  deleteNode: (nodeIndex: number) => void;
  nodes: IVizStepNode[];
  edges: IVizStepPropsEdge[];
  hoverStepUuid: string;
  layout: string;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  selectedStepUuid: string;
  setEdges: (newEdges: IVizStepPropsEdge[]) => void;
  setHoverStepUuid: (stepUuid: string) => void;
  setSelectedStepUuid: (stepUuid: string) => void;
  setLayout: (newLayout: string) => void;
  setNodes: (newNodes: IVizStepNode[]) => void;
  /**
   * Update one single node
   * @param nodeToUpdate
   */
  updateNode: (nodeToUpdate: IVizStepNode, nodeIndex: number) => void;

  /** Visibility related handlers */
  visibleFlows: IVisibleFlows;
  toggleFlowVisible: (flowId: string, isVisible?: boolean) => void;
  showAllFlows: () => void;
  hideAllFlows: () => void;
  setVisibleFlows: (flows: IVisibleFlows) => void;
};

// this is our useStore hook that we can use in our components to get parts of the store and call actions
export const useVisualizationStore = create<RFState>((set, get) => ({
  nodes: [],
  edges: [],
  deleteNode: (nodeIndex: number) =>
    set((state) => ({
      nodes: [...state.nodes.filter((_n, idx) => idx !== nodeIndex)],
    })),
  hoverStepUuid: '',
  layout: 'LR', // e.g. LR, TB
  onNodesChange: (changes: NodeChange[]) =>
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    })),
  onEdgesChange: (changes: EdgeChange[]) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    })),
  onConnect: (connection: Connection) => {
    set((state) => ({
      edges: addEdge(connection, state.edges),
    }));
  },
  selectedStepUuid: '',
  setEdges: (newEdges: IVizStepPropsEdge[]) =>
    set({
      edges: [...newEdges],
    }),
  setHoverStepUuid: (stepUuid: string) => set({ hoverStepUuid: stepUuid }),
  setSelectedStepUuid: (stepUuid: string) => set({ selectedStepUuid: stepUuid }),
  setLayout: (newLayout: string) => set({ layout: newLayout }),
  setNodes: (newNodes: IVizStepNode[]) =>
    set({
      nodes: [...newNodes],
    }),
  updateNode: (newNode: IVizStepNode, nodeIndex: number) => {
    let newNodes = get().nodes.slice();
    newNodes[nodeIndex] = newNode;
    set(() => ({ nodes: newNodes }));
  },

  /** Visibility related handlers */
  visibleFlows: {},
  toggleFlowVisible: (flowId, isVisible) => {
    set(({ visibleFlows }) => {
      const currentVisibility = !!visibleFlows[flowId];
      const isFlowVisible = isVisible === undefined ? !currentVisibility : isVisible;

      return {
        visibleFlows: { ...visibleFlows, [flowId]: isFlowVisible },
      };
    });
  },
  showAllFlows: () => {
    set(({ visibleFlows }) => ({
      visibleFlows: toggleFlowsVisibility(visibleFlows, true),
    }));
  },
  hideAllFlows: () => {
    set(({ visibleFlows }) => ({
      visibleFlows: toggleFlowsVisibility(visibleFlows, false),
    }));
  },
  setVisibleFlows: (visibleFlows) => {
    set(() => ({
      visibleFlows,
    }));
  },
}));

/**
 * TODO: The following function should be moved
 * to the VisualizationService, the problem at the
 * moment is that VisualizationService should be split
 * into a service that doesn't import the VisualizationStore
 * and a VisualizationFacade which does.
 *
 * This will prevent the circular dependency created by
 * importing the Store into the service and the other way around
 */
const toggleFlowsVisibility = (visibleFlows: IVisibleFlows, isVisible: boolean): IVisibleFlows =>
  Object.keys(visibleFlows).reduce((acc, flowId) => {
    acc[flowId] = isVisible;
    return acc;
  }, {} as IVisibleFlows);
