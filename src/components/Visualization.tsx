import { IModelVizProps, IStepProps, IViewProps, IVizStepProps } from '../types';
import { StepErrorBoundary, StepViews } from './';
import './Visualization.css';
// @ts-ignore
import initialElements from './initial-elements';
import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import { useRef, useState } from 'react';
import ReactFlow, {
  removeElements,
  addEdge,
  MiniMap,
  Controls,
  Background,
  Elements,
} from 'react-flow-renderer';
import { v4 as uuidv4 } from 'uuid';

interface IVisualization {
  deleteIntegrationStep: (e: any) => void;
  isError?: boolean;
  isLoading?: boolean;
  replaceIntegrationStep: (newStep: any, oldStepIndex: any) => void;
  steps: { viz: IVizStepProps; model: IStepProps }[];
  views: IViewProps[];
}

const placeholderStep: IModelVizProps = {
  model: {
    apiVersion: '',
    icon: '',
    id: '',
    name: '',
    parameters: [],
    type: '',
    UUID: '',
  },
  viz: {
    id: '',
    position: {
      x: 0,
      y: 0,
    },
    stepId: '',
    temporary: false,
  },
  views: [{}],
};

const findIndexWithVizId = (vizId: any, steps: any[]) => {
  return steps.map((step: any) => step.viz.id).indexOf(vizId);
};

/**
 * Compares two areas using their dimensions and positioning
 * to determine if there is an intersection
 * @param r1
 * @param r2
 */
const doAreasIntersect = (
  r1: { x: number; width: any; y: number; height: any },
  r2: { x: number; width: any; y: number; height: any }
) => {
  return !(
    r2.x > r1.x + r1.width ||
    r2.x + r2.width < r1.x ||
    r2.y > r1.y + r1.height ||
    r2.y + r2.height < r1.y
  );
};

const onLoad = (reactFlowInstance: { fitView: () => void }) => {
  console.log('flow loaded:', reactFlowInstance);
  reactFlowInstance.fitView();
};

const Visualization = ({
  deleteIntegrationStep,
  replaceIntegrationStep,
  steps,
  views,
}: IVisualization) => {
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [selectedStep, setSelectedStep] =
    useState<{ model: IStepProps; viz: IVizStepProps }>(placeholderStep);
  const [tempSteps, setTempSteps] = useState<
    { model: IStepProps; viz: IVizStepProps; views?: IViewProps[] }[]
  >([]);

  const [elements, setElements] = useState(initialElements);
  // @ts-ignore
  const onElementsRemove = (elementsToRemove: Elements<any>) =>
    setElements((els) => removeElements(elementsToRemove, els));
  // @ts-ignore
  const onConnect = (params) => setElements((els) => addEdge(params, els));

  const deleteStep = () => {
    const selectedStepVizId = selectedStep.viz.id;
    setIsPanelExpanded(false);
    setSelectedStep(placeholderStep);

    const stepsIndex = findIndexWithVizId(selectedStepVizId, steps);

    /**
     * If it's a temporary step, simply update the state.
     * For an integration step, use the callback to remove the step.
     */
    selectedStep.viz.temporary
      ? setTempSteps(tempSteps.filter((tempStep) => tempStep.viz.id !== selectedStepVizId))
      : deleteIntegrationStep(stepsIndex);
  };

  const saveConfig = (newValues: { [s: string]: unknown } | ArrayLike<unknown>) => {
    const selectedStepVizId = selectedStep.viz.id;
    let newStep: { model: IStepProps; viz: IVizStepProps } = selectedStep;
    const newStepParameters = newStep.model.parameters;

    if (newStepParameters && newStepParameters.length > 0) {
      Object.entries(newValues).map(([key, value]) => {
        const paramIndex = newStepParameters.findIndex((p) => p.id === key);
        newStepParameters[paramIndex!].value = value;
      });

      // "old step index" is the same as the current step index
      replaceIntegrationStep(newStep, selectedStepVizId);
    } else {
      return;
    }
  };

  const handleClickStep = (e: any) => {
    if (!e.target.id()) {
      return;
    }

    // Only set state again if the ID is not the same
    if (selectedStep.model.id !== e.target.id()) {
      const combinedSteps = steps.concat(tempSteps);
      const findStep: { viz: IVizStepProps; model: IStepProps } =
        combinedSteps.find((step) => step.viz.id === e.target.id()) ?? selectedStep;
      setSelectedStep(findStep);
    }

    setIsPanelExpanded(!isPanelExpanded);
  };

  const onExpandPanel = () => {
    //drawerRef.current && drawerRef.current.focus();
  };

  const onClosePanelClick = () => {
    setIsPanelExpanded(false);
  };

  // Stage is a div container
  // Layer is actual canvas element (so you may have several canvases in the stage)
  // And then we have canvas shapes inside the Layer
  return (
    <StepErrorBoundary>
      <Drawer isExpanded={isPanelExpanded} onExpand={onExpandPanel}>
        <DrawerContent
          panelContent={
            <StepViews
              step={selectedStep}
              isPanelExpanded={isPanelExpanded}
              deleteStep={deleteStep}
              onClosePanelClick={onClosePanelClick}
              saveConfig={saveConfig}
              views={views.filter((view) => view.step === selectedStep.model.UUID)}
            />
          }
          className={'panelCustom'}
        >
          <DrawerContentBody>
            {/** Wrapper to handle steps (DOM elements) dropped from catalog **/}
            <div
              onDrop={(e: any) => {
                e.preventDefault();
                const dataJSON = e.dataTransfer.getData('text');
              }}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              style={{ width: window.innerWidth, height: window.innerHeight }}
            >
              <ReactFlow
                elements={elements}
                onElementsRemove={onElementsRemove}
                onConnect={onConnect}
                onLoad={onLoad}
                snapToGrid={true}
                snapGrid={[15, 15]}
              >
                <MiniMap
                  nodeStrokeColor={(n) => {
                    if (n.style?.background) return n.style.background;
                    if (n.type === 'input') return '#0041d0';
                    if (n.type === 'output') return '#ff0072';
                    if (n.type === 'default') return '#1a192b';

                    return '#eee';
                  }}
                  nodeColor={(n) => {
                    if (n.style?.background) return n.style.background;

                    return '#fff';
                  }}
                  nodeBorderRadius={2}
                />
                <Controls />
                <Background color="#aaa" gap={16} />
              </ReactFlow>
            </div>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </StepErrorBoundary>
  );
};

export { Visualization };
