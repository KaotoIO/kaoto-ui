import * as React from 'react';
import { Circle, Group, Image, Layer, Line, Stage, Text } from 'react-konva';
import { Grid, GridItem } from '@patternfly/react-core';
import { IStepProps, IViewProps } from '../types';
import createImage from '../utils/createImage';
//import useImage from '../utils/useImage';
import {
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import './Visualization.css';
import Konva from "konva";

interface IVisualization {
  handleDrop: (e: any) => void;
  isError?: boolean;
  isLoading?: boolean;
  steps: {viz: any, model: IStepProps}[];
  views: IViewProps[];
}

const CIRCLE_LENGTH = 75;
/*
const URLImage = ({ image }) => {
  const [img]: any = useImage(image.src);

  return (
    <Image
      image={img}
      x={image.x}
      y={image.y}
      // I will use offset to set origin to the center of the image
      offsetX={img ? img.width / 2 : 0}
      offsetY={img ? img.height / 2 : 0}
      onMouseEnter={(e: any) => {
        // style stage container:
        const container = e.target.getStage().container();
        container.style.cursor = "pointer";
      }}
      onMouseLeave={(e: any) => {
        const container = e.target.getStage().container();
        container.style.cursor = "default";
      }}
      draggable
    />
  );
};

 */

const Visualization = ({ handleDrop, isError, isLoading, steps, views }: IVisualization) => {
  //const yAxis = window.innerHeight / 2;
  const incrementAmt = 100;
  //const stepsAsElements: any[] = [];
  //const stepsAsElements: any[] = React.useRef([]);
  //const [stepsAsElements, setStepsAsElements]: any[] = React.useState(tempStepsAsElements);
  const stageRef = React.useRef<Konva.Stage>(null);
  const [tempSteps, setTempSteps]: any = React.useState([]);

  //const [images, setImages]: any = React.useState([]);
  const [isPanelExpanded, setIsPanelExpanded] = React.useState(false);

  const [selectedStep, setSelectedStep] = React.useState<{viz: any, model: IStepProps}>({
    model: {
      apiVersion: '',
      icon: '',
      id: '',
      name: '',
      type: ''
    },
    viz: {}
  });

  const onDragEnd = e => {
  };

  const imageProps = {
    height: 40,
    width: 40
  };

  const handleClickStep = (e) => {
    if(!e.target.id()) {
      return;
    }

    // Only set state again if the ID is not the same
    if(selectedStep.model.id !== e.target.id()) {
      //setSelectedStep(stepsAsElements[e.target.id()]);
      //setSelectedStep({} as IStepProps);
      const findStep: {viz: any, model: IStepProps} = steps.find(step => step.model.id === e.target.id()) ?? selectedStep;
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

  const panelContent = (
      <DrawerPanelContent isResizable
                          id={'right-resize-panel'}
                          defaultSize={'500px'}
                          minSize={'150px'}>
        <DrawerHead>
          <h3 className={'pf-c-title pf-m-2xl'} tabIndex={isPanelExpanded ? 0 : -1}>
            Step Details
          </h3>
          <DrawerActions>
            <DrawerCloseButton onClick={onClosePanelClick}/>
          </DrawerActions>
        </DrawerHead>
        <DrawerPanelBody>
          <Grid hasGutter>
            <GridItem span={3}><b>Name</b></GridItem>
            <GridItem span={6}>{selectedStep.model.name}</GridItem>
            <GridItem span={3} rowSpan={2}><img src={selectedStep.model.icon} style={{maxWidth: '50%'}} alt={'icon'}/></GridItem>
            <GridItem span={3}><b>Title</b></GridItem>
            <GridItem span={6}>{selectedStep.model.title}</GridItem>
            <GridItem span={3}><b>Description</b></GridItem>
            <GridItem span={9}>{selectedStep.model.description}</GridItem>
            <GridItem span={3}><b>Group</b></GridItem>
            <GridItem span={9}>{selectedStep.model.group}</GridItem>
            <GridItem span={3}><b>API Version</b></GridItem>
            <GridItem span={9}>{selectedStep.model.apiVersion}</GridItem>
            <GridItem span={3}><b>Kind</b></GridItem>
            <GridItem span={9}>{selectedStep.model.kind}</GridItem>
            {selectedStep.model.kameletType && (
              <>
                <GridItem span={3}><b>Kamelet Type</b></GridItem>
                <GridItem span={9}>{selectedStep.model.kameletType}</GridItem>
              </>
            )}
          </Grid>
        </DrawerPanelBody>
      </DrawerPanelContent>
    );

  // Stage is a div container
  // Layer is actual canvas element (so you may have several canvases in the stage)
  // And then we have canvas shapes inside the Layer
  return (
    <>
      <Drawer isExpanded={isPanelExpanded} onExpand={onExpandPanel}>
        <DrawerContent panelContent={panelContent} className={'panelCustom'}>
          <DrawerContentBody>
            <div onDrop={(e: any) => {
              e.preventDefault();
              const dataJSON = e.dataTransfer.getData('someStep');
              console.log(JSON.parse(JSON.stringify((dataJSON))));
              // register event position
              stageRef.current?.setPointersPositions(e);
              handleDrop(e);
              //stepsAsElements.push(dataJSON)
              // add image
              /*
              setImages(
                images.concat([
                  {
                    ...stageRef.current?.getPointerPosition(),
                    src: dataJSON
                  },
                ])
              );
               */
              //setStepsAsElements({...stepsAsElements, dataJSON});
            }} onDragOver={(e) => e.preventDefault()}>
            <Stage width={window.innerWidth} height={window.innerHeight} ref={stageRef}>
              <Layer>
                <Group x={100} y={200} onDragEnd={onDragEnd} draggable>
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
                    const image = {
                      id: item.model.id,
                      image: createImage(item.model.icon),
                      x: item.viz.position.x - (imageProps.width / 2),
                      y: 0 - (imageProps.height / 2),
                      height: imageProps.height,
                      width: imageProps.width
                    };

                    return (
                      <Group key={index}
                             onClick={handleClickStep}
                             onMouseEnter={(e: any) => {
                               // style stage container:
                               const container = e.target.getStage().container();
                               container.style.cursor = "pointer";
                             }}
                             onMouseLeave={(e: any) => {
                               const container = e.target.getStage().container();
                               container.style.cursor = "default";
                             }}
                      >
                        <Circle
                          x={item.viz.position.x}
                          y={0}
                          key={index}
                          name={`${index}`}
                          stroke={index === 0 ? 'rgb(0, 136, 206)' : 'rgb(204, 204, 204)'}
                          fill={'white'}
                          strokeWidth={3}
                          width={CIRCLE_LENGTH}
                          height={CIRCLE_LENGTH}
                        />
                        <Image {...image} />
                        <Text x={item.viz.position.x - (CIRCLE_LENGTH)}
                              y={(CIRCLE_LENGTH / 2) + 10}
                              align={'center'}
                              width={150}
                              fontSize={11}
                              text={item.model.name}
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
