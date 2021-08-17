import * as React from 'react';
import { Circle, Group, Layer, Line, Stage } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';
import { IStepProps } from '../types';

interface IVizKonva {
  isError?: boolean;
  isLoading?: boolean;
  steps: IStepProps[];
}

const CIRCLE_LENGTH = 75;

const VizKonva = ({ isError, isLoading, steps }: IVizKonva) => {
  const groupPosition = { x: 0, y: 0 };
  const yAxis = window.innerHeight / 2;

  const incrementAmt = 100;

  const stepsAsElements: any[] = [];

  // points format: [x1, y1, x2, y2, x3, y3]
  const linePosition = [
    100, window.innerHeight / 2,
    steps.length * incrementAmt, window.innerHeight / 2
  ];

  steps.map((step, index) => {
    const currentStepId = uuidv4();

    let inputStep = {
      data: { label: step.name },
      id: currentStepId,
      position: { x: 300, y: yAxis },
      type: undefined
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
        // Last item in `steps` array
        // Extract into common area for last & middle steps
        inputStep.position.x = previousStep.position?.x + incrementAmt;

        // Add edges
        //stepsAsElements.push({id: 'EDGE-' + previousStep.id + '--' + currentStepId, source: previousStep.id,
        // target: currentStepId, animated: true});
        break;
      default:
        // Middle step
        inputStep.position.x = previousStep.position!.x + incrementAmt;

        // Add edges
        //stepsAsElements.push({id: 'EDGE-' + previousStep.id + '--' + currentStepId, source: previousStep.id,
        // target: currentStepId, animated: true});
        break;
    }

    stepsAsElements.push(inputStep);

    return;
  });

  const onDragEnd = e => {};

  // Stage is a div container
  // Layer is actual canvas element (so you may have several canvases in the stage)
  // And then we have canvas shapes inside the Layer
  return (
    <>
      <h1>Konva</h1>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Group x={groupPosition.x} y={groupPosition.y} onDragEnd={onDragEnd} draggable>
            <Line
              points={linePosition}
              stroke={'black'}
              strokeWidth={2}
              lineCap={'round'}
              lineJoin={'round'}
            />
            {stepsAsElements.map((item, index) => {
              return (
                <Circle
                  x={item.position.x}
                  y={item.position.y}
                  key={index}
                  name={`${index}`}
                  stroke={'grey'}
                  fill={'white'}
                  strokeWidth={2}
                  width={CIRCLE_LENGTH}
                  height={CIRCLE_LENGTH}
                />
              )
            })}
          </Group>
        </Layer>
      </Stage>
    </>
  );
}

export { VizKonva };
