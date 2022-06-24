import { IExpanded } from '../pages/Dashboard';
import { IDeployment, ISettings } from '../types';
import { canBeDeployed } from '../utils/validationService';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownSeparator,
  DropdownToggle,
  KebabToggle,
  OverflowMenu,
  OverflowMenuControl,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import {
  BellIcon,
  CubesIcon,
  PlayIcon,
  PlusCircleIcon,
  StopIcon,
  ThIcon,
} from '@patternfly/react-icons';
import { useState } from 'react';

export interface IKaotoToolbar {
  deployment?: IDeployment;
  expanded: IExpanded;
  handleExpanded: (newState: IExpanded) => void;
  handleStartDeploy: () => void;
  handleStopDeploy: () => void;
  settings: ISettings;
}

export const KaotoToolbar = ({
  deployment,
  expanded,
  handleExpanded,
  handleStartDeploy,
  handleStopDeploy,
  settings,
}: IKaotoToolbar) => {
  const [kebabIsOpen, setKebabIsOpen] = useState(false);
  const [appMenuIsOpen, setAppMenuIsOpen] = useState(false);

  const handleDeployStartClick = () => {
    handleStartDeploy();
  };

  const handleDeployStopClick = () => {
    handleStopDeploy();
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
        handleExpanded({ ...expanded, deploymentsModal: !expanded.deploymentsModal });
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
      key="settings"
      onClick={() => handleExpanded({ settingsModal: !expanded.settingsModal })}
    >
      Settings
    </DropdownItem>,
    <DropdownItem key="tutorial" isDisabled>
      Tutorial
    </DropdownItem>,
    <DropdownItem key="help" isDisabled>
      Help
    </DropdownItem>,
    <DropdownItem key="feedback" isDisabled>
      Feedback
    </DropdownItem>,
    <DropdownSeparator key="separator" />,
    <DropdownItem key="delete" component="button" isDisabled>
      Delete
    </DropdownItem>,
  ];

  return (
    <Toolbar className={'viz-toolbar'} data-testid={'viz-toolbar'}>
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
          {settings.integrationName ?? 'Integration'}
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
              onClick={() => handleExpanded({ catalog: !expanded.catalog, codeEditor: false })}
            />
          </Tooltip>
        </ToolbarItem>

        {deployment ? (
          <ToolbarItem alignment={{ default: 'alignRight' }}>
            <div className="status-container">
              <div className={`dot-${deployment.status}`}></div>
              <div className="text">{deployment.status}</div>
            </div>
          </ToolbarItem>
        ) : (
          <ToolbarItem alignment={{ default: 'alignRight' }}>
            <div className="status-container">
              <div className="dot"></div>
              <div className="text">Running</div>
            </div>
          </ToolbarItem>
        )}

        <ToolbarItem variant="separator" />

        <ToolbarItem>
          <Button
            variant="secondary"
            data-testid={'show-code-button'}
            onClick={() => handleExpanded({ codeEditor: !expanded.codeEditor, catalog: false })}
          >
            Code
          </Button>
        </ToolbarItem>

        <ToolbarItem>
          <Button variant="primary" onClick={() => alert('YAY')} isDisabled>
            Save
          </Button>
        </ToolbarItem>

        {canBeDeployed() ? (
          <ToolbarItem>
            <Tooltip content={<div>Deploy</div>} position={'bottom'}>
              <Button
                tabIndex={0}
                variant="link"
                icon={<PlayIcon />}
                onClick={handleDeployStartClick}
              />
            </Tooltip>
          </ToolbarItem>
        ) : (
          <ToolbarItem>
            <Tooltip content={<div>Stop</div>} position={'bottom'}>
              <Button
                tabIndex={0}
                variant="link"
                icon={<StopIcon />}
                onClick={handleDeployStopClick}
                isDisabled={true}
              />
            </Tooltip>
          </ToolbarItem>
        )}

        <ToolbarItem variant="overflow-menu">
          <OverflowMenu breakpoint="2xl">
            <OverflowMenuControl hasAdditionalOptions>
              <Dropdown
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
};
