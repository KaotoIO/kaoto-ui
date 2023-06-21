import { IDataTestID, IIntegration } from '../../types';
import { IRestFlow } from './RestDSL.model';
import { RestFlow } from './RestFlow';
import './RestVisualization.css';
import {
  Card,
  CardBody,
  CardExpandableContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Title,
} from '@patternfly/react-core';
import { FunctionComponent, useEffect, useState } from 'react';

interface IRestVisualization extends IDataTestID {
  flows: IIntegration[];
}

const getRestFlows = (flows: IIntegration[]): IRestFlow[] => {
  const restFlows = flows
    .filter((flow) => flow.steps[0]?.id === 'CAMEL-REST-DSL')
    .map((flow) => {
      const path = flow.steps[0].parameters?.find((param) => param.id === 'path')?.value ?? '';
      const description =
        flow.steps[0].parameters?.find((param) => param.id === 'description')?.value ?? '';
      const operationsCount = flow.steps[0].branches?.reduce((acc, branch) => {
        return acc + (branch.steps[0].branches?.length ?? 0);
      }, 0);

      return {
        id: flow.id,
        path,
        description,
        flow,
        operationsCount,
      };
    });

  return restFlows;
};

const getVisibleRestFlows = (restFlows: IRestFlow[]): Record<string, boolean> => {
  return restFlows.reduce((acc, restFlow) => {
    acc[restFlow.id] = true;
    return acc;
  }, {} as Record<string, boolean>);
};

export const RestVisualization: FunctionComponent<IRestVisualization> = (props) => {
  const [restFlows, setRestFlows] = useState<IRestFlow[]>(getRestFlows(props.flows));
  const [visibleRestFlows, setVisibleRestFlows] = useState<Record<string, boolean>>(
    getVisibleRestFlows(restFlows),
  );

  useEffect(() => {
    setRestFlows(getRestFlows(props.flows));
  }, [props.flows]);

  return (
    <div className="rest-visualization">
      {restFlows.map((restFlow) => (
        <Card
          key={restFlow.id}
          className="pf-u-m-sm-on-sm pf-u-m-xl-on-lg"
          isExpanded={visibleRestFlows[restFlow.id]}
        >
          <CardHeader
            onExpand={() => {
              setVisibleRestFlows((state) => ({
                ...state,
                [restFlow.id]: !visibleRestFlows[restFlow.id],
              }));
            }}
            toggleButtonProps={{
              id: 'toggle-button1',
              'aria-label': 'Details',
              'aria-labelledby': 'expandable-card-title toggle-button1',
              'aria-expanded': visibleRestFlows[restFlow.id],
            }}
          >
            <CardTitle>
              <Title headingLevel="h2">{restFlow.path}</Title>
              <Title headingLevel="h4">{restFlow.description}</Title>
            </CardTitle>
          </CardHeader>

          <CardExpandableContent>
            <CardBody>
              <RestFlow flow={restFlow.flow} />
            </CardBody>
          </CardExpandableContent>
          <CardFooter>Routes count: {restFlow.operationsCount}</CardFooter>
        </Card>
      ))}
    </div>
  );
};
