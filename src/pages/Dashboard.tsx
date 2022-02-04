import { StepsAndViewsProvider, YAMLProvider } from '../api';
import request from '../api/request';
import { Catalog, Visualization, YAMLEditor } from '../components';
import YAML from '../stories/data/yaml';
import { IStepProps, IViewData } from '../types';
import usePrevious from '../utils/usePrevious';
import './Dashboard.css';
import { AlertVariant } from '@patternfly/react-core';
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  Grid,
  GridItem,
  Tooltip,
} from '@patternfly/react-core';
import { CodeIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  // If the catalog data won't be changing, consider removing this state
  const [catalogData, setCatalogData] = useState<IStepProps[]>([]);

  // viewData contains the Step model exactly as returned by the API
  const [viewData, setViewData] = useState<IViewData>({ steps: [], views: [] });

  // yamlData contains the exact YAML returned by the API or specified by the user
  const [yamlData, setYamlData] = useState(YAML);

  const [expanded, setExpanded] = useState({
    catalog: false,
    codeEditor: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const previousYaml = usePrevious(yamlData);
  const { addAlert } = useAlert() || {};

  const onExpandPanel = () => {
    //drawerRef.current && drawerRef.current.focus();
  };

  const onClosePanelClick = () => {
    setExpanded({ ...expanded, catalog: false });
  };

  /**
   * Sort & fetch all Steps for the Catalog
   */
  useEffect(() => {
    const getCatalogData = async () => {
      try {
        const resp = await request.get({
          endpoint: '/step',
        });

        const data = await resp.json();
        data.sort((a: IStepProps, b: IStepProps) => a.name.localeCompare(b.name));
        setCatalogData(data);
      } catch (err) {
        console.error(err);
      }
    };

    getCatalogData().catch((e) => {
      console.error(e);
    });
  }, [viewData]);

  /**
   * Watch for user changes to YAML,
   * issue request to API for Visualization JSON
   */
  // Should this `useEffect` be moved to the Visualization?
  useEffect(() => {
    if (previousYaml === yamlData) {
      return;
    }

    const getVizData = async (incomingData: string) => {
      setIsError(false);
      setIsLoading(true);

      try {
        const resp = await request.post({
          endpoint: '/viewdefinition',
          contentType: 'text/yaml',
          body: incomingData,
        });

        const data: IViewData = await resp.json();
        setViewData(data);
      } catch (err) {
        console.error(err);
        setIsError(true);
      }

      setIsLoading(false);
    };

    getVizData(yamlData).catch((e) => {
      console.error(e);
    });
  }, [previousYaml, yamlData]);

  /**
   * Update the integration. Requires a list of all new steps.
   * @param newSteps
   */
  const updateIntegration = async (newSteps: IStepProps[]) => {
    try {
      setIsLoading(true);

      const resp = await request.post({
        endpoint: '/integrations/customResource',
        contentType: 'application/json',
        body: { name: 'Updated integration', steps: newSteps },
      });

      const data = await resp.text();

      addAlert &&
        addAlert({
          title: 'Integration updated successfully',
          variant: AlertVariant.success,
        });

      setYamlData(data);
      setIsError(false);
    } catch (err) {
      console.error(err);
      addAlert &&
        addAlert({
          title: 'Something went wrong',
          variant: AlertVariant.danger,
          description: 'There was a problem updating the integration. Please try again later.',
        });
      setIsError(true);
    }

    if (isLoading) {
      setIsLoading(false);
    }
  };

  /**
   * Delete an integration step. Requires the step index.
   * @param stepsIndex
   */
  const deleteIntegrationStep = (stepsIndex: number) => {
    const newSteps = viewData.steps.filter((_step, idx) => idx !== stepsIndex);

    updateIntegration(newSteps).catch((e) => {
      console.error(e);
    });
  };

  /**
   * Replace an integration step. Requires the new step and EITHER the old step index or vizId.
   * @param newStep
   * @param oldStepIndex
   */
  const replaceIntegrationStep = (newStep: IStepProps, oldStepIndex: number) => {
    let newSteps = viewData.steps;
    newSteps[oldStepIndex] = newStep;

    updateIntegration(newSteps).catch((e) => {
      console.error(e);
    });
  };

  return (
    <StepsAndViewsProvider>
      <YAMLProvider>
        <Drawer isExpanded={expanded.catalog} onExpand={onExpandPanel} position={'left'}>
          <DrawerContent
            panelContent={
              <Catalog
                isCatalogExpanded={expanded.catalog}
                onClosePanelClick={onClosePanelClick}
                steps={catalogData}
              />
            }
            className={'panelCustom'}
          >
            <DrawerContentBody>
              <div className={'step-creator-button'}>
                <Tooltip content={'Connector Catalog'}>
                  <Button
                    variant={'plain'}
                    data-testid={'openCatalogButton'}
                    isActive={expanded.catalog}
                    aria-label={'Connector Catalog'}
                    onClick={() => {
                      setExpanded({ ...expanded, catalog: !expanded.catalog });
                    }}
                  >
                    <PlusCircleIcon width={40} height={40} />
                  </Button>
                </Tooltip>
                <Tooltip content={'Code Editor'}>
                  <Button
                    variant={'plain'}
                    isActive={expanded.codeEditor}
                    data-testid={'openEditorButton'}
                    aria-label={'Code Editor'}
                    onClick={() => {
                      setExpanded({ ...expanded, codeEditor: !expanded.codeEditor });
                    }}
                  >
                    <CodeIcon width={40} height={40} />
                  </Button>
                </Tooltip>
              </div>
              <Grid>
                {expanded.codeEditor && (
                  <GridItem span={4}>
                    <YAMLEditor />
                  </GridItem>
                )}
                <GridItem span={expanded.codeEditor ? 8 : 12} className={'visualization'}>
                  <Visualization
                    deleteIntegrationStep={deleteIntegrationStep}
                    isError={isError}
                    isLoading={isLoading}
                    replaceIntegrationStep={replaceIntegrationStep}
                    steps={viewData.steps}
                    views={viewData.views}
                  />
                </GridItem>
              </Grid>
            </DrawerContentBody>
          </DrawerContent>
        </Drawer>
      </YAMLProvider>
    </StepsAndViewsProvider>
  );
};

export { Dashboard };
