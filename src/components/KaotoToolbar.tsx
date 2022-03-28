import {
  Button,
  Tooltip,
} from '@patternfly/react-core';
import { CodeIcon, CogIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { IExpanded } from "../pages/Dashboard";

export interface IKaotoToolbar {
  expanded: IExpanded;
  handleExpanded: (newState: IExpanded) => void;
}

export const KaotoToolbar = ({ expanded, handleExpanded }: IKaotoToolbar) => {
  return (
    <div className={'step-creator-button'}>
      <Tooltip content={'Connector Catalog'}>
        <Button
          variant={'plain'}
          data-testid={'openCatalogButton'}
          isActive={expanded.catalog}
          aria-label={'Connector Catalog'}
          onClick={() => {
            handleExpanded({catalog: !expanded.catalog});
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
            handleExpanded({ ...expanded, codeEditor: !expanded.codeEditor });
          }}
        >
          <CodeIcon width={40} height={40} />
        </Button>
      </Tooltip>
      <Tooltip content={'Deploy'}>
        <Button
          variant={'plain'}
          // isActive={expanded.codeEditor}
          data-testid={'typeButton'}
          aria-label={'Type'}
          onClick={() => {
            console.log('clicked!');
          }}
        >
          <CogIcon width={40} height={40} />
        </Button>
      </Tooltip>
    </div>
  );
};
