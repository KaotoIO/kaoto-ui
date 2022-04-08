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

export interface IKaotoToolbar {
  expanded: IExpanded;
  handleDeployStart?: () => void;
  handleDeployStop?: () => void;
  handleExpanded: (newState: IExpanded) => void;
}

export const KaotoToolbar = ({
  expanded,
  handleDeployStart,
  handleDeployStop,
  handleExpanded,
}: IKaotoToolbar) => {
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
      {handleDeployStart && (
        <Tooltip content={'Deploy'}>
          <Button
            variant={'plain'}
            data-testid={'deployButton'}
            isActive={expanded.catalog}
            aria-label={'Deploy'}
            onClick={() => {
              handleDeployStart();
            }}
          >
            <PlayIcon width={35} height={35} />
          </Button>
        </Tooltip>
      )}
      {handleDeployStop && (
        <Tooltip content={'Stop Deployment'}>
          <Button
            variant={'plain'}
            data-testid={'stopDeploymentButton'}
            isActive={expanded.catalog}
            aria-label={'Stop Deployment'}
            onClick={() => {
              handleDeployStop();
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
