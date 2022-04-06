import { StepsAndViewsProvider, YAMLProvider } from '../api';
import { Catalog, KaotoToolbar, SettingsModal, Visualization, YAMLEditor } from '../components';
import {
  AlertVariant,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { useState } from 'react';
import { useAlert } from '@rhoas/app-services-ui-shared';

export interface IExpanded {
  catalog?: boolean;
  codeEditor?: boolean;
  settingsModal?: boolean;
}

export interface ISettings {
  dsl?: string;
}

const Dashboard = () => {
  const [expanded, setExpanded] = useState<IExpanded>({
    catalog: false,
    codeEditor: true,
    settingsModal: false,
  });
  const [settings, setSettings] = useState<ISettings>({ dsl: 'KameletBinding' });

  const { addAlert } = useAlert() || {};

  const onExpandPanel = () => {
    //drawerRef.current && drawerRef.current.focus();
  };

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

  return (
    <YAMLProvider>
      <Drawer isExpanded={expanded.catalog} onExpand={onExpandPanel} position={'left'}>
        <DrawerContent
          panelContent={
            <Catalog
              isCatalogExpanded={expanded.catalog}
              onClosePanelClick={onClosePanelClick}
              queryParams={{ dsl: settings.dsl }}
            />
          }
          className={'panelCustom'}
        >
          <DrawerContentBody>
            <KaotoToolbar expanded={expanded} handleExpanded={handleExpanded} />
            <Grid>
              <StepsAndViewsProvider initialState={{ steps: [], views: [] }}>
                {expanded.codeEditor && (
                  <GridItem span={4}>
                    <YAMLEditor />
                  </GridItem>
                )}
                <GridItem span={expanded.codeEditor ? 8 : 12} className={'visualization'}>
                  <Visualization
                    toggleCatalog={() => setExpanded({ ...expanded, catalog: !expanded.catalog })}
                  />
                </GridItem>
              </StepsAndViewsProvider>
            </Grid>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
      <SettingsModal
        currentSettings={settings}
        handleCloseModal={() => {
          setExpanded({ ...expanded, settingsModal: !expanded.settingsModal });
        }}
        handleSaveSettings={handleSaveSettings}
        isModalOpen={expanded.settingsModal ?? false}
      />
    </YAMLProvider>
  );
};

export { Dashboard };
