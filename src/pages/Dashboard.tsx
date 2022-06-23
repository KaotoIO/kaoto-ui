import {
  startDeployment,
  StepsAndViewsProvider,
  stopDeployment,
  useStepsAndViewsContext,
  YAMLProvider,
} from '../api';
import { Catalog, DeploymentsModal, SettingsModal, Visualization, YAMLEditor } from '../components';
import { KaotoToolbar } from '../components/KaotoToolbar';
import { ISettings } from '../types';
import './Dashboard.css';
import { AlertVariant, Page, PageSection, GridItem, Grid } from '@patternfly/react-core';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { useState } from 'react';

export interface IExpanded {
  catalog?: boolean;
  codeEditor?: boolean;
  deploymentsModal?: boolean;
  settingsModal?: boolean;
}

const Dashboard = () => {
  const [deployment, setDeployment] = useState({});
  const [expanded, setExpanded] = useState<IExpanded>({
    catalog: false,
    codeEditor: false,
    deploymentsModal: false,
    settingsModal: false,
  });
  const [settings, setSettings] = useState<ISettings>({
    dsl: 'KameletBinding',
    integrationName: 'integration',
    namespace: 'default',
  });
  const [viewData] = useStepsAndViewsContext();

  const { addAlert } = useAlert() || {};

  const onClosePanelClick = () => {
    setExpanded({ ...expanded, catalog: false });
  };

  const handleExpanded = (updatedState: IExpanded) => {
    setExpanded({ ...expanded, ...updatedState });
  };

  const handleSaveSettings = (newSettings: ISettings) => {
    setSettings(newSettings);
    setExpanded({ ...expanded, settingsModal: !expanded.settingsModal });
    addAlert &&
      addAlert({
        title: 'Saved Settings',
        variant: AlertVariant.success,
        description: 'Configuration settings saved successfully.',
      });
  };

  const handleStartDeployment = () => {
    try {
      startDeployment(
        settings.dsl,
        viewData.steps,
        settings.integrationName,
        settings.namespace
      ).then((res) => {
        setDeployment(res);

        addAlert &&
          addAlert({
            title: 'Deployment started',
            variant: AlertVariant.success,
            description: 'Your integration is deploying..',
          });
      });
    } catch (e) {
      console.log('error deploying.. ', e);
      // setError(error);

      addAlert &&
        addAlert({
          title: 'Deployment not started',
          variant: AlertVariant.warning,
          description: 'There was a problem deploying your integration. Please try again later.',
        });
    }
  };

  const handleStopDeployment = () => {
    // console.log('stopping deployment..');

    try {
      stopDeployment(settings.integrationName).then((res) => {
        console.log('stop deployment response: ', res);

        addAlert &&
          addAlert({
            title: 'Stop deployment',
            variant: AlertVariant.success,
            description: 'Stopping deployment..',
          });
      });
    } catch (e) {
      console.log('error stopping deployment.. ', e);
      console.error(e);

      addAlert &&
        addAlert({
          title: 'Stop deployment',
          variant: AlertVariant.success,
          description: 'There was a problem stopping your deployment. Please try again later.',
        });
    }
  };

  return (
    <StepsAndViewsProvider initialState={{ steps: [], views: [] }}>
      <YAMLProvider>
        <Page>
          <PageSection padding={{ default: 'noPadding' }}>
            <KaotoToolbar
              deployment={deployment}
              expanded={expanded}
              handleExpanded={handleExpanded}
              handleStartDeploy={handleStartDeployment}
              handleStopDeploy={handleStopDeployment}
              settings={settings}
            />
            <Grid>
              {expanded.codeEditor && (
                <GridItem span={4}>
                  <YAMLEditor dsl={settings.dsl} />
                </GridItem>
              )}
              {expanded.catalog && (
                <GridItem span={3}>
                  <Catalog
                    isCatalogExpanded={expanded.catalog}
                    onClosePanelClick={onClosePanelClick}
                    queryParams={{ dsl: settings.dsl }}
                  />
                </GridItem>
              )}
              <GridItem
                span={expanded.codeEditor || expanded.catalog ? 8 : 12}
                className={'visualization'}
              >
                <Visualization
                  settings={settings}
                  toggleCatalog={() => setExpanded({ ...expanded, catalog: !expanded.catalog })}
                />
              </GridItem>
            </Grid>
          </PageSection>
        </Page>
        <DeploymentsModal
          handleCloseModal={() => {
            setExpanded({ ...expanded, deploymentsModal: !expanded.deploymentsModal });
          }}
          isModalOpen={expanded.deploymentsModal ?? false}
        />
        <SettingsModal
          currentSettings={settings}
          handleCloseModal={() => {
            setExpanded({ ...expanded, settingsModal: !expanded.settingsModal });
          }}
          handleSaveSettings={handleSaveSettings}
          isModalOpen={expanded.settingsModal ?? false}
        />
      </YAMLProvider>
    </StepsAndViewsProvider>
  );
};

export { Dashboard };
