import * as React from 'react';
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
  TabTitleText
} from '@patternfly/react-core';
import { IStepProps, IViewProps, IVizStepProps } from '../types';
import { dynamicImport } from './import';
import { Extension } from './Extension';

export interface IStepViewsProps {
  deleteStep: (e: any) => void,
  isPanelExpanded: boolean,
  onClosePanelClick: (e: any) => void,
  step: { viz: IVizStepProps, model: IStepProps };
  views: IViewProps[];
}

const StepViews = ({ deleteStep, isPanelExpanded, onClosePanelClick, step, views }: IStepViewsProps) => {
  const hasDetailStep = views.some(v => v.id === 'detail-step');
  const defaultTabIndex = 10000;
  const [activeTabKey, setActiveTabKey] = React.useState(defaultTabIndex);

  React.useEffect(() => {
    setActiveTabKey(views.some(v => v.id === 'detail-step') ? 0 : defaultTabIndex);
  }, [step]);

  const handleTabClick = (event: any, tabIndex: any) => {
    setActiveTabKey(tabIndex);
  };

  return (
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
        <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
          {!hasDetailStep && (
            <Tab eventKey={defaultTabIndex} title={<TabTitleText>Details</TabTitleText>}>
              <br/>
              <Grid hasGutter>
                <GridItem span={3}><b>Name</b></GridItem>
                <GridItem span={6}>{step.model.name}</GridItem>
                <GridItem span={3} rowSpan={2}>
                  <img src={step.model.icon}
                       style={{ maxWidth: '50%' }}
                       alt={'icon'}/>
                </GridItem>
                <GridItem span={3}><b>Title</b></GridItem>
                <GridItem span={6}>{step.model.title}</GridItem>
                <GridItem span={3}><b>Description</b></GridItem>
                <GridItem span={9}>{step.model.description}</GridItem>
                <GridItem span={3}><b>Group</b></GridItem>
                <GridItem span={9}>{step.model.group}</GridItem>
                <GridItem span={3}><b>API Version</b></GridItem>
                <GridItem span={9}>{step.model.apiVersion}</GridItem>
                <GridItem span={3}><b>Kind</b></GridItem>
                <GridItem span={9}>{step.model.kind}</GridItem>
                {step.model.kameletType && (
                  <>
                    <GridItem span={3}><b>Kamelet Type</b></GridItem>
                    <GridItem span={9}>{step.model.kameletType}</GridItem>
                  </>
                )}
              </Grid>
              <br/>
              <Button variant={'danger'}
                      key={step.viz.id}
                      onClick={deleteStep}>Delete</Button>
            </Tab>
          )}
          {views.length > 0 && views.map((view, index) => {
            const ButtonApp = React.lazy(() => dynamicImport('stepextension', './Button', 'https://step-extension.netlify.app/remoteEntry.js'));

            const onButtonClicked = () => {
              console.log('CLICKED! BANANAS!!');
            };

            return (
              <Tab eventKey={index} key={index} title={<TabTitleText>{view.name}</TabTitleText>}>
                <p>Step: {view.step}</p>
                <p>URL of View: {view.url}</p>
                <Extension name="extension" loading="Loading extension..." failure="Could not load extension. Is it running?">
                  <ButtonApp text="Passed from Zimara!" onButtonClicked={onButtonClicked} path="/" />
                </Extension>
              </Tab>
            )
          })}
        </Tabs>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
}

export { StepViews };
