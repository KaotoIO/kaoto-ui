import { IVizStepPropsEdge, IVizStepNode } from '@kaoto/types';
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
  // layout: 'RIGHT', // e.g. RIGHT, DOWN
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
}));

export default useVisualizationStore;
