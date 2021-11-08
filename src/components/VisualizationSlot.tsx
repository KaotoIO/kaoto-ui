import { Circle, Group, Line } from 'react-konva';
import { IStepProps, IVizStepProps } from '../types';

export interface IVisualizationSlot {
  children?: any;
  steps: { viz: IVizStepProps; model: IStepProps }[];
}

const CIRCLE_LENGTH = 75;

const VisualizationSlot = ({ children, steps }: IVisualizationSlot) => {
  const incrementAmt = 100;

  return (
    <Group name={'slots'} id={'slots'}>
      <Line
        points={[
          0, // x1
          0, // y1
          steps.length * incrementAmt - 100, // x2 (subtract 100 for first step)
          0, // y2
        ]}
        stroke={'black'}
        strokeWidth={3}
        lineCap={'round'}
        lineJoin={'round'}
      />
      {steps.map((step, index) => {
        const circleProps = {
          x: step.viz.position.x,
          y: 0,
        };

        return (
          <Group
            data-testid={'visualization-slot-' + index}
            id={'visualization-slot-' + step.viz.id}
            index={index}
            key={index}
            onDragOver={() => {
              console.log('drag over slot');
            }}
          >
            <Circle
              name={`${index}`}
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
      })}
      {children}
    </Group>
  );
};

export { VisualizationSlot };
