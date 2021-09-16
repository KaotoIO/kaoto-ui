//import * as React from 'react';
import {
  Bullseye,
  Card,
  CardBody,
  CardTitle,
  Gallery,
  Grid,
  GridItem,
  Label,
  PageSection
} from '@patternfly/react-core';
import { IStepProps } from '../types';
import './catalog.css';

interface ICatalog {
  steps: IStepProps[]
}

const Catalog = (props: ICatalog) => {
  return (
    <PageSection style={{backgroundColor: '#F9F9F9'}}>
      <Gallery hasGutter={true}>
      {props.steps.map((step, idx) => {
        return (
          <Card key={idx} className={'step'} isCompact={true} isHoverable={true}>
            <Grid md={6}>
              <GridItem span={2}>
                <Bullseye>
                  <img src={step.icon} className={'stepImage'}/>
                </Bullseye>
              </GridItem>
              <GridItem span={7}>
                <CardTitle>
                  <span>{step.name}</span>
                </CardTitle>
                <CardBody>
                  {step.description}
                </CardBody>
              </GridItem>
              <GridItem span={3}>
                <Label color={'blue'} className={'stepLabel'}>SOURCE</Label>
              </GridItem>
            </Grid>
          </Card>
        );
      })}
      </Gallery>
    </PageSection>
  );
};

export { Catalog };


