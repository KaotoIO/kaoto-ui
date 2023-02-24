import { Extension, JsonSchemaConfigurator, StepErrorBoundary } from '@kaoto/components';
import { StepsService } from '@kaoto/services';
import { useIntegrationJsonStore, useNestedStepsStore, useVisualizationStore } from '@kaoto/store';
import { IStepProps } from '@kaoto/types';
import {
  AlertVariant,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  Grid,
  GridItem,
  Tab,
  Tabs,
  TabTitleText
} from '@patternfly/react-core';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { lazy, useEffect, useState } from 'react';
import { dynamicImport } from './import';

export interface IStepViewsProps {
  isPanelExpanded: boolean;
  onClosePanelClick: (e: any) => void;
  saveConfig: (newValues: any) => void;
  step: IStepProps;
}

const VisualizationStepViews = ({
  isPanelExpanded,
  onClosePanelClick,
  saveConfig,
  step,
}: IStepViewsProps) => {
  const integrationJsonStore = useIntegrationJsonStore();
  const views = integrationJsonStore.views.filter((view) => view.step === step.UUID);

  const hasDetailView = views?.some((v) => v.id === 'detail-step');
  const detailsTabIndex = views?.length! + 1; // provide an index that won't be used by custom views
  const extensionConfigViewIndex = views?.findIndex((v) => v.name === 'Config');
  const hasConfigView = extensionConfigViewIndex !== -1;
  const configTabIndex = !hasConfigView ? views?.length! + 2 : extensionConfigViewIndex;
  const nestedStepsStore = useNestedStepsStore();
  const visualizationStore = useVisualizationStore();
  const stepsService = new StepsService(integrationJsonStore, nestedStepsStore, visualizationStore);
  const [activeTabKey, setActiveTabKey] = useState(configTabIndex);
  const [stepPropertySchema, setStepPropertySchema] = useState<{
    [label: string]: { type: string };
  }>({});
  const [stepPropertyModel, setStepPropertyModel] = useState<{ [label: string]: any }>({});
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
    let tempSchemaObject: { [label: string]: { type: string; value?: any; description?: string } } =
      {};

    let tempModelObject: { [label: string]: any } = {};

    const schemaProps = (parameter: { [label: string]: any }) => {
      const propKey = parameter.id;
      const description = parameter.description;
      const type = parameter.type;

      tempSchemaObject[propKey] = { type, description };
      tempModelObject[propKey] = parameter.value ?? parameter.defaultValue;
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
              const kaotoApi = stepsService.createKaotoApi(step, saveConfig, alertKaoto);

              return (
                <Tab
                  eventKey={index}
                  key={index}
                  title={<TabTitleText>{view.name}</TabTitleText>}
                  data-testid={view.name === 'Config' ? 'configurationTab' : 'stepExtensionTab'}
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

          {/** If the step does not have an overriding Config view, provide the default one */}
          {!hasConfigView && (
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
                      schema={{
                        type: 'object',
                        properties: stepPropertySchema,
                        required: step.required,
                      }}
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
          )}
        </Tabs>
      </DrawerPanelBody>
    </>
  );
};

export { VisualizationStepViews };
