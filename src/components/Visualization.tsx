import * as React from 'react';
import { Circle, Group, Image, Layer, Line, Stage, Text } from 'react-konva';
import { IStepProps, IViewProps, IVizStepProps } from '../types';
import createImage from '../utils/createImage';
import truncateString from '../utils/truncateName';
import { StepView } from './StepView';
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerContentBody,
} from '@patternfly/react-core';
import './Visualization.css';
import Konva from 'konva';
import { v4 as uuidv4 } from 'uuid';
import { VisualizationStep } from './VisualizationStep';
import { PlusCircleIcon } from '@patternfly/react-icons';

interface IVisualization {
  deleteIntegrationStep: (e: any) => void;
  isError?: boolean;
  isLoading?: boolean;
  steps: {viz: IVizStepProps, model: IStepProps}[];
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
    UUID: ''
  },
  viz: {
    id: '',
    label: '',
    position: {
      x: 0,
      y: 0
    },
    temporary: false
  }
};

const Visualization = ({ deleteIntegrationStep, isError, isLoading, steps, views }: IVisualization) => {
  const incrementAmt = 100;
  const stageRef = React.useRef<Konva.Stage>(null);
  const [isPanelExpanded, setIsPanelExpanded] = React.useState(false);
  const [selectedStep, setSelectedStep] = React.useState<{ model: IStepProps, viz: IVizStepProps }>(placeholderStep);
  const [tempSteps, setTempSteps] = React.useState<{ model: IStepProps, viz: IVizStepProps }[]>([]);

  const deleteStep = (e: any) => {
    const selectedStepVizId = selectedStep.viz.id;
    setIsPanelExpanded(false);
    setSelectedStep(placeholderStep);
    const stepsIndex = steps.map((step) => {return step.viz.id}).indexOf(selectedStepVizId);

    selectedStep.viz.temporary
      ? setTempSteps(tempSteps.filter((tempStep) => tempStep.viz.id !== selectedStepVizId))
      : deleteIntegrationStep(stepsIndex);
  };

  const onDragEndIntegration = e => {
    //
  };

  const onDragEndTempStep = e => {
    const newSteps = tempSteps;
    let newStep = newSteps[e.target.attrs.index];
    newStep.viz = { ...newStep.viz, position: { x: e.target.attrs.x, y: e.target.attrs.y } };
    setTempSteps(newSteps);
  };

  const imageDimensions = {
    height: 40,
    width: 40
  };

  const handleClickStep = (e) => {
    if(!e.target.id()) {
      return;
    }

    // Only set state again if the ID is not the same
    if(selectedStep.model.id !== e.target.id()) {
      const combinedSteps = steps.concat(tempSteps);
      const findStep: {viz: IVizStepProps, model: IStepProps} = combinedSteps.find(step => step.viz.id === e.target.id()) ?? selectedStep;
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
        <DrawerContent panelContent={<StepView step={selectedStep} isPanelExpanded={isPanelExpanded} deleteStep={deleteStep} onClosePanelClick={onClosePanelClick}/>}
                       className={'panelCustom'}>
          <DrawerContentBody>
            <div onDrop={(e: any) => {
              e.preventDefault();
              const dataJSON = e.dataTransfer.getData('text');
              // register event position
              stageRef.current?.setPointersPositions(e);
              //handleDrop(e);
              const parsed: IStepProps = JSON.parse(dataJSON);

              setTempSteps(tempSteps.concat({
                model: parsed,
                viz: {
                  id: uuidv4(),
                  label: parsed.name,
                  position: {...stageRef.current?.getPointerPosition()},
                  temporary: true
                }
              }));
            }} onDragOver={(e) => e.preventDefault()}>
              <div className={'step-creator-button'}>
                <Button variant={'link'} className={'button-icon'}>
                  <PlusCircleIcon width={50} height={50} />
                </Button>
              </div>
            <Stage width={window.innerWidth} height={window.innerHeight} ref={stageRef}>
              <Layer>
                {tempSteps.map((step, idx) => {
                  const groupProps = {
                    x: step.viz.position.x,
                    y: step.viz.position.y
                  };

                  const imageProps = {
                    offsetX: imageDimensions ? imageDimensions.width / 2 : 0,
                    offsetY: imageDimensions ? imageDimensions.height / 2 : 0
                  };

                  const textProps = {
                    x: -(CIRCLE_LENGTH),
                    y: (CIRCLE_LENGTH / 2) + 10
                  };

                  return (
                    <VisualizationStep groupProps={groupProps}
                                       handleClickStep={handleClickStep}
                                       idx={idx}
                                       imageProps={imageProps}
                                       key={idx}
                                       onDragEndTempStep={onDragEndTempStep}
                                       step={step}
                                       textProps={textProps}/>
                  );
                })}
                <Group x={250} y={300} id={'Integration'} onDragEnd={onDragEndIntegration} draggable>
                  <Line
                    points={[
                      100, 0,
                      steps.length * incrementAmt, 0
                    ]}
                    stroke={'black'}
                    strokeWidth={3}
                    lineCap={'round'}
                    lineJoin={'round'}
                  />
                  {steps.map((item, index) => {
                    const imageProps = {
                      id: item.viz.id,
                      image: createImage(item.model.icon),
                      x: item.viz.position.x! - (imageDimensions.width / 2),
                      y: 0 - (imageDimensions.height / 2),
                      height: imageDimensions.height,
                      width: imageDimensions.width
                    };

                    const circleProps = {
                      x: item.viz.position.x,
                      y: 0
                    };

                    const textProps = {
                      x: item.viz.position.x! - (CIRCLE_LENGTH),
                      y: (CIRCLE_LENGTH / 2) + 10
                    };

                    return (
                      <Group key={index}
                             onClick={handleClickStep}
                             onMouseEnter={(e: any) => {
                               // style stage container:
                               const container = e.target.getStage().container();
                               container.style.cursor = 'pointer';
                             }}
                             onMouseLeave={(e: any) => {
                               const container = e.target.getStage().container();
                               container.style.cursor = 'default';
                             }}
                      >
                        <Circle
                          {...circleProps}
                          name={`${index}`}
                          stroke={item.model.type === 'START' ? 'rgb(0, 136, 206)' : item.model.type === 'END' ? 'rgb(149, 213, 245)' : 'rgb(204, 204, 204)'}
                          fill={'white'}
                          strokeWidth={3}
                          width={CIRCLE_LENGTH}
                          height={CIRCLE_LENGTH}
                        />
                        <Image {...imageProps} />
                        <Text align={'center'}
                              width={150}
                              fontFamily={'Ubuntu'}
                              fontSize={11}
                              text={truncateString(item.model.name, 14)}
                              {...textProps}
                        />
                      </Group>
                    )
                  })}
                </Group>
              </Layer>
            </Stage>
            </div>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export { Visualization };
