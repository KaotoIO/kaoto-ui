// @ts-ignore
import horizontal from '../assets/images/layout-horizontal.png';
// @ts-ignore
import vertical from '../assets/images/layout-vertical.png';
import { useVisualizationStore } from '@kaoto/store';
import { Icon } from '@patternfly/react-core';
import { Controls, ControlButton } from 'reactflow';

export const VisualizationControls = () => {
  const setLayout = useVisualizationStore((state) => state.setLayout);

  return (
    <Controls className={'visualization__controls'}>
      {/* VERTICAL BUTTON */}
      <ControlButton onClick={() => setLayout('TB')}>
        <Icon>
          <img src={vertical} alt={'Vertical'} />
        </Icon>
      </ControlButton>

      {/* HORIZONTAL BUTTON */}
      <ControlButton onClick={() => setLayout('LR')}>
        <Icon>
          <img src={horizontal} alt={'Horizontal'} />
        </Icon>
      </ControlButton>
    </Controls>
  );
};
