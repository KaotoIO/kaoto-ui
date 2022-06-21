import { StepsAndViewsProvider, YAMLProvider } from '../api';
import { Catalog, SettingsModal, Visualization } from '../components';
import { ISettings } from '../types';
import './layout.css';
import {
  AlertVariant,
  Button,
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  DropdownToggle,
  KebabToggle,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  OverflowMenu,
  OverflowMenuControl,
  Page,
  PageSection,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  DropdownPosition,
  Tooltip,
} from '@patternfly/react-core';
import {
  BellIcon, // CloneIcon,
  // CodeIcon,
  CubesIcon,
  PlayIcon,
  PlusCircleIcon, // StopIcon,
  // SyncIcon,
} from '@patternfly/react-icons';
import ThIcon from '@patternfly/react-icons/dist/esm/icons/th-icon';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { useState } from 'react';

export interface IExpanded {
  catalog?: boolean;
  codeEditor?: boolean;
  settingsModal?: boolean;
}

const LayoutOne = () => {
  const [expanded, setExpanded] = useState<IExpanded>({
    catalog: false,
    codeEditor: true,
    settingsModal: false,
  });
  const [settings, setSettings] = useState<ISettings>({
    dsl: 'KameletBinding',
    integrationName: 'integration',
    namespace: 'default',
  });
  const [kebabIsOpen, setKebabIsOpen] = useState(false);
  const [appMenuIsOpen, setAppMenuIsOpen] = useState(false);

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

  const onFocusAppMenu = () => {
    const element = document.getElementById('toggle-icon-only');
    element?.focus();
  };

  const onSelectAppMenu = () => {
    setAppMenuIsOpen(false);
    onFocusAppMenu();
  };

  const appMenuItems = [
    <DropdownItem key="link" description="This is a description" icon={<CubesIcon />}>
      Deployments
    </DropdownItem>,
    <DropdownItem
      key="action"
      component="button"
      icon={<BellIcon />}
      description="This is a description"
    >
      Connectors
    </DropdownItem>,
    <DropdownItem key="disabled link" isDisabled href="www.google.com">
      Enterprise Integration Patterns
    </DropdownItem>,
    <DropdownSeparator key="separator" />,
    <DropdownItem key="separated link" isDisabled>
      Clusters
    </DropdownItem>,
    <DropdownItem key="separated action" component="button" isDisabled>
      Projects
    </DropdownItem>,
  ];

  const kebabItems = [
    <DropdownItem key="settings">Settings</DropdownItem>,
    <DropdownItem key="tutorial">Tutorial</DropdownItem>,
    <DropdownItem key="help">Help</DropdownItem>,
    <DropdownItem key="feedback">Feedback</DropdownItem>,
    <DropdownSeparator key="separator" />,
    <DropdownItem key="delete" component="button">
      Delete
    </DropdownItem>,
  ];

  const firstRowItems = (
    <Toolbar className={'viz-toolbar'}>
      <ToolbarContent>
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
                <ThIcon />
              </DropdownToggle>
            }
            isOpen={appMenuIsOpen}
            isPlain
            dropdownItems={appMenuItems}
          />
        </ToolbarItem>

        <ToolbarItem variant="separator" />

        <ToolbarItem variant="label" id="stacked-example-resource-select">
          Integration Name
        </ToolbarItem>

        {/*<ToolbarItem variant="separator" />*/}

        {/*<ToolbarItem>*/}
        {/*  <Button variant="plain" aria-label="edit">*/}
        {/*    <CodeIcon />*/}
        {/*  </Button>*/}
        {/*</ToolbarItem>*/}

        <ToolbarItem>
          <Tooltip content={<div>Add a Step</div>} position={'bottom'}>
            <Button
              tabIndex={0}
              variant="link"
              icon={<PlusCircleIcon />}
              onClick={() => handleExpanded({ catalog: !expanded.catalog })}
            />
          </Tooltip>
        </ToolbarItem>

        <ToolbarItem alignment={{ default: 'alignRight' }}>
          <div className="status-container">
            <div className="dot"></div>
            <div className="text">Running</div>
          </div>
        </ToolbarItem>

        <ToolbarItem variant="separator" />

        <ToolbarItem>
          <Button variant="secondary">Code</Button>
        </ToolbarItem>

        <ToolbarItem>
          <Button variant="primary">Save</Button>
        </ToolbarItem>

        <ToolbarItem>
          <Tooltip content={<div>Deploy</div>} position={'bottom'}>
            <Button tabIndex={0} variant="link" icon={<PlayIcon />} />
          </Tooltip>
        </ToolbarItem>

        <ToolbarItem variant="overflow-menu">
          <OverflowMenu breakpoint="2xl">
            <OverflowMenuControl hasAdditionalOptions>
              <Dropdown
                onSelect={(_event: any, selection: any) => {
                  console.log('selection: ', selection);
                  // setResourceSelected(selection);
                  // setResourceIsExpanded(false);
                }}
                position={DropdownPosition.right}
                toggle={<KebabToggle onToggle={(val) => setKebabIsOpen(val)} />}
                isOpen={kebabIsOpen}
                isPlain
                dropdownItems={kebabItems}
              />
            </OverflowMenuControl>
          </OverflowMenu>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );

  return (
    <StepsAndViewsProvider initialState={{ steps: [], views: [] }}>
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
              <Page>
                <PageSection padding={{ default: 'noPadding' }}>
                  <>{firstRowItems}</>
                  <Visualization
                    settings={settings}
                    toggleCatalog={() => setExpanded({ ...expanded, catalog: !expanded.catalog })}
                  />
                </PageSection>
              </Page>
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
    </StepsAndViewsProvider>
  );
};

export { LayoutOne };
