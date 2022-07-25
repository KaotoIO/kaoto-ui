import { IStepProps } from '../types';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
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
  nodes: Node<IStepProps>[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setEdges: (newEdges: Edge[]) => void;
  setNodes: (newNodes: Node<IStepProps>[]) => void;
};

// this is our useStore hook that we can use in our components to get parts of the store and call actions
export const useVisualizationStore = create<RFState>((set) => ({
  nodes: [],
  edges: [],
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
  setEdges: (newEdges: Edge[]) =>
    set({
      edges: [...newEdges],
    }),
  setNodes: (newNodes: Node<IStepProps>[]) =>
    set({
      nodes: [...newNodes],
    }),
}));
