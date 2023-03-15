import { BranchBuilder } from './BranchBuilder';
import { MiniCatalog } from './MiniCatalog';
import { StepsService, ValidationService } from '@kaoto/services';
import { useIntegrationJsonStore, useSettingsStore } from '@kaoto/store';
import { IStepProps } from '@kaoto/types';
import { Popover, Tooltip } from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import { FunctionComponent, useEffect, useState } from 'react';

interface IAddStepButton {
  handleAddBranch: () => void;
  handleSelectStep: (selectedStep: IStepProps) => void;
  layout: string;
  step: IStepProps;
  showBranchesTab: boolean;
  showStepsTab: boolean;
  supportsBranching: boolean;
}

export const AppendStepButton: FunctionComponent<IAddStepButton> = ({
  handleAddBranch,
  handleSelectStep,
  layout,
  step,
  showBranchesTab,
  showStepsTab,
  supportsBranching,
}) => {
  const currentDSL = useSettingsStore((state) => state.settings.dsl.name);
  const views = useIntegrationJsonStore((state) => state.views);
  const [hasCustomStepExtension, setHasCustomStepExtension] = useState(
    StepsService.hasCustomStepExtension(step, views)
  );
  const [disableBranchesTabMsg, setDisableBranchesTabMsg] = useState('');

  useEffect(() => {
    setHasCustomStepExtension(StepsService.hasCustomStepExtension(step, views));
  }, [step, views]);

  useEffect(() => {
    if (hasCustomStepExtension) {
      setDisableBranchesTabMsg('Please click on the step to configure branches for it.');
      return;
    }

    setDisableBranchesTabMsg(
      ValidationService.getBranchTabTooltipMsg(
        supportsBranching,
        step.maxBranches,
        step.branches?.length
      )
    );
  }, [hasCustomStepExtension, step, supportsBranching, views]);

  return (
    <Popover
      id="popover-append-step"
      aria-label="Add a step or branch"
      bodyContent={
        <MiniCatalog
          disableBranchesTab={hasCustomStepExtension || !showBranchesTab}
          disableBranchesTabMsg={disableBranchesTabMsg}
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
        position={layout === 'LR' ? 'top' : 'right'}
      >
        <button
          className={`${
            layout === 'LR' ? 'stepNode__Add' : 'stepNode__Add--vertical'
          } plusButton nodrag`}
          data-testid="stepNode__appendStep-btn"
        >
          <PlusIcon />
        </button>
      </Tooltip>
    </Popover>
  );
};
