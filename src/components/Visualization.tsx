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
import { VisualizationStep } from './VisualizationStep';

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

  const onDragStartTempStep = () => {};

  const onDragEndTempStep = () => {};

  const imageDimensions = {
    height: 40,
    width: 40,
  };

  const handleClickStep = (e: { target: { id: () => string } }) => {
    if (!e.target.id()) {
      return;
    }
    console.log('selected step');

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
    <>
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
                console.log('on drop');

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
                      const imageProps = {
                        id: item.viz.id,
                        image: createImage(item.model.icon, null),
                        x: item.viz.position.x! - imageDimensions.width / 2,
                        y: 0 - imageDimensions.height / 2,
                        height: imageDimensions.height,
                        width: imageDimensions.width,
                      };

                      const circleProps = {
                        x: item.viz.position.x,
                        y: 0,
                      };

                      const textProps = {
                        x: item.viz.position.x! - CIRCLE_LENGTH,
                        y: CIRCLE_LENGTH / 2 + 10,
                      };

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
                        >
                          <Circle
                            {...circleProps}
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
                          />
                          <Image {...imageProps} />
                          <Text
                            align={'center'}
                            width={150}
                            fontFamily={'Ubuntu'}
                            fontSize={11}
                            text={truncateString(item.model.name, 14)}
                            {...textProps}
                          />
                        </Group>
                      );
                    })}
                  </Group>
                  {/** Create the temporary steps **/}
                  {tempSteps.map((step, idx) => {
                    const groupProps = {
                      x: step.viz.position.x,
                      y: step.viz.position.y,
                    };

                    const imageProps = {
                      offsetX: imageDimensions ? imageDimensions.width / 2 : 0,
                      offsetY: imageDimensions ? imageDimensions.height / 2 : 0,
                    };

                    const textProps = {
                      x: -CIRCLE_LENGTH,
                      y: CIRCLE_LENGTH / 2 + 10,
                    };

                    return (
                      <VisualizationStep
                        groupProps={groupProps}
                        handleClickStep={handleClickStep}
                        idx={idx}
                        imageProps={imageProps}
                        key={idx}
                        onDragEndTempStep={onDragEndTempStep}
                        onDragStartTempStep={onDragStartTempStep}
                        step={step}
                        textProps={textProps}
                      />
                    );
                  })}
                </Layer>
              </Stage>
            </div>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export { Visualization };
