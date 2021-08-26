import { Circle, Group, Image, Layer, Line, Stage, Text } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';
import { IStepProps } from '../types';
import createImage from '../utils/createImage';

interface IVizKonva {
  isError?: boolean;
  isLoading?: boolean;
  steps: IStepProps[];
}

const CIRCLE_LENGTH = 75;

const VizKonva = ({ isError, isLoading, steps }: IVizKonva) => {
  const yAxis = window.innerHeight / 2;

  const incrementAmt = 100;

  const stepsAsElements: any[] = [];

  steps.map((step, index) => {
    const currentStepId = uuidv4();

    let inputStep = {
      ...step,
      data: { label: step?.name },
      id: currentStepId,
      position: { x: 300, y: yAxis }
    };

    // Grab the previous step to use for determining position and drawing edges
    const previousStep = stepsAsElements[index-1];

    /**
     * Determine first & last steps
     * Label as input/output, respectively
     */
    switch(index) {
      case 0:
        // First item in `steps` array
        inputStep.position.x = 100;
        break;
      case steps.length - 1:
      default:
        // Last item & middle steps in `steps` array
        // Extract into common area for last & middle steps
        inputStep.position.x = previousStep.position?.x + incrementAmt;
        break;
    }

    stepsAsElements.push(inputStep);

    return;
  });

  const onDragEnd = e => {};

  const imageProps = {
    height: 40,
    width: 40
  };

  // Stage is a div container
  // Layer is actual canvas element (so you may have several canvases in the stage)
  // And then we have canvas shapes inside the Layer
  return (
    <>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Group x={100} y={200} onDragEnd={onDragEnd} draggable>
            <Line
              points={[
                100, 0,
                steps.length * incrementAmt, 0
              ]}
              stroke={'black'}
              strokeWidth={3}
              lineCap={'round'}
              lineJoin={'round'}
            />
            {stepsAsElements.map((item, index) => {
              const image = {
                image: createImage(item.icon),
                x: item.position.x - (imageProps.width / 2),
                y: 0 - (imageProps.height / 2),
                height: imageProps.height,
                width: imageProps.width
              };

              return (
                <Group key={index}>
                  <Circle
                    x={item.position.x}
                    y={0}
                    key={index}
                    name={`${index}`}
                    stroke={index === 0 ? 'rgb(0, 136, 206)' : 'rgb(204, 204, 204)'}
                    fill={'white'}
                    strokeWidth={3}
                    width={CIRCLE_LENGTH}
                    height={CIRCLE_LENGTH}
                  />
                  <Image {...image} />
                  <Text x={item.position.x - (CIRCLE_LENGTH)} y={(CIRCLE_LENGTH / 2) + 10} align={'center'} width={150} fontSize={11} text={item.name} />
                </Group>
              )
            })}
          </Group>
        </Layer>
      </Stage>
    </>
  );
}

export { VizKonva };
