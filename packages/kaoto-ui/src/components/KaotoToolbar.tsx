import logo from '../assets/images/logo-kaoto-dark.png';
import { AboutModal } from './AboutModal';
import { AppearanceModal } from './AppearanceModal';
import { ConfirmationModal } from './ConfirmationModal';
import { NewFlow } from './DSL/NewFlow';
import { DeploymentsModal } from './DeploymentsModal';
import { ExportCanvasToPng } from './ExportCanvasToPng';
import { FlowsMenu } from './Flows/FlowsMenu';
import { SettingsModal } from './SettingsModal';
import { MetadataToolbarItems } from './metadata/MetadataToolbarItems';
import { fetchDefaultNamespace, startDeployment } from '@kaoto/api';
import { LOCAL_STORAGE_UI_THEME_KEY, THEME_DARK_CLASS } from '@kaoto/constants';
import {
  useDeploymentStore,
  useFlowsStore,
  useIntegrationSourceStore,
  useSettingsStore,
} from '@kaoto/store';
import {
  AlertVariant,
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownSeparator,
  DropdownToggle,
  Icon,
  KebabToggle,
  OverflowMenu,
  OverflowMenuControl,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import {
  BarsIcon,
  BellIcon,
  CatalogIcon,
  CodeIcon,
  CubesIcon,
  ExternalLinkAltIcon,
  GithubIcon,
} from '@patternfly/react-icons';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';

export interface IKaotoToolbar {
  toggleCatalog: () => void;
  leftDrawerExpanded: boolean;
  toggleCodeEditor: () => void;
  hideLeftPanel: () => void;
}

export const KaotoToolbar = ({
  toggleCatalog,
  toggleCodeEditor,
  hideLeftPanel,
  leftDrawerExpanded,
}: IKaotoToolbar) => {
  const { currentDsl, settings, setSettings, deployable } = useSettingsStore(
    ({ settings, setSettings }) => ({
      settings,
      setSettings,
      currentDsl: settings.dsl.name,
      deployable: settings.dsl.deployable,
    }),
    shallow,
  );
  const { sourceCode, setSourceCode } = useIntegrationSourceStore((state) => state);
  const deleteAllFlows = useFlowsStore((state) => state.deleteAllFlows, shallow);
  const [isActiveButton, setIsActiveButton] = useState('');
  const htmlTagElement = document.documentElement;

  const { deployment, setDeploymentCrd } = useDeploymentStore();
  const [kebabIsOpen, setKebabIsOpen] = useState(false);
  const [appMenuIsOpen, setAppMenuIsOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const [expanded, setExpanded] = useState({
    aboutModal: false,
    appearanceModal: false,
    deploymentsModal: false,
    settingsModal: false,
  });

  const { addAlert } = useAlert() || {};

  // fetch default namespace from the API,
  useEffect(() => {
    fetchDefaultNamespace().then((data) => {
      const namespace = data.namespace;
      setSettings({ namespace });
    });
  }, []);

  // configure UI theme
  useEffect(() => {
    const uiTheme = localStorage.getItem(LOCAL_STORAGE_UI_THEME_KEY) ?? 'true';
    if (uiTheme === 'true') {
      htmlTagElement?.classList.remove(THEME_DARK_CLASS);
    } else {
      htmlTagElement?.classList.add(THEME_DARK_CLASS);
    }
  }, [settings.uiLightMode]);

  const handleDeployStartClick = () => {
    startDeployment(sourceCode, settings.name, settings.namespace)
      .then((res) => {
        setDeploymentCrd(res);

        addAlert &&
          addAlert({
            title: 'Deployment started',
            variant: AlertVariant.success,
            description: 'Your integration is deploying..',
          });
      })
      .catch((e) => {
        console.log('error deploying integration: ', e);
        addAlert &&
          addAlert({
            title: 'Deployment not started',
            variant: AlertVariant.warning,
            description: 'There was a problem deploying your integration. Please try again later.',
          });
      });
  };

  const onFocusAppMenu = () => {
    const element = document.getElementById('toggle-icon-only');
    element?.focus();
  };

  const onSelectAppMenu = () => {
    setAppMenuIsOpen(false);
    onFocusAppMenu();
  };

  const appMenuItems = [
    <DropdownItem
      key="deployments"
      description="Integrations that are currently running"
      icon={<CubesIcon />}
      onClick={() => {
        setExpanded({ ...expanded, deploymentsModal: !expanded.deploymentsModal });
      }}
    >
      Deployments
    </DropdownItem>,
    <DropdownItem
      key="integrations"
      component="button"
      icon={<BellIcon />}
      description="Your saved integrations"
      isDisabled
    >
      Integrations (coming soon)
    </DropdownItem>,
    <DropdownSeparator key="separator" />,
    <DropdownItem key="clusters" isDisabled>
      Clusters (coming soon)
    </DropdownItem>,
    <DropdownItem key="projects" component="button" isDisabled>
      Projects (coming soon)
    </DropdownItem>,
  ];

  const kebabItems = [
    <DropdownItem
      autoFocus
      key="about"
      data-testid="kaotoToolbar-kebab__about"
      onClick={() => {
        setExpanded({ ...expanded, aboutModal: !expanded.aboutModal });
      }}
    >
      About
    </DropdownItem>,
    <DropdownItem
      key="settings"
      data-testid={'kaotoToolbar-kebab__settings'}
      onClick={() => {
        setExpanded({ ...expanded, settingsModal: !expanded.settingsModal });
        hideLeftPanel();
      }}
    >
      Settings
    </DropdownItem>,
    <DropdownItem
      key="appearance"
      data-testid={'kaotoToolbar-kebab__appearance'}
      onClick={() => setExpanded({ ...expanded, appearanceModal: !expanded.appearanceModal })}
    >
      Appearance
    </DropdownItem>,
    <DropdownSeparator key="separator-01" />,
    <ExportCanvasToPng
      key="export"
      fileName={settings.name}
      onClick={() => {
        setKebabIsOpen(false);
      }}
    />,
    <DropdownSeparator key="separator-02" />,
    <DropdownItem
      key="tutorial"
      href="https://kaoto.io/workshop/"
      target="_blank"
      className="pf-u-display-flex pf-u-justify-content-space-between"
    >
      <span className="pf-u-mr-lg">Tutorial</span>
      <Icon isInline>
        <ExternalLinkAltIcon />
      </Icon>
    </DropdownItem>,
    <DropdownItem
      key="help"
      href="https://kaoto.io/docs/"
      target="_blank"
      className="pf-u-display-flex pf-u-justify-content-space-between"
    >
      <span className="pf-u-mr-lg">Help</span>
      <Icon isInline>
        <ExternalLinkAltIcon />
      </Icon>
    </DropdownItem>,
    <DropdownItem
      key="feedback"
      href="https://github.com/KaotoIO/kaoto-ui/issues/new/choose"
      target="_blank"
      className="pf-u-display-flex pf-u-justify-content-space-between"
    >
      <span className="pf-u-mr-lg">Feedback</span>
      <Icon isInline>
        <GithubIcon />
      </Icon>
    </DropdownItem>,
    <DropdownSeparator key="separator-03" />,
    <DropdownItem key="delete" component="button" onClick={() => setIsConfirmationModalOpen(true)}>
      Delete
    </DropdownItem>,
  ];

  return (
    <>
      <Toolbar className={'viz-toolbar'} data-testid={'viz-toolbar'}>
        <ToolbarContent>
          <img data-testid="kaoto-logo" src={logo} alt="Kaoto Logo" style={{ height: '30px' }} />

          {/* APP MENU */}
          <ToolbarItem>
            <Dropdown
              onSelect={onSelectAppMenu}
              toggle={
                <DropdownToggle
                  toggleIndicator={null}
                  onToggle={(e) => setAppMenuIsOpen(e)}
                  aria-label="Applications"
                  id="toggle-icon-only"
                >
                  <BarsIcon />
                </DropdownToggle>
              }
              isOpen={appMenuIsOpen}
              isPlain
              dropdownItems={appMenuItems}
            />
          </ToolbarItem>

          <ToolbarItem variant="separator" />

          {/* STEP CATALOG BUTTON */}
          <ToolbarItem>
            <Tooltip content={<div>Step Catalog</div>} position="bottom">
              <Button
                tabIndex={0}
                variant="link"
                isActive={isActiveButton == 'toolbar-step-catalog-btn' && leftDrawerExpanded}
                data-testid="toolbar-step-catalog-btn"
                icon={<CatalogIcon />}
                onClick={() => {
                  toggleCatalog();
                  setIsActiveButton('toolbar-step-catalog-btn');
                }}
              >
                Catalog
              </Button>
            </Tooltip>
          </ToolbarItem>

          {/* CODE TOGGLE BUTTON */}
          <ToolbarItem>
            <Tooltip content={<div>Source Code</div>} position="bottom">
              <Button
                variant="link"
                isActive={isActiveButton == 'toolbar-show-code-btn' && leftDrawerExpanded}
                data-testid="toolbar-show-code-btn"
                onClick={() => {
                  toggleCodeEditor();
                  setIsActiveButton('toolbar-show-code-btn');
                }}
                icon={<CodeIcon />}
              >
                Source
              </Button>
            </Tooltip>
          </ToolbarItem>

          <ToolbarItem variant="separator" />

          {/* CURRENT DSL */}
          <ToolbarItem>
            <Chip data-testid="toolbar-current-dsl" isReadOnly>
              {currentDsl || 'None'}
            </Chip>
          </ToolbarItem>

          {/* NEW FLOW DROPDOWN BUTTON */}
          <ToolbarItem>
            <NewFlow />
          </ToolbarItem>

          {/* FLOWS LIST DROPDOWN BUTTON */}
          <ToolbarItem>
            <FlowsMenu />
          </ToolbarItem>

          <ToolbarItem variant="separator" />

          <MetadataToolbarItems />

          {/* DEPLOYMENT STATUS */}
          {deployment.crd ? (
            <ToolbarItem alignment={{ default: 'alignRight' }}>
              <div className="status-container" data-testid="toolbar-deployment-status">
                <div className="dot"></div>
                <div className="text">Running</div>
              </div>
            </ToolbarItem>
          ) : (
            <ToolbarItem alignment={{ default: 'alignRight' }}></ToolbarItem>
          )}

          {deployment.crd && <ToolbarItem variant="separator" />}

          {/* DEPLOY BUTTON */}
          {deployable && (
            <ToolbarItem>
              <Tooltip content={<div>Deploy</div>} position={'bottom'}>
                <Button
                  tabIndex={0}
                  variant="primary"
                  data-testid={'toolbar-deploy-start-btn'}
                  onClick={handleDeployStartClick}
                >
                  Deploy
                </Button>
              </Tooltip>
            </ToolbarItem>
          )}

          {/* KEBAB DROPDOWN MENU */}
          <ToolbarItem variant="overflow-menu">
            <OverflowMenu breakpoint="2xl">
              <OverflowMenuControl hasAdditionalOptions>
                <Dropdown
                  position={DropdownPosition.right}
                  toggle={
                    <KebabToggle
                      data-testid="toolbar-kebab-dropdown-toggle"
                      onToggle={(val) => {
                        setKebabIsOpen(val);
                      }}
                    />
                  }
                  isOpen={kebabIsOpen}
                  isPlain
                  data-testid="toolbar-kebab-dropdown-btn"
                  dropdownItems={kebabItems}
                />
              </OverflowMenuControl>
            </OverflowMenu>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <ConfirmationModal
        handleCancel={() => {
          setIsConfirmationModalOpen(false);
        }}
        handleConfirm={() => {
          /** Delete all flows */
          deleteAllFlows();
          setSourceCode('');

          /** TODO: Check whether this configuration is required to be kept inside of settingsStore */
          setSettings({ namespace: 'default' });
          setIsConfirmationModalOpen(false);
        }}
        isModalOpen={isConfirmationModalOpen}
      >
        <p>
          This will clear the whole canvas and settings, and you will lose your current work. Are
          you sure you would like to proceed?
        </p>
      </ConfirmationModal>

      <DeploymentsModal
        handleCloseModal={() => {
          setExpanded({ ...expanded, deploymentsModal: !expanded.deploymentsModal });
        }}
        isModalOpen={expanded.deploymentsModal ?? false}
      />

      {expanded.settingsModal && (
        <SettingsModal
          handleCloseModal={() => {
            setExpanded({ ...expanded, settingsModal: !expanded.settingsModal });
          }}
          isModalOpen={expanded.settingsModal}
        />
      )}

      <AppearanceModal
        handleCloseModal={() => {
          {
            setExpanded({ ...expanded, appearanceModal: !expanded.appearanceModal });
          }
        }}
        isModalOpen={expanded.appearanceModal ?? false}
      />

      <AboutModal
        handleCloseModal={() => {
          setExpanded({ ...expanded, aboutModal: false });
        }}
        isModalOpen={expanded.aboutModal}
      />
    </>
  );
};
