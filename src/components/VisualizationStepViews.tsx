import {
  fetchDeployment,
  fetchIntegrationSourceCode,
  startDeployment,
  stopDeployment,
} from '../api';
import { useIntegrationJsonStore } from '../store';
import { findStepIdxWithUUID } from '../utils';
import { Extension } from './Extension';
import { JsonSchemaConfigurator } from './JsonSchemaConfigurator';
import { StepErrorBoundary } from './StepErrorBoundary';
import { dynamicImport } from './import';
import { IIntegration, IKaotoApi, IStepProps } from '@kaoto';
import {
  AlertVariant,
  Button,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  Grid,
  GridItem,
  Tab,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { lazy, useEffect, useState } from 'react';

export interface IStepViewsProps {
  deleteStep: (e: any) => void;
  isPanelExpanded: boolean;
  onClosePanelClick: (e: any) => void;
  saveConfig: (newValues: any) => void;
  step: IStepProps;
}

const VisualizationStepViews = ({
  deleteStep,
  isPanelExpanded,
  onClosePanelClick,
  saveConfig,
  step,
}: IStepViewsProps) => {
  const views = useIntegrationJsonStore((state) =>
    state.views.filter((view) => view.step === step.UUID)
  );
  const hasDetailView = views?.some((v) => v.id === 'detail-step');
  const detailsTabIndex = views?.length! + 1; // provide an index that won't be used by custom views
  const configTabIndex = views?.length! + 2;
  const currentIdx = findStepIdxWithUUID(step.UUID!);
  const [activeTabKey, setActiveTabKey] = useState(configTabIndex);
  const [stepPropertySchema, setStepPropertySchema] = useState<{
    [label: string]: { type: string };
  }>({});
  const [stepPropertyModel, setStepPropertyModel] = useState<{ [label: string]: any }>({});
  const { replaceStep } = useIntegrationJsonStore((state) => state);
  const { addAlert } = useAlert() || {};

  const alertKaoto = (title: string, body?: string, variant?: string) => {
    let variantType = AlertVariant.default;

    // map to PatternFly AlertVariant enum type
    switch (variant) {
      case 'info':
        variantType = AlertVariant.info;
        break;
      case 'danger':
        variantType = AlertVariant.danger;
        break;
      case 'success':
        variantType = AlertVariant.success;
        break;
      case 'warning':
        variantType = AlertVariant.warning;
        break;
    }

    addAlert &&
      addAlert({
        title: title,
        variant: variantType,
        description: body,
      });
  };

  useEffect(() => {
    let tempSchemaObject: { [label: string]: { type: string; value?: any } } = {};
    let tempModelObject: { [label: string]: any } = {};

    const schemaProps = (parameter: { [label: string]: any }) => {
      const propKey = parameter.title;
      const { type } = parameter;
      tempSchemaObject[propKey] = { type };
      tempModelObject[propKey] = parameter.value;
    };

    step.parameters?.map(schemaProps);

    setStepPropertySchema(tempSchemaObject);
    setStepPropertyModel(tempModelObject);
  }, [step.parameters, isPanelExpanded]);

  const handleTabClick = (_event: any, tabIndex: any) => {
    setActiveTabKey(tabIndex);
  };

  return (
    <>
      <DrawerHead>
        <Grid>
          <GridItem span={3}>
            <img src={step.icon} style={{ maxHeight: '40px' }} alt={'icon'} />
          </GridItem>
          <GridItem span={8}>
            <h3 className={'pf-c-title pf-m-xl'} tabIndex={isPanelExpanded ? 0 : -1}>
              {step.title}
            </h3>
          </GridItem>
        </Grid>
        <DrawerActions>
          <DrawerCloseButton onClick={onClosePanelClick} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        <Tabs activeKey={activeTabKey} onSelect={handleTabClick} mountOnEnter>
          {/** If the step does not have a default view, provide one */}
          {!hasDetailView && (
            <Tab
              eventKey={detailsTabIndex}
              title={<TabTitleText>Details</TabTitleText>}
              data-testid={'detailsTab'}
            >
              <StepErrorBoundary>
                <br />
                <Grid hasGutter style={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
                  <GridItem span={3}>
                    <b>Title</b>
                  </GridItem>
                  <GridItem span={9}>{step.title}</GridItem>
                  <GridItem span={3}>
                    <b>Description</b>
                  </GridItem>
                  <GridItem span={9}>{step.description}</GridItem>
                  <GridItem span={3}>
                    <b>Type</b>
                  </GridItem>
                  <GridItem span={9}>
                    {step.type === 'START'
                      ? 'Source'
                      : step.type === 'MIDDLE'
                      ? 'Action'
                      : step.type === 'END'
                      ? 'Sink'
                      : ''}
                  </GridItem>
                </Grid>
                <br />
              </StepErrorBoundary>
            </Tab>
          )}

          {views?.length! > 0 &&
            views?.map((view, index) => {
              const StepExtension = lazy(() => dynamicImport(view.scope, view.module, view.url));

              let tmpValues = {};
              step.parameters?.map((p) => {
                const paramKey = p.title;
                // @ts-ignore
                tmpValues[paramKey] = p.value ?? p.defaultValue;
              });

              const kaotoApi: IKaotoApi = {
                getDeployment: (name: string, namespace?: string): Promise<string | unknown> => {
                  return fetchDeployment(name, namespace).then((deployment: string | unknown) => {
                    return deployment;
                  });
                },
                getIntegrationSource: (integration: IIntegration) => {
                  return fetchIntegrationSourceCode(integration).then((sourceCode) => {
                    return sourceCode;
                  });
                },
                notifyKaoto: alertKaoto,
                startDeployment: (
                  integration: any,
                  name: string,
                  namespace?: string
                ): Promise<string> => {
                  return startDeployment(integration, name, namespace).then((res) => {
                    return res;
                  });
                },
                step,
                stepParams: tmpValues,
                stopDeployment: (name: string) => {
                  return stopDeployment(name).then((res) => {
                    return res;
                  });
                },
                updateStep: (newStep: IStepProps) => replaceStep(newStep, currentIdx),
                updateStepParams: saveConfig,
              };

              return (
                <Tab
                  eventKey={index}
                  key={index}
                  title={<TabTitleText>{view.name}</TabTitleText>}
                  data-testid={'stepExtensionTab'}
                >
                  <StepErrorBoundary>
                    <Extension
                      name="extension"
                      loading="Loading extension..."
                      failure="Could not load extension. Is it running?"
                    >
                      <StepExtension text="Passed from Kaoto!" path="/" {...kaotoApi} />
                    </Extension>
                  </StepErrorBoundary>
                </Tab>
              );
            })}

          <Tab
            eventKey={configTabIndex}
            title={<TabTitleText>Config</TabTitleText>}
            data-testid={'configurationTab'}
          >
            <br />
            <StepErrorBoundary>
              <Grid hasGutter style={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
                {step.parameters && (
                  <JsonSchemaConfigurator
                    schema={{ type: 'object', properties: stepPropertySchema }}
                    configuration={stepPropertyModel}
                    onChangeModel={(configuration, isValid) => {
                      if (isValid) {
                        saveConfig(configuration);
                      }
                    }}
                  />
                )}
              </Grid>
              <br />
            </StepErrorBoundary>
          </Tab>
        </Tabs>
        <br />
        <Button
          variant={'danger'}
          key={step.UUID}
          onClick={deleteStep}
          data-testid={'configurationTab__deleteBtn'}
        >
          Delete
        </Button>
      </DrawerPanelBody>
    </>
  );
};

export { VisualizationStepViews };
