import { IStepProps } from '../types';
import { Edge, Node, OnNodesChange, OnEdgesChange, OnConnect } from 'react-flow-renderer';
export declare type RFState = {
    nodes: Node<IStepProps>[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    setEdges: (newEdges: Edge[]) => void;
    setNodes: (newNodes: Node<IStepProps>[]) => void;
};
export declare const useVisualizationStore: import("zustand").UseBoundStore<import("zustand").StoreApi<RFState>>;
