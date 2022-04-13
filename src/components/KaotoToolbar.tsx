import { canBeDeployed } from '../utils/validationService';
import { Button, Tooltip } from '@patternfly/react-core';
import {
  CodeIcon,
  CogIcon,
  PauseCircleIcon,
  PlayIcon,
  PlusCircleIcon,
} from '@patternfly/react-icons';
import { IExpanded } from '../pages/Dashboard';
import './KaotoToolbar.css';
import { startDeployment, stopDeployment, useStepsAndViewsContext } from '../api';
import { ISettings } from '../types';

export interface IKaotoToolbar {
  expanded: IExpanded;
  handleExpanded: (newState: IExpanded) => void;
  settings: ISettings;
}

export const KaotoToolbar = ({ expanded, handleExpanded, settings }: IKaotoToolbar) => {
  const [viewData] = useStepsAndViewsContext();

  const handleStartDeployment = () => {
    console.log('deploying...');

    startDeployment(settings.dsl, viewData, settings.integrationName, settings.namespace)
      .then((res) => {
        console.log('deployment response: ', res);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleStopDeployment = () => {
    console.log('stopping deployment..');

    stopDeployment(settings.integrationName)
      .then((res) => {
        console.log('stop deployment response: ', res);
      })
      .catch((error) => {
        console.error(error);
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
