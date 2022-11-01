import { useVisualizationStore } from '@kaoto/store';
import { SortAmountDownAltIcon, SortAmountDownIcon } from '@patternfly/react-icons';
import { Controls, ControlButton } from 'reactflow';

export const VisualizationControls = () => {
  const setLayout = useVisualizationStore((state) => state.setLayout);

  return (
    <Controls className={'visualization__controls'}>
      {/* VERTICAL BUTTON */}
      <ControlButton onClick={() => setLayout('TB')}>
        <SortAmountDownAltIcon />
      </ControlButton>

      {/* HORIZONTAL BUTTON */}
      <ControlButton onClick={() => setLayout('LR')}>
        <SortAmountDownIcon />
      </ControlButton>
    </Controls>
  );
};
