import { IVizStepPropsEdge, IVizStepPropsNode } from '../types';
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
} from 'react-flow-renderer';
import create from 'zustand';

export type RFState = {
  deleteNode: (nodeIndex: number) => void;
  nodes: IVizStepPropsNode[];
  edges: IVizStepPropsEdge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setEdges: (newEdges: IVizStepPropsEdge[]) => void;
  setNodes: (newNodes: IVizStepPropsNode[]) => void;
  /**
   * Update one single node
   * @param nodeToUpdate
   */
  updateNode: (nodeToUpdate: IVizStepPropsNode, nodeIndex: number) => void;
};

// this is our useStore hook that we can use in our components to get parts of the store and call actions
export const useVisualizationStore = create<RFState>((set, get) => ({
  nodes: [],
  edges: [],
  deleteNode: (nodeIndex: number) =>
    set((state) => ({
      nodes: [...state.nodes.filter((_n, idx) => idx !== nodeIndex)],
    })),
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
  setEdges: (newEdges: IVizStepPropsEdge[]) =>
    set({
      edges: [...newEdges],
    }),
  setNodes: (newNodes: IVizStepPropsNode[]) =>
    set({
      nodes: [...newNodes],
    }),
  updateNode: (newNode: IVizStepPropsNode, nodeIndex: number) => {
    let newNodes = get().nodes.slice();
    newNodes[nodeIndex] = newNode;
    set(() => ({ nodes: newNodes }));
  },
}));

export default useVisualizationStore;
