import { canBeDeployed } from '../utils/validationService';
import { AlertVariant, Button, Tooltip } from '@patternfly/react-core';
import {
  CodeIcon,
  CogIcon,
  PauseCircleIcon,
  PlayIcon,
  PlusCircleIcon,
} from '@patternfly/react-icons';
import { IExpanded } from '../pages/Dashboard';
import './KaotoToolbar.css';
import { startDeployment, stopDeployment, useStepsAndViewsContext, useYAMLContext } from '../api';
import { ISettings } from '../types';
import { useAlert } from '@rhoas/app-services-ui-shared';

export interface IKaotoToolbar {
  expanded: IExpanded;
  handleExpanded: (newState: IExpanded) => void;
  settings: ISettings;
}

export const KaotoToolbar = ({ expanded, handleExpanded, settings }: IKaotoToolbar) => {
  const [, setYAMLData] = useYAMLContext();
  const [viewData] = useStepsAndViewsContext();

  const { addAlert } = useAlert() || {};

  const handleStartDeployment = () => {
    startDeployment(settings.dsl, viewData.steps, settings.integrationName, settings.namespace)
      .then((res) => {
        setYAMLData(res);

        addAlert &&
          addAlert({
            title: 'Deployment started',
            variant: AlertVariant.success,
            description: 'Your integration is deploying..',
          });
      })
      .catch((error) => {
        console.log('error deploying.. ', error);

        addAlert &&
          addAlert({
            title: 'Deployment not started',
            variant: AlertVariant.warning,
            description: 'There was a problem deploying your integration. Please try again later.',
          });
      });
  };

  const handleStopDeployment = () => {
    console.log('stopping deployment..');

    stopDeployment(settings.integrationName)
      .then((res) => {
        console.log('stop deployment response: ', res);

        addAlert &&
          addAlert({
            title: 'Stop deployment',
            variant: AlertVariant.success,
            description: 'Stopping deployment..',
          });
      })
      .catch((error) => {
        console.log('error stopping deployment.. ', error);
        console.error(error);

        addAlert &&
          addAlert({
            title: 'Stop deployment',
            variant: AlertVariant.success,
            description: 'There was a problem stopping your deployment. Please try again later.',
          });
      });
  };

  return (
    <div className={'kaotoToolbar__button'} data-testid={'kaotoToolbar'}>
      <Tooltip content={'Connector Catalog'}>
        <Button
          variant={'plain'}
          data-testid={'openCatalogButton'}
          isActive={expanded.catalog}
          aria-label={'Connector Catalog'}
          onClick={() => {
            handleExpanded({ catalog: !expanded.catalog });
          }}
        >
          <PlusCircleIcon width={35} height={35} />
        </Button>
      </Tooltip>
      <Tooltip content={'Code Editor'}>
        <Button
          variant={'plain'}
          isActive={expanded.codeEditor}
          data-testid={'openEditorButton'}
          aria-label={'Code Editor'}
          onClick={() => {
            handleExpanded({ codeEditor: !expanded.codeEditor });
          }}
        >
          <CodeIcon width={35} height={35} />
        </Button>
      </Tooltip>
      {canBeDeployed() && (
        <Tooltip content={'Deploy'}>
          <Button
            variant={'plain'}
            data-testid={'deployButton'}
            isActive={expanded.catalog}
            aria-label={'Deploy'}
            onClick={() => {
              // handleDeployStart();
              handleStartDeployment();
            }}
          >
            <PlayIcon width={35} height={35} />
          </Button>
        </Tooltip>
      )}
      {canBeDeployed() && (
        <Tooltip content={'Stop Deployment'}>
          <Button
            variant={'plain'}
            data-testid={'stopDeploymentButton'}
            isActive={expanded.catalog}
            aria-label={'Stop Deployment'}
            onClick={() => {
              // handleDeployStop();
              handleStopDeployment();
            }}
          >
            <PauseCircleIcon width={35} height={35} />
          </Button>
        </Tooltip>
      )}
      <Tooltip content={'Settings'}>
        <Button
          variant={'plain'}
          data-testid={'settingsButton'}
          aria-label={'Settings'}
          onClick={() => {
            handleExpanded({ settingsModal: !expanded.settingsModal });
          }}
        >
          <CogIcon width={35} height={35} />
        </Button>
      </Tooltip>
    </div>
  );
};
