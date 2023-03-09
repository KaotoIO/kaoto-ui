import { ValidationService } from '@kaoto/services';
import { useSettingsStore } from '@kaoto/store';
import { IStepProps } from '@kaoto/types';
import { Popover, Tooltip } from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import { FunctionComponent } from 'react';
import { BranchBuilder } from './BranchBuilder';
import { MiniCatalog } from './MiniCatalog';

interface IAddStepButton {
  handleAddBranch: () => void;
  handleSelectStep: (selectedStep: IStepProps) => void;
  step: IStepProps;
  showBranchesTab: boolean;
  showStepsTab: boolean;
  supportsBranching: boolean;
}

export const AddStepButton: FunctionComponent<IAddStepButton> = ({
  handleAddBranch,
  handleSelectStep,
  step,
  showBranchesTab,
  showStepsTab,
  supportsBranching,
}) => {
  const currentDSL = useSettingsStore((state) => state.settings.dsl.name);

  return (
    <Popover
      id="popover-append-step"
      aria-label="Add a step or branch"
      bodyContent={
        <MiniCatalog
          disableBranchesTab={!showBranchesTab}
          disableBranchesTabMsg={ValidationService.getBranchTabTooltipMsg(
            supportsBranching,
            step.maxBranches,
            step.branches?.length
          )}
          disableStepsTab={!showStepsTab}
          disableStepsTabMsg="You can't add a step between a step and a branch."
          handleSelectStep={handleSelectStep}
          queryParams={{
            dsl: currentDSL,
            type: ValidationService.appendableStepTypes(step.type),
          }}
          step={step}
        >
          <BranchBuilder handleAddBranch={handleAddBranch} />
        </MiniCatalog>
      }
      className="miniCatalog__popover"
      data-testid="miniCatalog__popover"
      enableFlip={true}
      flipBehavior={['top-start', 'left-start']}
      hasAutoWidth
      hideOnOutsideClick={true}
      position="right-start"
      showClose={false}
    >
      <Tooltip
        content={ValidationService.getPlusButtonTooltipMsg(showBranchesTab, showStepsTab)}
      >
        <button
          className="stepNode__Add plusButton nodrag"
          data-testid="stepNode__appendStep-btn"
        >
          <PlusIcon />
        </button>
      </Tooltip>
    </Popover>
  );
}
