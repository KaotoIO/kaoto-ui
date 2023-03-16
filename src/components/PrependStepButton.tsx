import { Popover, Tooltip } from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import { FunctionComponent } from 'react';
import { ValidationService } from '@kaoto/services';
import { useSettingsStore } from '@kaoto/store';
import { IStepProps } from '@kaoto/types';
import { BranchBuilder } from './BranchBuilder';
import { MiniCatalog } from './MiniCatalog';

interface IPrependStepButton {
  handleAddBranch: () => void;
  onMiniCatalogClickPrepend: (selectedStep: IStepProps) => void;
  layout: string;
  step: IStepProps;
  showStepsTab: boolean;
}

export const PrependStepButton: FunctionComponent<IPrependStepButton> = ({
  handleAddBranch,
  onMiniCatalogClickPrepend,
  layout,
  step,
  showStepsTab,
}) => {
  const currentDSL = useSettingsStore((state) => state.settings.dsl.name);

  return (
    <Popover
    id="popover-prepend-step"
    appendTo={() => document.body}
    aria-label="Add a step"
    bodyContent={
      <MiniCatalog
        children={<BranchBuilder handleAddBranch={handleAddBranch} />}
        disableBranchesTab={true}
        disableBranchesTabMsg={"You can't add a branch from here."}
        disableStepsTab={false}
        handleSelectStep={onMiniCatalogClickPrepend}
        queryParams={{
          dsl: currentDSL,
          type: ValidationService.prependableStepTypes(),
        }}
        step={step}
      />
    }
    className={'miniCatalog__popover'}
    data-testid={'miniCatalog__popover'}
    enableFlip={true}
    flipBehavior={['top-start', 'left-start']}
    hasAutoWidth
    hideOnOutsideClick={true}
    position={'left-start'}
    showClose={false}
  >
    <Tooltip
      content={ValidationService.getPlusButtonTooltipMsg(false, showStepsTab)}
      position={layout === 'LR' ? 'top' : 'right'}
    >
      <button
        className={`${
          layout === 'LR'
            ? 'stepNode__Prepend'
            : 'stepNode__Prepend--vertical'
        } plusButton nodrag`}
        data-testid={'stepNode__prependStep-btn'}
      >
        <PlusIcon />
      </button>
    </Tooltip>
  </Popover>
  )
};
