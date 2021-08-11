import ReactFlow, { FlowElement, Node } from 'react-flow-renderer';
//import { v4 as uuidv4 } from 'uuid';

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
    let inputStep:FlowElement = {
      data: { label: step.name },
      //id: uuidv4(),
      id: index.toString(), // ideally we would use uuid for this, but we need to access the index to calculate the
      // node positions
      position: { x: 100, y: 0 },
      type: undefined
    };


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
        inputStep.position!.y = (stepsAsElements[index - 1] as Node).position?.y + 100;
        break;
      default:
        inputStep.position!.y = (stepsAsElements[index - 1] as Node).position!.y + 100;
    }

    stepsAsElements.push(inputStep);

    // Add edges
    stepsAsElements.push({id: 'e1-2', source: '0', target: '1', animated: true});

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
