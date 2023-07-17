export interface IVisibleFlowsInformation {
  singleFlowId: string | undefined;
  visibleFlowsCount: number;
  totalFlowsCount: number;
  isCanvasEmpty: boolean;
}

export type IVisibleFlows = Record<string, boolean>;
