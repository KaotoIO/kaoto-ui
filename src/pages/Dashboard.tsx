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
  DrawerHead,
  DrawerActions,
  DrawerCloseButton,
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
  const [deployment, setDeployment] = useState<string>();
  const [expanded, setExpanded] = useState<IExpanded>({
    catalog: false,
    codeEditor: false,
    console: false,
    deploymentsModal: false,
    settingsModal: false,
  });
  const [views, setViews] = useState<IViewProps[]>([]);
  const consoleDrawerRef = useRef<HTMLSpanElement | null>(null);

  const handleExpanded = (updatedState: IExpanded) => {
    setExpanded({ ...expanded, ...updatedState });
  };

  const handleSaveDeployment = (newDeployment: string) => {
    setDeployment(newDeployment);
  };

  const panelContent = (
    <DrawerPanelContent>
      <DrawerHead>
        <span tabIndex={expanded.console ? 0 : -1} ref={consoleDrawerRef}>
          drawer-panel
        </span>
        <DrawerActions>
          <DrawerCloseButton
            onClick={() => setExpanded({ ...expanded, console: !expanded.console })}
          />
        </DrawerActions>
      </DrawerHead>
    </DrawerPanelContent>
  );

  return (
    <IntegrationJsonProvider initialState={{ metadata: { name: '' }, params: [], steps: [] }}>
      <IntegrationSourceProvider initialState={''}>
        <SettingsProvider>
          <Flex
            direction={{ default: 'column' }}
            flexWrap={{ default: 'nowrap' }}
            spaceItems={{ default: 'spaceItemsNone' }}
            style={{ height: '100%' }}
          >
            <FlexItem>
              <Drawer
                isExpanded={expanded.console}
                position={'bottom'}
                onExpand={() => consoleDrawerRef.current && consoleDrawerRef.current.focus()}
              >
                <DrawerContent panelContent={panelContent}>
                  <DrawerContentBody>
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
                              <Catalog currentDeployment={deployment} />
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
                  </DrawerContentBody>
                </DrawerContent>
              </Drawer>
            </FlexItem>

            <FlexItem>
              <Banner isSticky={true} screenReaderText="Status">
                <Flex flexWrap={{ default: 'nowrap' }}>
                  {!deployment && (
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
                  )}
                </Flex>
              </Banner>
            </FlexItem>
          </Flex>

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
