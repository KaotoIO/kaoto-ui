/// <reference types="react" />
import './PlusButtonEdge.css';
import { Position } from 'react-flow-renderer';
export interface IPlusButtonEdge {
    id: string;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    sourcePosition: Position | undefined;
    targetPosition: Position | undefined;
    style?: any;
    markerEnd?: string;
}
declare const PlusButtonEdge: ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, }: IPlusButtonEdge) => JSX.Element;
export { PlusButtonEdge };
