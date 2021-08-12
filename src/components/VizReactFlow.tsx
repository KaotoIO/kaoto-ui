import ReactFlow, { FlowElement, Node } from 'react-flow-renderer';
import { v4 as uuidv4 } from 'uuid';
import { IStepProps } from '../types';

interface IVizReactFlow {
  isError?: boolean;
  isLoading?: boolean;
  steps: IStepProps[];
}

const VizReactFlow = ({ isError, isLoading, steps }: IVizReactFlow) => {
  const stepsAsElements: FlowElement[] = [];

  console.table(steps);

  steps.map((step: IStepProps, index) => {
    const currentStepId = uuidv4();

    let inputStep:FlowElement = {
      data: { label: step.name },
      id: currentStepId,
      position: { x: 100, y: 0 },
      type: undefined
    };

    // Grab the previous step to use for determining position and drawing edges
    const previousStep = stepsAsElements[index-1] as Node ?? undefined;

    /**
     * Determine first & last steps
     * Label as input/output, respectively
     */
    switch(index) {
      case 0:
        // First item in `steps` array
        inputStep.type = 'input';
        break;
      case steps.length - 1:
        // Last item in `steps` array
        inputStep.type = 'output';
        // Extract into common area for last & middle steps
        inputStep.position!.y = previousStep.position?.y + 100;

        // Add edges
        stepsAsElements.push({id: 'EDGE-' + previousStep.id + '--' + currentStepId, source: previousStep.id, target: currentStepId, animated: true});
        break;
      default:
        // Middle step
        inputStep.position!.y = previousStep.position!.y + 100;

        // Add edges
        stepsAsElements.push({id: 'EDGE-' + previousStep.id + '--' + currentStepId, source: previousStep.id, target: currentStepId, animated: true});
        break;
    }

    stepsAsElements.push(inputStep);

    return;
  });

  return (
    <>
      {isError && <div>Something went wrong ...</div>}
      {isLoading ? (<div>Loading...</div>) : (
        <ReactFlow elements={stepsAsElements} />
      )}
    </>
  );
}

export { VizReactFlow };
