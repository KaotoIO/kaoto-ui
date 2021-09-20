import {
  Button,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Grid,
  GridItem
} from '@patternfly/react-core';
import { IStepProps, IVizStepProps } from '../types';

export interface IStepViewProps {
  deleteStep: (e: any) => void,
  isPanelExpanded: boolean,
  onClosePanelClick: (e: any) => void,
  step: {viz: IVizStepProps, model: IStepProps};
}

const StepView = ({deleteStep, isPanelExpanded, onClosePanelClick, step}: IStepViewProps) => {
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
                  isAriaDisabled={!step.viz.temporary}
                  onClick={deleteStep}>Delete</Button>
        </DrawerPanelBody>
      </DrawerPanelContent>
  );
}

export { StepView };
