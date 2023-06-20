import { Console, KaotoDrawer, KaotoToolbar, Visualization } from '../components';
import { useLocalStorage } from '../hooks';
import './Dashboard.css';
import { LeftPanel } from './DashboardLeftPanel';
import {
  Banner,
  DrawerColorVariant,
  DrawerContentBody,
  Flex,
  FlexItem,
  Page,
  PageSection,
} from '@patternfly/react-core';
import { TerminalIcon } from '@patternfly/react-icons';
import { ReactFlowProvider } from 'reactflow';

export const Dashboard = () => {
  const [bottomDrawerExpanded, setBottomDrawerExpanded] = useLocalStorage(
    'bottomDrawerExpanded',
    false,
  );
  const [leftDrawerExpanded, setLeftDrawerExpanded] = useLocalStorage('leftDrawerExpanded', false);
  const [leftDrawerMode, setLeftDrawerMode] = useLocalStorage<'code' | 'catalog'>(
    'leftDrawerMode',
    'catalog',
  );

  const drawerConsole = (
    <DrawerContentBody tabIndex={bottomDrawerExpanded ? 0 : -1}>
      <Console
        handleCloseConsole={() => {
          setBottomDrawerExpanded(!bottomDrawerExpanded);
        }}
      />
    </DrawerContentBody>
  );

  const handleToggleCodeEditor = () => {
    if (leftDrawerMode === 'code') {
      // it's already showing the code editor, just toggle it
      setLeftDrawerExpanded(!leftDrawerExpanded);
    } else {
      setLeftDrawerMode('code');
      setLeftDrawerExpanded(true);
    }
  };

  const handleToggleCatalog = () => {
    if (leftDrawerMode === 'catalog') {
      // it's already showing the catalog, just toggle it
      setLeftDrawerExpanded(!leftDrawerExpanded);
    } else {
      // currently showing code editor content;
      // set to catalog, only close if already open
      setLeftDrawerMode('catalog');

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
        // 29px is the size of bottom Console banner
        style={{ height: 'calc(100vh - 29px)' }}
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
                  leftDrawerExpanded={leftDrawerExpanded}
                  toggleCatalog={handleToggleCatalog}
                  toggleCodeEditor={handleToggleCodeEditor}
                  hideLeftPanel={() => {
                    setLeftDrawerExpanded(false);
                  }}
                />

                {/* LEFT DRAWER: CATALOG & CODE EDITOR */}
                <KaotoDrawer
                  colorVariant={DrawerColorVariant.light200}
                  dataTestId={'kaoto-left-drawer'}
                  panelContent={
                    <LeftPanel
                      onCatalogClose={() => setLeftDrawerExpanded(false)}
                      mode={leftDrawerMode}
                    />
                  }
                  id={'kaoto-left-drawer'}
                  isExpanded={leftDrawerExpanded}
                  minSize={'525px'}
                  position={'left'}
                >
                  {/* VISUALIZATION / CANVAS */}
                  <ReactFlowProvider>
                    <Visualization />
                  </ReactFlowProvider>
                </KaotoDrawer>
              </PageSection>
            </Page>
          </FlexItem>
        </Flex>
      </KaotoDrawer>

      {/* CONSOLE LOG */}
      <Banner isSticky={true}>
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
