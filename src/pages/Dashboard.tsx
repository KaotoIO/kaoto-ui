import { IntegrationJsonProvider, IntegrationSourceProvider } from '../api';
import {
  Catalog,
  DeploymentsModal,
  SettingsModal,
  Visualization,
  SourceCodeEditor,
} from '../components';
import { KaotoToolbar } from '../components/KaotoToolbar';
import { IDeployment, ISettings, IViewProps } from '../types';
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
    integrationName: 'Integration',
    namespace: 'default',
  });
  const [views, setViews] = useState<IViewProps[]>([]);

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

  const handleSaveDeployment = (newDeployment: IDeployment) => {
    setDeployment(newDeployment);
  };

  return (
    <IntegrationJsonProvider initialState={{ metadata: { name: '' }, params: [], steps: [] }}>
      <IntegrationSourceProvider initialState={''}>
        <Page>
          <PageSection padding={{ default: 'noPadding' }}>
            <KaotoToolbar
              deployment={deployment}
              expanded={expanded}
              handleExpanded={handleExpanded}
              handleSaveDeployment={handleSaveDeployment}
              handleUpdateName={(val) => {
                setSettings({ ...settings, integrationName: val });
              }}
              settings={settings}
            />
            <Grid>
              {expanded.codeEditor ? (
                <GridItem span={3}>
                  <SourceCodeEditor
                    dsl={settings.dsl}
                    handleUpdateViews={(newViews: IViewProps[]) => {
                      if (newViews === views) return;
                      setViews(newViews);
                    }}
                  />
                </GridItem>
              ) : expanded.catalog ? (
                <GridItem span={3}>
                  <Catalog
                    isCatalogExpanded={expanded.catalog}
                    onClosePanelClick={onClosePanelClick}
                    queryParams={{ dsl: settings.dsl }}
                  />
                </GridItem>
              ) : (
                <></>
              )}
              <GridItem
                span={expanded.codeEditor || expanded.catalog ? 9 : 12}
                className={'visualization'}
              >
                <Visualization
                  handleUpdateViews={(newViews: IViewProps[]) => {
                    if (newViews === views) return;
                    setViews(newViews);
                  }}
                  settings={settings}
                  toggleCatalog={() =>
                    setExpanded({ ...expanded, catalog: !expanded.catalog, codeEditor: false })
                  }
                  views={views}
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
          handleUpdateViews={(newViews: IViewProps[]) => {
            if (newViews === views) return;
            setViews(newViews);
          }}
          isModalOpen={expanded.settingsModal ?? false}
        />
      </IntegrationSourceProvider>
    </IntegrationJsonProvider>
  );
};

export { Dashboard };
