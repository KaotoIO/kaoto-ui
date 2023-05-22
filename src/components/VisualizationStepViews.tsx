import { dynamicImport } from './import';
import { Extension, JsonSchemaConfigurator, StepErrorBoundary } from '@kaoto/components';
import { StepsService } from '@kaoto/services';
import { useFlowsStore } from '@kaoto/store';
import { IStepProps, IStepPropsParameters } from '@kaoto/types';
import { getSortedParameters } from '@kaoto/utils';
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
  TabTitleText,
} from '@patternfly/react-core';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { shallow } from 'zustand/shallow';

export interface IStepViewsProps {
  isPanelExpanded: boolean;
  onClosePanelClick: () => void;
  saveConfig: (step: IStepProps, newValues: Record<string, unknown>) => void;
  step: IStepProps;
}

const VisualizationStepViews = ({
  isPanelExpanded,
  onClosePanelClick,
  saveConfig,
  step,
}: IStepViewsProps) => {
  const debouncedSaveConfig = useDebouncedCallback(saveConfig, 1_000, { leading: false, trailing: true });
  const views = useFlowsStore((state) => state.views.filter((view) => view.step === step.UUID), shallow);

  const hasDetailView = views?.some((v) => v.id === 'detail-step');
  const detailsTabIndex = views?.length! + 1; // provide an index that won't be used by custom views
  const extensionConfigViewIndex = views?.findIndex((v) => v.name === 'Config');
  const hasConfigView = extensionConfigViewIndex !== -1;
  const configTabIndex = !hasConfigView ? views?.length! + 2 : extensionConfigViewIndex;

  const [activeTabKey, setActiveTabKey] = useState<string | number>(configTabIndex);
  const [stepPropertySchema, setStepPropertySchema] = useState<{
    [label: string]: { type: string };
  }>({});
  const [stepPropertyModel, setStepPropertyModel] = useState<{ [label: string]: any }>({});
  const [parametersOrder, setParametersOrder] = useState<string[]>([]);
  const { addAlert } = useAlert() || {};

  const stepsService = useMemo(() => new StepsService(), []);

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
    setActiveTabKey(()=>
    step.parameters?.length ? configTabIndex : detailsTabIndex);
    let tempSchemaObject: { [label: string]: { type: string; value?: any; description?: string } } =
      {};

    let tempModelObject = {} as IStepPropsParameters;

    step.parameters?.forEach((p) =>
      StepsService.buildStepSchemaAndModel(p, tempModelObject, tempSchemaObject)
    );

    setStepPropertySchema(tempSchemaObject);
    setStepPropertyModel(tempModelObject);
    setParametersOrder(getSortedParameters(step));
  }, [step, isPanelExpanded, configTabIndex]);

  const handleTabClick = useCallback((_event: unknown, tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
  }, []);

  const onChangeModel = (configuration: Record<string, unknown>, isValid: boolean): void => {
    if (isValid) {
      debouncedSaveConfig(step, configuration);
    }
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
              const kaotoApi = stepsService.createKaotoApi(step, (values) => {saveConfig(step, values)}, alertKaoto);

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
          {step.parameters?.length! > 0 && !hasConfigView && (
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
                        default: stepPropertyModel,
                      }}
                      configuration={stepPropertyModel}
                      parametersOrder={parametersOrder}
                      onChangeModel={onChangeModel}
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
