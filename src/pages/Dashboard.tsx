import { StepsAndViewsProvider, YAMLProvider } from '../api';
import { Catalog, KaotoToolbar, Visualization, YAMLEditor } from "../components";
import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { useState } from 'react';

export interface IExpanded {
  catalog?: boolean,
  codeEditor?: boolean
}

const Dashboard = () => {
  const [expanded, setExpanded] = useState<IExpanded>({
    catalog: false,
    codeEditor: true,
  });

  const onExpandPanel = () => {
    //drawerRef.current && drawerRef.current.focus();
  };

  const onClosePanelClick = () => {
    setExpanded({ ...expanded, catalog: false });
  };

  const handleExpanded = (updatedState: IExpanded) => {
    setExpanded({ ...expanded, ...updatedState });
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
          <KaotoToolbar expanded={expanded} handleExpanded={handleExpanded} />
          <Grid>
            <StepsAndViewsProvider initialState={{ steps: [], views: [] }}>
              <YAMLProvider>
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
