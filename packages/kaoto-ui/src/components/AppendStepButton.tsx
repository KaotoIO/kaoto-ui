import { BranchBuilder } from './BranchBuilder';
import { MiniCatalog } from './MiniCatalog';
import { useShowBranchTab } from '@kaoto/hooks';
import { StepsService, ValidationService } from '@kaoto/services';
import { useFlowsStore, useSettingsStore } from '@kaoto/store';
import { IStepProps } from '@kaoto/types';
import { Popover, Tooltip } from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { Position } from 'reactflow';
import { shallow } from 'zustand/shallow';

interface IAddStepButton {
  handleAddBranch: () => void;
  handleSelectStep: (selectedStep: IStepProps) => void;
  position: Position;
  step: IStepProps;
  showStepsTab: boolean;
}

export const AppendStepButton: FunctionComponent<IAddStepButton> = ({
  handleAddBranch,
  handleSelectStep,
  position,
  step,
  showStepsTab,
}) => {
  const currentDSL = useSettingsStore((state) => state.settings.dsl.name);
  const views = useFlowsStore((state) => state.views, shallow);
  const { disableBranchesTab, disableBranchesTabMsg } = useShowBranchTab(step, views);

  const [tooltipText, setTooltipText] = useState('');
  const [disableButton, setDisableButton] = useState(false);

  const stepsService = useMemo(() => new StepsService(), []);
  const followingStepId = stepsService.getFollowingStep(step)?.id;

  useEffect(() => {
    setDisableButton(!showStepsTab && disableBranchesTab);
  }, [showStepsTab, disableBranchesTab]);

  useEffect(() => {
    setTooltipText(ValidationService.getPlusButtonTooltipMsg(!disableBranchesTab, showStepsTab));
  }, [disableBranchesTab, showStepsTab]);

  return (
    <Popover
      id="popover-append-step"
      aria-label="Add a step or branch"
      bodyContent={
        <MiniCatalog
          disableBranchesTab={disableBranchesTab}
          disableBranchesTabMsg={disableBranchesTabMsg}
          disableStepsTab={!showStepsTab}
          disableStepsTabMsg="You can't add a step between a step and a branch."
          handleSelectStep={handleSelectStep}
          queryParams={{
            dsl: currentDSL,
            type: ValidationService.appendableStepTypes(step.type),
            previousStep: step.id,
            followingStep: followingStepId,
          }}
          step={step}
        >
          <BranchBuilder handleAddBranch={handleAddBranch} />
        </MiniCatalog>
      }
      className="miniCatalog__popover"
      data-testid="miniCatalog__popover"
      enableFlip
      flipBehavior={['top-start', 'left-start']}
      hasAutoWidth
      hideOnOutsideClick
      position="right-start"
      showClose={false}
    >
      <Tooltip content={tooltipText} position={position}>
        <button
          className="stepNode__Add plusButton nodrag"
          data-testid="stepNode__appendStep-btn"
          disabled={disableButton}
          aria-disabled={disableButton}
          data-disable-branchestab={disableBranchesTab}
          data-disable-stepstab={!showStepsTab}
        >
          <PlusIcon />
        </button>
      </Tooltip>
    </Popover>
  );
};
