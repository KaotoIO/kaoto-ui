//import * as React from 'react';
import { Bullseye, Card, CardBody, CardTitle, Gallery, Grid, GridItem, Label, PageSection } from '@patternfly/react-core';
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
          <Card key={idx} className={'step'}>
            <Grid md={6}>
              <GridItem span={2}>
                <Bullseye>
                  <img src={step.icon} className={'stepImage'}/>
                </Bullseye>
              </GridItem>
              <GridItem span={8}>
                <CardTitle>
                  <span className={'stepName'}>{step.name}</span>
                </CardTitle>
                <CardBody key={idx}>
                  {step.description}
                </CardBody>
              </GridItem>
              <GridItem span={2}>
                <Label color={'blue'}>SOURCE</Label>
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


