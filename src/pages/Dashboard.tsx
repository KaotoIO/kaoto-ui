import { IntegrationJsonProvider, IntegrationSourceProvider, SettingsProvider } from '../api';
import {
  Catalog,
  DeploymentsModal,
  SettingsModal,
  Visualization,
  SourceCodeEditor,
} from '../components';
import { KaotoToolbar } from '../components/KaotoToolbar';
import { IViewProps } from '../types';
import './Dashboard.css';
import { Page, PageSection, GridItem, Grid } from '@patternfly/react-core';
import { useState } from 'react';

export interface IExpanded {
  catalog?: boolean;
  codeEditor?: boolean;
  confirmationModal?: boolean;
  deploymentsModal?: boolean;
  settingsModal?: boolean;
}

const Dashboard = () => {
  const [deployment, setDeployment] = useState<string>();
  const [expanded, setExpanded] = useState<IExpanded>({
    catalog: false,
    codeEditor: false,
    deploymentsModal: false,
    settingsModal: false,
  });
  const [views, setViews] = useState<IViewProps[]>([]);

  const handleExpanded = (updatedState: IExpanded) => {
    setExpanded({ ...expanded, ...updatedState });
  };

  const handleSaveDeployment = (newDeployment: string) => {
    setDeployment(newDeployment);
  };

  return (
    <IntegrationJsonProvider initialState={{ metadata: { name: '' }, params: [], steps: [] }}>
      <IntegrationSourceProvider initialState={''}>
        <SettingsProvider>
          <Page>
            <PageSection padding={{ default: 'noPadding' }}>
              <KaotoToolbar
                deployment={deployment}
                expanded={expanded}
                handleExpanded={handleExpanded}
                handleSaveDeployment={handleSaveDeployment}
              />
              <Grid>
                {expanded.codeEditor ? (
                  <GridItem span={3}>
                    <SourceCodeEditor
                      handleUpdateViews={(newViews: IViewProps[]) => {
                        if (newViews === views) return;
                        setViews(newViews);
                      }}
                    />
                  </GridItem>
                ) : expanded.catalog ? (
                  <GridItem span={3}>
                    <Catalog />
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
            currentDeployment={deployment}
            handleCloseModal={() => {
              setExpanded({ ...expanded, deploymentsModal: !expanded.deploymentsModal });
            }}
            isModalOpen={expanded.deploymentsModal ?? false}
          />
          <SettingsModal
            handleCloseModal={() => {
              setExpanded({ ...expanded, settingsModal: !expanded.settingsModal });
            }}
            handleUpdateViews={(newViews: IViewProps[]) => {
              if (newViews === views) return;
              setViews(newViews);
            }}
            isModalOpen={expanded.settingsModal ?? false}
          />
        </SettingsProvider>
      </IntegrationSourceProvider>
    </IntegrationJsonProvider>
  );
};

export { Dashboard };
