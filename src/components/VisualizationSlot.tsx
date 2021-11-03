import { Circle, Group, Line } from 'react-konva';
import { IStepProps, IVizStepProps } from '../types';

export interface IVisualizationSlot {
  circleProps?: any;
  groupProps?: any;
  idx: number;
  onDragEndTempStep?: (e: any) => void;
  step: { viz: IVizStepProps; model: IStepProps };
}

const CIRCLE_LENGTH = 75;

const VisualizationSlot = ({
  circleProps,
  groupProps,
  idx,
  onDragEndTempStep,
  step,
}: IVisualizationSlot) => {
  return (
    <Group
      onDragEnd={onDragEndTempStep}
      data-testid={'visualization-slot-' + idx}
      id={step.viz.id}
      index={idx}
      key={idx}
      onMouseEnter={() => {
        console.log('incoming hover!');
      }}
      onMouseLeave={() => {
        console.log('outgoing hover!');
      }}
      {...groupProps}
    >
      <Line
        //points={[100, 0, steps.length * incrementAmt, 0]}
        stroke={'black'}
        strokeWidth={3}
        lineCap={'round'}
        lineJoin={'round'}
      />
      <Circle
        name={`${idx}`}
        stroke={
          step.model.type === 'START'
            ? 'rgb(0, 136, 206)'
            : step.model.type === 'END'
            ? 'rgb(149, 213, 245)'
            : 'rgb(204, 204, 204)'
        }
        fill={'white'}
        strokeWidth={3}
        width={CIRCLE_LENGTH}
        height={CIRCLE_LENGTH}
        {...circleProps}
      />
    </Group>
  );
};

export { VisualizationSlot };
