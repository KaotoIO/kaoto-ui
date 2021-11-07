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
    <Group x={250} y={300} id={'slots'}>
      <Line
        points={[100, 0, steps.length * incrementAmt, 0]}
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
            onMouseEnter={() => {
              console.log('incoming hover!');
            }}
            onMouseLeave={() => {
              console.log('outgoing hover!');
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
