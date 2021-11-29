import { IStepProps, IViewProps, IVizStepProps } from '../types';
import { Extension } from './Extension';
import { JsonSchemaConfigurator } from './JsonSchemaConfigurator';
import { dynamicImport } from './import';
import {
  Button,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Grid,
  GridItem,
  Tab,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';
import { lazy, useEffect, useRef, useState } from 'react';

export interface IStepViewsProps {
  deleteStep: (e: any) => void;
  isPanelExpanded: boolean;
  onClosePanelClick: (e: any) => void;
  saveConfig: (newValues: any) => void;
  step: { viz: IVizStepProps; model: IStepProps };
  views: IViewProps[];
}

const StepViews = ({
  deleteStep,
  isPanelExpanded,
  onClosePanelClick,
  saveConfig,
  step,
  views,
}: IStepViewsProps) => {
  const hasDetailView = views.some((v) => v.id === 'detail-step');
  const detailsTabIndex = views.length + 1; // provide an index that won't be used by custom views
  const configTabIndex = views.length + 2;
  const [activeTabKey, setActiveTabKey] = useState(detailsTabIndex);
  const stepPropertySchema = useRef<{ [label: string]: { type: string } }>({});

  useEffect(() => {
    setActiveTabKey(views.some((v) => v.id === 'detail-step') ? 0 : detailsTabIndex);
  }, [detailsTabIndex, step, views]);

  useEffect(() => {
    let tempObject: { [label: string]: { type: string } } = {};

    const schemaProps = (parameters: { label: string; type: string }) => {
      const propKey = parameters.label;
      const { type } = parameters;
      tempObject[propKey] = { type };
    };

    step.model.parameters?.map(schemaProps);
    console.log('tempProps: ' + JSON.stringify(tempObject));
    stepPropertySchema.current = tempObject;
  }, [step.model.parameters]);

  const handleTabClick = (_event: any, tabIndex: any) => {
    setActiveTabKey(tabIndex);
  };

  return (
    <DrawerPanelContent
      isResizable
      id={'right-resize-panel'}
      defaultSize={'500px'}
      minSize={'150px'}
    >
      <DrawerHead>
        <h3 className={'pf-c-title pf-m-2xl'} tabIndex={isPanelExpanded ? 0 : -1}>
          Step Details
        </h3>
        <DrawerActions>
          <DrawerCloseButton onClick={onClosePanelClick} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
          {/** If the step does not have a default view, provide one */}
          {!hasDetailView && (
            <Tab eventKey={detailsTabIndex} title={<TabTitleText>Details</TabTitleText>}>
              <br />
              <Grid hasGutter>
                <GridItem span={3}>
                  <b>Title</b>
                </GridItem>
                <GridItem span={6}>{step.model.title}</GridItem>
                <GridItem span={3} rowSpan={2}>
                  <img src={step.model.icon} style={{ maxWidth: '50%' }} alt={'icon'} />
                </GridItem>
                <GridItem span={3}>
                  <b>Description</b>
                </GridItem>
                <GridItem span={6}>{step.model.description}</GridItem>
                <GridItem span={3}>
                  <b>Type</b>
                </GridItem>
                <GridItem span={9}>
                  {step.model.type === 'START'
                    ? 'Source'
                    : step.model.type === 'MIDDLE'
                    ? 'Action'
                    : step.model.type === 'END'
                    ? 'Sink'
                    : ''}
                </GridItem>
              </Grid>
              <br />
              <Button variant={'danger'} key={step.viz.id} onClick={deleteStep}>
                Delete
              </Button>
            </Tab>
          )}

          {/** Show rest of views provided **/}
          {views.length > 0 &&
            views.map((view, index) => {
              const StepExtension = lazy(() => dynamicImport(view.scope, view.module, view.url));

              // Example demonstrating interactivity with step extension
              const onButtonClicked = () => {
                console.log(
                  'Button clicked! Viewing ' + view.id + ' for the following step: ' + view.step
                );
              };

              return (
                <Tab eventKey={index} key={index} title={<TabTitleText>{view.name}</TabTitleText>}>
                  <Extension
                    name="extension"
                    loading="Loading extension..."
                    failure="Could not load extension. Is it running?"
                  >
                    <StepExtension
                      text="Passed from Kaoto!"
                      onButtonClicked={onButtonClicked}
                      path="/"
                    />
                  </Extension>
                </Tab>
              );
            })}

          {/* only integration steps are configurable */}
          {!step.viz.temporary && (
            <Tab eventKey={configTabIndex} title={<TabTitleText>Config</TabTitleText>}>
              <br />
              <Grid hasGutter>
                {step.model.parameters && (
                  <JsonSchemaConfigurator
                    schema={{ type: 'object', properties: stepPropertySchema.current }}
                    configuration={{}}
                    onChange={(configuration, isValid) => {
                      console.log('configuration: ' + JSON.stringify(configuration));
                      console.log('isValid: ' + isValid);
                      //actor.send({ type: 'change', configuration, isValid })
                    }}
                  />
                )}
              </Grid>
              <br />
              <Button variant={'danger'} key={step.viz.id} onClick={saveConfig}>
                Save
              </Button>
            </Tab>
          )}
        </Tabs>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export { StepViews };
