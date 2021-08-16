import * as React from 'react';
import { Circle, Group, Layer, Line, Stage } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';
//import { IStepProps } from '../types';

interface IVizKonva {
  isError?: boolean;
  isLoading?: boolean;
  steps?: any[];
}

const ConnectingLine = () => {
  return (
    <Line
      points={
        // points format: [x1, y1, x2, y2, x3, y3]
        [
          0, window.innerHeight / 2,
          window.innerWidth, window.innerHeight / 2
        ]
      }
      stroke={'black'}
      strokeWidth={2}
      lineCap={'round'}
      lineJoin={'round'}
    />
  );
};

const CIRCLE_LENGTH = 75;

const VizKonva = ({ isError, isLoading, steps }: IVizKonva) => {
  const [group, setGroup] = React.useState({ x: 0, y: 0 });
  const yAxis = window.innerHeight / 2;
  const [nodes, setNodes] = React.useState([
    { x: 100, y: yAxis },
    { x: 200, y: yAxis },
    { x: 300, y: yAxis },
    { x: 400, y: yAxis }
  ]);

  const stepsAsElements: any[] = [];

  steps.map((step, index) => {
    const currentStepId = uuidv4();

    let inputStep = {
      data: { label: step.name },
      id: currentStepId,
      position: { x: 300, y: 200 },
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
        //inputStep.type = 'input';
        break;
      case steps.length - 1:
        // Last item in `steps` array
        //inputStep.type = 'output';
        // Extract into common area for last & middle steps
        //inputStep.position!.y = previousStep.position?.y + 100;

        // Add edges
        //stepsAsElements.push({id: 'EDGE-' + previousStep.id + '--' + currentStepId, source: previousStep.id,
        // target: currentStepId, animated: true});
        break;
      default:
        // Middle step
        //inputStep.position!.y = previousStep.position!.y + 100;

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
          <Group x={group.x} y={group.y} onDragEnd={onDragEnd} draggable>
            <ConnectingLine/>
            {nodes.map((item, index) => {
              return (
                <Circle
                  x={item.x}
                  y={item.y}
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
