import { Circle, Group, Image, Text } from 'react-konva';
import createImage from '../utils/createImage';
import truncateString from '../utils/truncateName';
import { IStepProps, IVizStepProps } from '../types';

export interface IVisualizationStep {
  circleProps?: any;
  groupProps?: any;
  handleClickStep: (e: any) => void;
  idx: number;
  imageProps?: any;
  onDragStartTempStep: (e: any) => void;
  onDragEndTempStep: (e: any) => void;
  step: { viz: IVizStepProps; model: IStepProps };
  textProps?: any;
}

const imageDimensions = {
  height: 40,
  width: 40,
};

const CIRCLE_LENGTH = 75;

const VisualizationStep = ({
  circleProps,
  groupProps,
  handleClickStep,
  idx,
  imageProps,
  onDragEndTempStep,
  onDragStartTempStep,
  step,
  textProps,
}: IVisualizationStep) => {
  return (
    <Group
      onClick={handleClickStep}
      onDragEnd={onDragEndTempStep}
      onDragStart={onDragStartTempStep}
      data-testid={'visualization-step'}
      id={step.viz.id}
      index={idx}
      key={idx}
      onMouseEnter={(e: any) => {
        // style stage container:
        const container = e.target.getStage().container();
        container.style.cursor = 'pointer';
      }}
      onMouseLeave={(e: any) => {
        const container = e.target.getStage().container();
        container.style.cursor = 'default';
      }}
      {...groupProps}
      draggable
    >
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
      <Image
        id={step.viz.id}
        image={createImage(step.model.icon, null)}
        height={imageProps.height ?? imageDimensions.height}
        width={imageProps.width ?? imageDimensions.width}
        {...imageProps}
      />
      <Text
        align={'center'}
        width={150}
        fontFamily={'Ubuntu'}
        fontSize={11}
        text={truncateString(step.model.name, 14)}
        {...textProps}
      />
    </Group>
  );
};

export { VisualizationStep };
