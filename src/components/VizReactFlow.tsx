import ReactFlow, { FlowElement, Node } from 'react-flow-renderer';
import { v4 as uuidv4 } from 'uuid';

interface IStepParameter {
  default?: string;
  description?: string;
  id?: string;
  label?: string;
  type?: string;
  value?: string;
}

/**
 * TODO: Check swagger for accurate types
 */
interface IStepProps {
  description?: string,
  group?: string,
  icon?: string,
  id: string,
  kameletType?: string,
  kind?: string,
  name?: string,
  parameters?: IStepParameter[],
  subType?: string, // should be 'KAMELET'
  title?: string,
  type?: string // e.g. 'CONNECTOR'
}

interface IVizReactFlow {
  steps?: IStepProps[]
}

const VizReactFlow = ({ steps }: IVizReactFlow) => {
  const stepsAsElements: FlowElement[] = [];

  steps?.map((step: IStepProps, index) => {
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
        //inputStep.position!.y = 100;
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

  console.table(stepsAsElements);

  return (
    <>
      <ReactFlow elements={stepsAsElements} />
    </>
  );
}

export { VizReactFlow };
