import { useRef, useState } from 'react';
import { Circle, Group, Image, Layer, Stage, Text } from 'react-konva';
import { IStepProps, IViewProps, IVizStepProps } from '../types';
import createImage from '../utils/createImage';
import truncateString from '../utils/truncateName';
import { StepViews } from './StepViews';
import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import './Visualization.css';
import Konva from 'konva';
import { v4 as uuidv4 } from 'uuid';
import { VisualizationSlot } from './VisualizationSlot';

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

const haveIntersection = (
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

  const deleteStep = () => {
    const selectedStepVizId = selectedStep.viz.id;
    setIsPanelExpanded(false);
    setSelectedStep(placeholderStep);

    const stepsIndex = findIndexWithVizId(selectedStepVizId, steps);

    selectedStep.viz.temporary
      ? setTempSteps(tempSteps.filter((tempStep) => tempStep.viz.id !== selectedStepVizId))
      : deleteIntegrationStep(stepsIndex);
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

    layerRef.current?.children?.map((group) => {
      // do not check intersection with itself
      if (group === target) {
        //console.log('group and target are the same, returning..');
        return;
      }

      if (haveIntersection(group.getClientRect(), targetRect)) {
        console.log('rectangle INTERSECTING!!1');
        /**
         * Future validation goes here
         */
      } else {
        //console.log('rectangle NOT intersecting');
      }
    });
  };

  const onDragEndTempStep = (e: any) => {
    const id = e.target.id();
    const index = findIndexWithVizId(id, tempSteps);

    /**
     * Check for intersection
     */

    /**
     * Update the position of the selected step
     */
    const items = tempSteps.filter((tempStep) => tempStep.viz.id !== id);
    const oldItem = tempSteps[index];
    items.push({
      ...oldItem,
      viz: {
        ...oldItem!.viz,
        position: {
          x: e.target.x(),
          y: e.target.y(),
        },
      },
    });

    setTempSteps(items);
  };

  const imageDimensions = {
    height: 40,
    width: 40,
  };

  const handleClickStep = (e: { target: { id: () => string } }) => {
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
    <Drawer isExpanded={isPanelExpanded} onExpand={onExpandPanel}>
      <DrawerContent
        panelContent={
          <StepViews
            step={selectedStep}
            isPanelExpanded={isPanelExpanded}
            deleteStep={deleteStep}
            onClosePanelClick={onClosePanelClick}
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
                  name={'integration-and-slots'}
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
                        name={item.viz.id}
                      >
                        <Circle
                          name={`${index}`}
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
  );
};

export { Visualization };
