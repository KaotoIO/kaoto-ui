import ReactFlow from 'react-flow-renderer';

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

interface IReactFlowElement {
  id: string;
  type?: 'input' | 'output';
  data?: any;
  position?: { x: number, y: number };
  source?: string;
  target?: string;
  animated?: boolean;
}

interface IVizReactFlow {
  steps?: IStepProps[]
}

const elements = [
  { id: '1', type: 'input', data: { label: 'Node 1' }, position: { x: 250, y: 5 } },
  // you can also pass a React Node as a label
  { id: '2', data: { label: <div>Node 2</div> }, position: { x: 100, y: 100 } },
  { id: 'e1-2', source: '1', target: '2', animated: true },
];

const VizReactFlow = ({ steps }: IVizReactFlow) => {
  const stepsAsElements: IReactFlowElement[] = [];
  const lastItemInMap = steps => Array.from(steps).pop();
  console.log('lastItemInMap: ' + JSON.stringify(lastItemInMap));

  steps?.map((step: IStepProps, index) => {
    console.log('step: ' + JSON.stringify(step));
    let inputStep:IReactFlowElement = {
      id: '',
      type: undefined
    };

    switch(index) {
      case 0:
        inputStep.type = 'input';
        break;
    }

    /**
    if(index === 0) {
      inputStep.type = 'input';
    }
     **/

    stepsAsElements.push(inputStep);

    return;
  });

  console.table(stepsAsElements);

  return (
    <>
      <ReactFlow elements={elements} />
    </>
  );
}

export { VizReactFlow };
