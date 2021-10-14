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
import { IStepProps, IVizStepProps } from '../types';

export interface IStepViewsProps {
  deleteStep: (e: any) => void,
  isPanelExpanded: boolean,
  onClosePanelClick: (e: any) => void,
  step: {viz: IVizStepProps, model: IStepProps};
}

const StepViews = ({deleteStep, isPanelExpanded, onClosePanelClick, step}: IStepViewsProps) => {
  const [activeTabKey, setActiveTabKey] = React.useState(0);

  const handleTabClick = (event, tabIndex) => {
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
            <Tab eventKey={0} title={<TabTitleText>Details</TabTitleText>}>
              <br/>
              <Grid hasGutter>
                <GridItem span={3}><b>Name</b></GridItem>
                <GridItem span={6}>{step.model.name}</GridItem>
                <GridItem span={3} rowSpan={2}><img src={step.model.icon} style={{maxWidth: '50%'}} alt={'icon'}/></GridItem>
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
                      //isAriaDisabled={!step.viz.temporary}
                      onClick={deleteStep}>Delete</Button>
            </Tab>
            <Tab eventKey={1} title={<TabTitleText>Some Extension</TabTitleText>}>
              <br/>
              Some remotely loaded extension
            </Tab>
          </Tabs>
        </DrawerPanelBody>
      </DrawerPanelContent>
  );
}

export { StepViews };
