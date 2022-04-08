import { Button, Tooltip } from '@patternfly/react-core';
import { CodeIcon, CogIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { IExpanded } from '../pages/Dashboard';
import './KaotoToolbar.css';

export interface IKaotoToolbar {
  expanded: IExpanded;
  handleDeploy: (integration: any) => void;
  handleExpanded: (newState: IExpanded) => void;
}

export const KaotoToolbar = ({ expanded, handleDeploy, handleExpanded }: IKaotoToolbar) => {
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
          <PlusCircleIcon width={40} height={40} />
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
          <CodeIcon width={40} height={40} />
        </Button>
      </Tooltip>
      <Tooltip content={'Deploy'}>
        <Button
          variant={'plain'}
          data-testid={'deployButton'}
          isActive={expanded.catalog}
          aria-label={'Deploy'}
          onClick={() => {
            handleDeploy({});
          }}
        >
          <PlusCircleIcon width={40} height={40} />
        </Button>
      </Tooltip>
      <Tooltip content={'Settings'}>
        <Button
          variant={'plain'}
          data-testid={'settingsButton'}
          aria-label={'Settings'}
          onClick={() => {
            handleExpanded({ settingsModal: !expanded.settingsModal });
          }}
        >
          <CogIcon width={40} height={40} />
        </Button>
      </Tooltip>
    </div>
  );
};
