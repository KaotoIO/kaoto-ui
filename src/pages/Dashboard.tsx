import { StepsAndViewsProvider, YAMLProvider } from '../api';
import { Catalog, Visualization, YAMLEditor } from '../components';
import YAML from '../stories/data/yaml';
import './Dashboard.css';
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
import { useState } from 'react';

const Dashboard = () => {
  const [expanded, setExpanded] = useState({
    catalog: false,
    codeEditor: true,
  });

  const onExpandPanel = () => {
    //drawerRef.current && drawerRef.current.focus();
  };

  const onClosePanelClick = () => {
    setExpanded({ ...expanded, catalog: false });
  };

  return (
    <Drawer isExpanded={expanded.catalog} onExpand={onExpandPanel} position={'left'}>
      <DrawerContent
        panelContent={
          <Catalog isCatalogExpanded={expanded.catalog} onClosePanelClick={onClosePanelClick} />
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
            <StepsAndViewsProvider initialState={{ steps: [], views: [] }}>
              <YAMLProvider initialState={YAML}>
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
              </YAMLProvider>
            </StepsAndViewsProvider>
          </Grid>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};

export { Dashboard };
