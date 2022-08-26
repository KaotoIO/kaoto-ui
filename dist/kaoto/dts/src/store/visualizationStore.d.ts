import { IVizStepPropsEdge, IVizStepPropsNode } from '../types';
import { OnNodesChange, OnEdgesChange, OnConnect } from 'react-flow-renderer';
export declare type RFState = {
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
export declare const useVisualizationStore: import("zustand").UseBoundStore<import("zustand").StoreApi<RFState>>;
export default useVisualizationStore;
