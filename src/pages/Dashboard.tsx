import {
  Catalog,
  DeploymentsModal,
  SettingsModal,
  Visualization,
  SourceCodeEditor,
  Console,
} from '../components';
import { KaotoToolbar } from '../components/KaotoToolbar';
import { IViewProps } from '../types';
import './Dashboard.css';
import {
  Page,
  PageSection,
  GridItem,
  Grid,
  Flex,
  FlexItem,
  Banner,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
} from '@patternfly/react-core';
import { TerminalIcon } from '@patternfly/react-icons';
import { useRef, useState } from 'react';

export interface IExpanded {
  catalog?: boolean;
  codeEditor?: boolean;
  console?: boolean;
  deploymentsModal?: boolean;
  settingsModal?: boolean;
}

const Dashboard = () => {
  const [expanded, setExpanded] = useState<IExpanded>({
    catalog: false,
    codeEditor: false,
    console: false,
    deploymentsModal: false,
    settingsModal: false,
  });
  const [views, setViews] = useState<IViewProps[]>([]);
  const consoleDrawerRef = useRef<HTMLSpanElement | null>(null);

  const onExpand = () => {
    consoleDrawerRef.current && consoleDrawerRef.current.focus();
  };

  const handleExpanded = (updatedState: IExpanded) => {
    setExpanded({ ...expanded, ...updatedState });
  };

  return (
    <>
      <Drawer
        isExpanded={expanded.console}
        position="bottom"
        onExpand={onExpand}
        style={{ maxHeight: window.innerHeight - 105 }}
      >
        <DrawerContent
          panelContent={
            <DrawerPanelContent isResizable>
              <DrawerContentBody
                style={{ maxHeight: '250px' }}
                tabIndex={expanded.console ? 0 : -1}
                // ref={consoleDrawerRef}
              >
                <Console
                  expanded={expanded}
                  handleCloseConsole={() => {
                    setExpanded({ ...expanded, console: !expanded.console });
                  }}
                />
              </DrawerContentBody>
            </DrawerPanelContent>
          }
        >
          <DrawerContentBody>
            <Flex
              direction={{ default: 'column' }}
              flexWrap={{ default: 'nowrap' }}
              spaceItems={{ default: 'spaceItemsNone' }}
              style={{ height: '100%' }}
            >
              <FlexItem>
                <Page>
                  <PageSection padding={{ default: 'noPadding' }}>
                    <KaotoToolbar expanded={expanded} handleExpanded={handleExpanded} />
                    <Grid>
                      {expanded.codeEditor ? (
                        <GridItem span={3} rowSpan={2}>
                          {/* SOURCE CODE EDITOR */}
                          <SourceCodeEditor
                            handleUpdateViews={(newViews: IViewProps[]) => {
                              if (newViews === views) return;
                              setViews(newViews);
                            }}
                          />
                        </GridItem>
                      ) : expanded.catalog ? (
                        <GridItem span={3} rowSpan={2}>
                          {/* STEP CATALOG */}
                          <Catalog />
                        </GridItem>
                      ) : (
                        <></>
                      )}
                      <GridItem
                        span={expanded.codeEditor || expanded.catalog ? 9 : 12}
                        className={'visualization'}
                      >
                        {/* VISUALIZATION / CANVAS */}
                        <Visualization
                          handleUpdateViews={(newViews: IViewProps[]) => {
                            if (newViews === views) return;
                            setViews(newViews);
                          }}
                          toggleCatalog={() =>
                            setExpanded({
                              ...expanded,
                              catalog: !expanded.catalog,
                              codeEditor: false,
                            })
                          }
                          views={views}
                        />
                      </GridItem>
                    </Grid>
                  </PageSection>
                </Page>
              </FlexItem>
            </Flex>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>

      <Banner isSticky={true} screenReaderText="Status">
        <Flex flexWrap={{ default: 'nowrap' }}>
          <FlexItem>
            <a
              role={'button'}
              onClick={() => setExpanded({ ...expanded, console: !expanded.console })}
              style={{ textDecoration: 'none' }}
            >
              <TerminalIcon />
              &nbsp;&nbsp;View Console
            </a>
          </FlexItem>
        </Flex>
      </Banner>

      <DeploymentsModal
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
    </>
  );
};

export { Dashboard };
