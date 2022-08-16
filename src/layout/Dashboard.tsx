import {
  Catalog,
  KaotoToolbar,
  Visualization,
  SourceCodeEditor,
  Console,
  KaotoDrawer,
} from '../components';
import { IViewProps } from '../types';
import './Dashboard.css';
import {
  Page,
  PageSection,
  Flex,
  FlexItem,
  Banner,
  DrawerContentBody,
  DrawerColorVariant,
} from '@patternfly/react-core';
import { TerminalIcon } from '@patternfly/react-icons';
import { useRef, useState } from 'react';

const Dashboard = () => {
  const [bottomDrawerExpanded, setBottomDrawerExpanded] = useState(false);
  const [leftDrawerExpanded, setLeftDrawerExpanded] = useState(false);
  const [views, setViews] = useState<IViewProps[]>([]);
  const leftDrawerModel = useRef('catalog');

  const drawerCatalog = (
    <DrawerContentBody style={{ padding: '10px' }}>
      <Catalog handleClose={() => setLeftDrawerExpanded(false)} />
    </DrawerContentBody>
  );

  const [leftDrawerContent, setLeftDrawerContent] = useState(drawerCatalog);

  const drawerConsole = (
    <DrawerContentBody style={{ maxHeight: '250px' }} tabIndex={bottomDrawerExpanded ? 0 : -1}>
      <Console
        handleCloseConsole={() => {
          setBottomDrawerExpanded(!bottomDrawerExpanded);
        }}
      />
    </DrawerContentBody>
  );

  const drawerCodeEditor = (
    <DrawerContentBody hasPadding={false}>
      <SourceCodeEditor
        handleUpdateViews={(newViews: IViewProps[]) => {
          if (newViews === views) return;
          setViews(newViews);
        }}
      />
    </DrawerContentBody>
  );

  const handleToggleCatalog = () => {
    if (leftDrawerModel.current === 'catalog') {
      // it's already showing the catalog, just toggle it
      setLeftDrawerExpanded(!leftDrawerExpanded);
    } else {
      // currently showing code editor content;
      // set to catalog, only close if already open
      setLeftDrawerContent(drawerCatalog);
      leftDrawerModel.current = 'catalog';

      if (!leftDrawerExpanded) {
        setLeftDrawerExpanded(!leftDrawerExpanded);
      }
    }
  };

  return (
    <>
      {/* BOTTOM DRAWER: CONSOLE LOG */}
      <KaotoDrawer
        data-testid={'kaoto-bottom-drawer'}
        id={'kaoto-bottom-drawer'}
        isExpanded={bottomDrawerExpanded}
        isResizable={true}
        panelContent={drawerConsole}
        position="bottom"
        style={{ maxHeight: window.innerHeight - 105 }}
      >
        <Flex
          direction={{ default: 'column' }}
          flexWrap={{ default: 'nowrap' }}
          spaceItems={{ default: 'spaceItemsNone' }}
          style={{ height: '100%' }}
        >
          <FlexItem>
            <Page>
              <PageSection padding={{ default: 'noPadding' }}>
                <KaotoToolbar
                  handleUpdateViews={(newViews: IViewProps[]) => {
                    if (newViews === views) return;
                    setViews(newViews);
                  }}
                  toggleCatalog={handleToggleCatalog}
                  toggleCodeEditor={() => {
                    if (leftDrawerModel.current === 'code') {
                      // it's already showing the code editor, just toggle it
                      setLeftDrawerExpanded(!leftDrawerExpanded);
                    } else {
                      // currently showing catalog content, set to
                      // code editor, close if already open
                      setLeftDrawerContent(drawerCodeEditor);
                      leftDrawerModel.current = 'code';

                      if (!leftDrawerExpanded) {
                        setLeftDrawerExpanded(!leftDrawerExpanded);
                      }
                    }
                  }}
                />

                {/* LEFT DRAWER: CATALOG & CODE EDITOR */}
                <KaotoDrawer
                  colorVariant={DrawerColorVariant.light200}
                  dataTestId={'kaoto-left-drawer'}
                  panelContent={leftDrawerContent}
                  id={'kaoto-left-drawer'}
                  isExpanded={leftDrawerExpanded}
                  minSize={'525px'}
                  position={'left'}
                >
                  {/* VISUALIZATION / CANVAS */}
                  <Visualization
                    handleUpdateViews={(newViews: IViewProps[]) => {
                      if (newViews === views) return;
                      setViews(newViews);
                    }}
                    toggleCatalog={handleToggleCatalog}
                    views={views}
                  />
                </KaotoDrawer>
              </PageSection>
            </Page>
          </FlexItem>
        </Flex>
      </KaotoDrawer>

      {/* CONSOLE LOG */}
      <Banner isSticky={true} screenReaderText="Status">
        <Flex flexWrap={{ default: 'nowrap' }}>
          <FlexItem>
            <a
              role={'button'}
              onClick={() => setBottomDrawerExpanded(!bottomDrawerExpanded)}
              style={{ textDecoration: 'none' }}
            >
              <TerminalIcon />
              &nbsp;&nbsp;View Console
            </a>
          </FlexItem>
        </Flex>
      </Banner>
    </>
  );
};

export { Dashboard };
