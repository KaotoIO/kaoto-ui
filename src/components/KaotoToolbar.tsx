import {
  startDeployment,
  stopDeployment,
  useIntegrationJsonContext,
  useIntegrationSourceContext,
  useSettingsContext,
} from '../api';
import { IExpanded } from '../pages/Dashboard';
import { isNameValidCheck } from '../utils/validationService';
import { ConfirmationModal } from './ConfirmationModal';
import {
  AlertVariant,
  Button,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownSeparator,
  DropdownToggle,
  InputGroup,
  KebabToggle,
  OverflowMenu,
  OverflowMenuControl,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import {
  BellIcon,
  CatalogIcon,
  CheckIcon,
  CubesIcon,
  PencilAltIcon,
  PlayIcon,
  StopIcon,
  ThIcon,
  TimesIcon,
  TrashIcon,
} from '@patternfly/react-icons';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { useState } from 'react';

export interface IKaotoToolbar {
  deployment?: string;
  expanded: IExpanded;
  handleExpanded: (newState: IExpanded) => void;
  handleSaveDeployment: (newDeployment: any) => void;
}

export const KaotoToolbar = ({
  deployment,
  expanded,
  handleExpanded,
  handleSaveDeployment,
}: IKaotoToolbar) => {
  const [kebabIsOpen, setKebabIsOpen] = useState(false);
  const [appMenuIsOpen, setAppMenuIsOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [settings, setSettings] = useSettingsContext();
  const [localName, setLocalName] = useState(settings.name);
  const [, dispatch] = useIntegrationJsonContext();
  const [sourceCode] = useIntegrationSourceContext();
  const [nameValidation, setNameValidation] = useState<
    'default' | 'warning' | 'success' | 'error' | undefined
  >('default');

  const { addAlert } = useAlert() || {};

  const handleDeployStartClick = () => {
    try {
      startDeployment(sourceCode, settings.name, settings.namespace).then((res) => {
        handleSaveDeployment(res);

        addAlert &&
          addAlert({
            title: 'Deployment started',
            variant: AlertVariant.success,
            description: 'Your integration is deploying..',
          });
      });
    } catch (e) {
      console.log('error deploying.. ', e);

      addAlert &&
        addAlert({
          title: 'Deployment not started',
          variant: AlertVariant.warning,
          description: 'There was a problem deploying your integration. Please try again later.',
        });
    }
  };

  const handleDeployStopClick = () => {
    try {
      stopDeployment(settings.name).then((res) => {
        console.log('stop deployment response: ', res);

        addAlert &&
          addAlert({
            title: 'Stop deployment',
            variant: AlertVariant.success,
            description: 'Stopping deployment..',
          });
      });
    } catch (e) {
      console.error(e);

      addAlert &&
        addAlert({
          title: 'Stop deployment',
          variant: AlertVariant.success,
          description: 'There was a problem stopping your deployment. Please try again later.',
        });
    }
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
    <DropdownItem key="delete" component="button" onClick={() => setIsConfirmationModalOpen(true)}>
      Delete
    </DropdownItem>,
  ];

  return (
    <>
      <Toolbar className={'viz-toolbar'} data-testid={'viz-toolbar'}>
        <ToolbarContent>
          {/* App Menu */}
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

          {/* Delete/Clear Button */}
          <ToolbarItem>
            <Tooltip content={<div>Clear</div>} position={'bottom'}>
              <Button
                tabIndex={0}
                variant="link"
                data-testid={'toolbar-delete-btn'}
                icon={<TrashIcon />}
                onClick={() => {
                  // verify with user first
                  setIsConfirmationModalOpen(true);
                }}
              />
            </Tooltip>
          </ToolbarItem>

          {/* Step Catalog Button */}
          <ToolbarItem>
            <Tooltip content={<div>Step Catalog</div>} position={'bottom'}>
              <Button
                tabIndex={0}
                variant="link"
                data-testid={'toolbar-step-catalog-btn'}
                icon={<CatalogIcon />}
                onClick={() => handleExpanded({ catalog: !expanded.catalog, codeEditor: false })}
              />
            </Tooltip>
          </ToolbarItem>

          <ToolbarItem variant="separator" />

          {/* Name */}
          <ToolbarItem variant="label">
            {isEditingName ? (
              <InputGroup>
                <TextInput
                  name="edit-integration-name"
                  id="edit-integration-name"
                  type="text"
                  onChange={(val) => {
                    setLocalName(val);
                    if (isNameValidCheck(val)) {
                      setNameValidation('success');
                    } else {
                      setNameValidation('error');
                    }
                  }}
                  value={localName}
                  aria-label="edit integration name"
                  validated={nameValidation}
                  aria-invalid={nameValidation === 'error'}
                />
                <Button
                  variant="plain"
                  aria-label="save button for editing integration name"
                  onClick={() => {
                    if (isNameValidCheck(localName)) {
                      setIsEditingName(false);
                      setSettings({ ...settings, name: localName });
                    }
                  }}
                  aria-disabled={nameValidation === 'error'}
                  isDisabled={nameValidation === 'error'}
                >
                  <CheckIcon />
                </Button>
                <Button
                  variant="plain"
                  aria-label="close button for editing integration name"
                  onClick={() => {
                    setLocalName(settings.name);
                    setNameValidation('default');
                    setIsEditingName(false);
                  }}
                >
                  <TimesIcon />
                </Button>
              </InputGroup>
            ) : (
              <>
                {settings.name}&nbsp;&nbsp;
                <Button
                  variant={'link'}
                  onClick={() => {
                    setIsEditingName(true);
                  }}
                >
                  <PencilAltIcon />
                </Button>
              </>
            )}
          </ToolbarItem>

          {deployment ? (
            <ToolbarItem alignment={{ default: 'alignRight' }}>
              <div className="status-container" data-testid={'toolbar-deployment-status'}>
                <div className={`dot`}></div>
                <div className="text">Running</div>
              </div>
            </ToolbarItem>
          ) : (
            <ToolbarItem alignment={{ default: 'alignRight' }}></ToolbarItem>
          )}

          {deployment && <ToolbarItem variant="separator" />}

          <ToolbarItem>
            <Tooltip content={<div>Source Code</div>} position={'bottom'}>
              <Button
                variant={expanded.codeEditor ? 'primary' : 'secondary'}
                data-testid={'toolbar-show-code-btn'}
                onClick={() => handleExpanded({ codeEditor: !expanded.codeEditor, catalog: false })}
              >
                Code
              </Button>
            </Tooltip>
          </ToolbarItem>

          {!deployment ? (
            <ToolbarItem>
              <Tooltip content={<div>Deploy</div>} position={'bottom'}>
                <Button
                  tabIndex={0}
                  variant="link"
                  data-testid={'toolbar-deploy-start-btn'}
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
                  data-testid={'toolbar-deploy-stop-btn'}
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
                  data-testid={'toolbar-kebab-dropdown-btn'}
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
          dispatch({ type: 'DELETE_INTEGRATION', payload: null });
          setIsConfirmationModalOpen(false);
        }}
        isModalOpen={isConfirmationModalOpen}
        modalBody={
          'This will clear the whole canvas, and you will lose your current work. Are you sure you will' +
          ' like to proceed?'
        }
      />
    </>
  );
};
