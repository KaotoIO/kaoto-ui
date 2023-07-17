import {
  Catalog,
  Console,
  KaotoDrawer,
  KaotoToolbar,
  SourceCodeEditor,
  Visualization,
} from '../components';
import './Dashboard.css';
import { useSettingsStore } from '@kaoto/store';
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
import { useRef, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';

const Dashboard = () => {
  const [bottomDrawerExpanded, setBottomDrawerExpanded] = useState(false);
  const [leftDrawerExpanded, setLeftDrawerExpanded] = useState(false);
  const leftDrawerModel = useRef('catalog');
  const { settings } = useSettingsStore((state) => state);

  const drawerCatalog = (
    <DrawerContentBody style={{ padding: '10px' }}>
      <Catalog handleClose={() => setLeftDrawerExpanded(false)} />
    </DrawerContentBody>
  );

  const [leftDrawerContent, setLeftDrawerContent] = useState(drawerCatalog);

  const drawerConsole = (
    <DrawerContentBody tabIndex={bottomDrawerExpanded ? 0 : -1}>
      <Console
        handleCloseConsole={() => {
          setBottomDrawerExpanded(!bottomDrawerExpanded);
        }}
      />
    </DrawerContentBody>
  );

  const drawerCodeEditor = (
    <DrawerContentBody hasPadding={false}>
      <SourceCodeEditor mode={settings.editorMode} schemaUri={settings.dsl.validationSchema} />
    </DrawerContentBody>
  );

  const handleToggleCodeEditor = () => {
    if (leftDrawerModel.current === 'code') {
      // it's already showing the code editor, just toggle it
      setLeftDrawerExpanded(!leftDrawerExpanded);
    } else {
      setLeftDrawerContent(drawerCodeEditor);
      leftDrawerModel.current = 'code';
      setLeftDrawerExpanded(true);
    }
  };
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
                  panelContent={leftDrawerContent}
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

export { Dashboard };
