import { Circle, Group, Image, Text } from 'react-konva';
import createImage from '../utils/createImage';
import { IStepProps, IVizStepProps } from '../types';

export interface IVisualizationStep {
  circleProps?: any;
  groupProps?: any;
  handleClickStep: (e: any) => void;
  idx: number;
  imageProps?: any;
  onDragEndTempStep: (e: any) => void;
  step: {viz: IVizStepProps, model: IStepProps};
  textProps?: any;
}

const imageDimensions = {
  height: 40,
  width: 40
};

const CIRCLE_LENGTH = 75;

function truncateString(str, num) {
  if (str.length > num) {
    return str.slice(0, num) + '..';
  } else {
    return str;
  }
}

const VisualizationStep = ({circleProps, groupProps, handleClickStep, idx, imageProps, onDragEndTempStep, step, textProps}: IVisualizationStep) => {
  return (
    <Group x={step.viz.position.x}
           y={step.viz.position.y}
           onClick={handleClickStep}
           onDragEnd={onDragEndTempStep}
           id={step.viz.id}
           index={idx}
           onMouseEnter={(e: any) => {
             // style stage container:
             const container = e.target.getStage().container();
             container.style.cursor = 'pointer';
           }}
           onMouseLeave={(e: any) => {
             const container = e.target.getStage().container();
             container.style.cursor = 'default';
           }}
           draggable>
      <Circle
        name={`${idx}`}
        stroke={step.model.type === 'START' ? 'rgb(0, 136, 206)' : step.model.type === 'END' ? 'rgb(149, 213, 245)' : 'rgb(204, 204, 204)'}
        fill={'white'}
        strokeWidth={3}
        width={CIRCLE_LENGTH}
        height={CIRCLE_LENGTH}
      />
      <Image id={step.viz.id}
             image={createImage(step.model.icon)}
             offsetX={imageProps ? imageProps.width / 2 : 0}
             offsetY={imageProps ? imageProps.height / 2 : 0}
             height={imageProps.height ?? imageDimensions.height}
             width={imageProps.width ?? imageDimensions.width}
      />
      <Text x={-(CIRCLE_LENGTH)}
            y={(CIRCLE_LENGTH / 2) + 10}
            align={'center'}
            width={150}
            fontFamily={'Ubuntu'}
            fontSize={11}
            text={truncateString(step.model.name, 14)}
      />
    </Group>
  );
};

export { VisualizationStep };
