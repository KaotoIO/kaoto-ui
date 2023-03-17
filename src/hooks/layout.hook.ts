import { useVisualizationStore } from '@kaoto/store';
import { useEffect, useState } from 'react';
import { Position } from 'reactflow';

export const useLayout = () => {
  const layout = useVisualizationStore((state) => state.layout);
  const [plusIconPosition, setPlusIconPosition] = useState(layout === 'LR' ? Position.Top : Position.Right);
  const [minusIconPosition, setMinusIconPosition] = useState(layout === 'LR' ? Position.Top : Position.Left);

  const [leftHandlePosition, setLeftHandlePosition] = useState(layout === 'LR' ? Position.Left : Position.Top);
  const [rightHandlePosition, setRightHandlePosition] = useState(layout === 'LR' ? Position.Right : Position.Bottom);

  useEffect(() => {
    setPlusIconPosition(layout === 'LR' ? Position.Top : Position.Right);
    setMinusIconPosition(layout === 'LR' ? Position.Top : Position.Left);

    setLeftHandlePosition(layout === 'LR' ? Position.Left : Position.Top);
    setRightHandlePosition(layout === 'LR' ? Position.Right : Position.Bottom);
  }, [layout]);

  return {
    layout,
    plusIconPosition,
    minusIconPosition,
    leftHandlePosition,
    rightHandlePosition,
  };
}
