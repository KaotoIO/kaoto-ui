import { IStepProps, IViewProps, IVizStepProps } from '../types';
import createImage from '../utils/createImage';
import truncateString from '../utils/truncateName';
import { StepErrorBoundary } from './StepErrorBoundary';
import { StepViews } from './StepViews';
import './Visualization.css';
import { VisualizationSlot } from './VisualizationSlot';
import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import Konva from 'konva';
import { useRef, useState } from 'react';
import { Circle, Group, Image, Layer, Stage, Text } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';

interface IVisualization {
  deleteIntegrationStep: (e: any) => void;
  isError?: boolean;
  isLoading?: boolean;
  replaceIntegrationStep: (newStep: any, oldStepIndex: any) => void;
  steps: { viz: IVizStepProps; model: IStepProps }[];
  views: IViewProps[];
}

const CIRCLE_LENGTH = 75;

const placeholderStep = {
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
    label: '',
    position: {
      x: 0,
      y: 0,
    },
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

const Visualization = ({
  deleteIntegrationStep,
  replaceIntegrationStep,
  steps,
  views,
}: IVisualization) => {
  const layerRef = useRef<Konva.Layer>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [selectedStep, setSelectedStep] =
    useState<{ model: IStepProps; viz: IVizStepProps }>(placeholderStep);
  const [tempSteps, setTempSteps] = useState<
    { model: IStepProps; viz: IVizStepProps; views?: IViewProps[] }[]
  >([]);
  const integrationGroupName = 'integration-and-slots-group';
  const integrationStepGroupName = 'integration-step-group';

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

  const onDragStartTempStep = (e: any) => {
    const id = e.target.id();
    const items = tempSteps.slice();
    const index = findIndexWithVizId(id, items);
    const item = items[index];

    /**
     * Ensure selected step goes above other steps
     */
    // remove from list of steps
    items.splice(index, 1);
    // add to the bottom of the list
    items.push(item);
    setTempSteps(items);
  };

  const onDragMoveTempStep = (e: any) => {
    /**
     * Check if intersects with integration steps
     */
    // Exclude self from intersection
    const target = e.target;
    const targetRect = e.target.getClientRect();
    const integrationGroup = layerRef.current?.findOne('.' + integrationGroupName);

    // @ts-ignore
    integrationGroup.children?.map((group) => {
      // Exclude self from intersection
      if (group === target) {
        return;
      }

      if (doAreasIntersect(group.getClientRect(), targetRect)) {
        /**
         * Validation goes here
         */
      }
    });
  };

  const onDragEndTempStep = (e: any) => {
    const draggedStepId = e.target.id();
    // @ts-ignore
    const targetCircle = e.target.children.find(({ className }) => className === 'Circle');

    /**
     * Check for intersection
     */
    const target = e.target;
    const integrationGroup = layerRef.current?.findOne('.' + integrationGroupName);

    // @ts-ignore
    integrationGroup?.children.map(
      (group: { attrs: { name: string; id: any }; children: any[] }) => {
        // Exclude self from intersection
        if (group === target) {
          return;
        }
        // Exclude any group other than integration step groups
        if (group.attrs.name !== integrationStepGroupName) {
          return;
        }

        const groupCircleChild = group.children.find(
          ({ className }: { className: string }) => className === 'Circle'
        );

        if (doAreasIntersect(groupCircleChild.getClientRect(), targetCircle.getClientRect())) {
          /**
           * Step replacement from temporary step already existing on the canvas
           */
          const currentStepIndex = findIndexWithVizId(draggedStepId, tempSteps);
          const slotStepIndex = findIndexWithVizId(group.attrs.id, steps);

          // Destroy node, update temporary steps
          setTempSteps(tempSteps.filter((tempStep) => tempStep.viz.id !== draggedStepId));

          // Update YAML
          replaceIntegrationStep(tempSteps[currentStepIndex].model, slotStepIndex);
        }
      }
    );
  };

  const imageDimensions = {
    height: 40,
    width: 40,
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
            {/** Stage wrapper to handle steps (DOM elements) dropped from catalog **/}
            <div
              onDrop={(e: any) => {
                e.preventDefault();
                const dataJSON = e.dataTransfer.getData('text');
                // Register event position
                stageRef.current?.setPointersPositions(e);
                const parsed: IStepProps = JSON.parse(dataJSON);
                const currentPosition = stageRef.current?.getPointerPosition(); // e.g. {"x":158,"y":142}
                const intersectingShape = stageRef.current?.getIntersection(currentPosition!);

                // Only create a temporary step if it does not intersect with an existing step
                if (intersectingShape) {
                  const parentVizId = intersectingShape.getParent().attrs.id;
                  const parentIdx = steps.map((step) => step.viz.id).indexOf(parentVizId);
                  replaceIntegrationStep(parsed, parentIdx);
                } else {
                  setTempSteps(
                    tempSteps.concat({
                      model: parsed,
                      viz: {
                        id: uuidv4(),
                        label: parsed.name,
                        position: { ...stageRef.current?.getPointerPosition()! },
                        temporary: true,
                      },
                    })
                  );
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
              }}
            >
              <Stage width={window.innerWidth} height={window.innerHeight} ref={stageRef}>
                <Layer ref={layerRef}>
                  <Group
                    name={integrationGroupName}
                    x={window.innerWidth / 5}
                    y={window.innerHeight / 2}
                  >
                    {/** Create the visualization slots **/}
                    <VisualizationSlot steps={steps} />

                    {/** Create the visualization steps **/}
                    {steps.map((item, index) => {
                      const itemImage = createImage(item.model.icon, null);

                      return (
                        <Group
                          key={index}
                          onClick={handleClickStep}
                          onMouseEnter={(e: any) => {
                            const container = e.target.getStage().container();
                            container.style.cursor = 'pointer';
                          }}
                          onMouseLeave={(e: any) => {
                            const container = e.target.getStage().container();
                            container.style.cursor = 'default';
                          }}
                          id={item.viz.id}
                          name={integrationStepGroupName}
                          width={CIRCLE_LENGTH}
                          height={CIRCLE_LENGTH}
                        >
                          <Circle
                            name={`circle-${item.viz.id}`}
                            stroke={
                              item.model.type === 'START'
                                ? 'rgb(0, 136, 206)'
                                : item.model.type === 'END'
                                ? 'rgb(149, 213, 245)'
                                : 'rgb(204, 204, 204)'
                            }
                            fill={'white'}
                            strokeWidth={3}
                            width={CIRCLE_LENGTH}
                            height={CIRCLE_LENGTH}
                            x={item.viz.position.x}
                            y={0}
                          />
                          <Image
                            id={item.viz.id}
                            name={`image-${item.viz.id}`}
                            image={itemImage}
                            x={item.viz.position.x! - imageDimensions.width / 2}
                            y={0 - imageDimensions.height / 2}
                            height={imageDimensions.height}
                            width={imageDimensions.width}
                          />
                          <Text
                            align={'center'}
                            width={150}
                            fontFamily={'Ubuntu'}
                            fontSize={11}
                            text={truncateString(item.model.name, 14)}
                            x={item.viz.position.x! - CIRCLE_LENGTH}
                            y={CIRCLE_LENGTH / 2 + 10}
                          />
                        </Group>
                      );
                    })}
                  </Group>

                  {/** Create the temporary steps **/}
                  {tempSteps.map((step, idx) => {
                    const textProps = {
                      x: -CIRCLE_LENGTH,
                      y: CIRCLE_LENGTH / 2 + 10,
                    };

                    return (
                      <Group
                        onClick={handleClickStep}
                        onDragEnd={onDragEndTempStep}
                        onDragMove={onDragMoveTempStep}
                        onDragStart={onDragStartTempStep}
                        data-testid={'visualization-step'}
                        id={step.viz.id}
                        index={idx}
                        key={step.viz.id}
                        onMouseEnter={(e: any) => {
                          // style stage container:
                          const container = e.target.getStage().container();
                          container.style.cursor = 'pointer';
                        }}
                        onMouseLeave={(e: any) => {
                          const container = e.target.getStage().container();
                          container.style.cursor = 'default';
                        }}
                        x={step.viz.position.x}
                        y={step.viz.position.y}
                        height={75}
                        width={75}
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
                        />
                        <Image
                          id={step.viz.id}
                          image={createImage(step.model.icon, null)}
                          height={imageDimensions.height}
                          width={imageDimensions.width}
                          offsetX={imageDimensions ? imageDimensions.width / 2 : 0}
                          offsetY={imageDimensions ? imageDimensions.height / 2 : 0}
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
                  })}
                </Layer>
              </Stage>
            </div>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </StepErrorBoundary>
  );
};

export { Visualization };
