import { useVisualizationStore } from '../store/visualizationStore';
import { IVisibleFlows, IVisibleFlowsInformation } from '../types';
import { useEffect, useState } from 'react';

/**
 * A custom hook that returns flows visibility information.
 */
export const useFlowsVisibility = () => {
  const visibleFlows = useVisualizationStore((state) => state.visibleFlows);

  const [visibleFlowsInformation, setVisibleFlowsInformation] = useState<IVisibleFlowsInformation>(
    getVisibleFlowsInformation(visibleFlows),
  );

  useEffect(() => {
    setVisibleFlowsInformation(getVisibleFlowsInformation(visibleFlows));
  }, [visibleFlows]);

  return visibleFlowsInformation;
};

function getVisibleFlowsInformation(visibleFlows: IVisibleFlows): IVisibleFlowsInformation {
  const flowsArray = Object.entries(visibleFlows);
  const visibleFlowsIdArray = flowsArray.filter((flow) => flow[1]).map((flow) => flow[0]);

  /** If there's only one flow visible, we return its ID */
  if (visibleFlowsIdArray.length === 1) {
    return {
      singleFlowId: visibleFlowsIdArray[0],
      visibleFlowsCount: 1,
      totalFlowsCount: flowsArray.length,
      isCanvasEmpty: flowsArray.length === 0,
    };
  }

  /**
   * Otherwise, we return undefined to signal the UI that there
   * could be more than one or no flow visible
   */
  return {
    singleFlowId: undefined,
    visibleFlowsCount: visibleFlowsIdArray.length,
    totalFlowsCount: flowsArray.length,
    isCanvasEmpty: visibleFlowsIdArray.length === 0 || flowsArray.length === 0,
  };
}
