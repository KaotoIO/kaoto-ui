import { useShowBranchTab } from '@kaoto/hooks';
import { ValidationService } from '@kaoto/services';
import { useIntegrationJsonStore, useSettingsStore } from '@kaoto/store';
import { IStepProps } from '@kaoto/types';
import { Popover, Tooltip } from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import { FunctionComponent, useEffect, useState } from 'react';
import { BranchBuilder } from './BranchBuilder';
import { MiniCatalog } from './MiniCatalog';

interface IAddStepButton {
  handleAddBranch: () => void;
  handleSelectStep: (selectedStep: IStepProps) => void;
  layout: string;
  step: IStepProps;
  showStepsTab: boolean;
}

export const AppendStepButton: FunctionComponent<IAddStepButton> = ({
  handleAddBranch,
  handleSelectStep,
  layout,
  step,
  showStepsTab,
}) => {
  const currentDSL = useSettingsStore((state) => state.settings.dsl.name);
  const views = useIntegrationJsonStore((state) => state.views);
  const { disableBranchesTab, disableBranchesTabMsg } = useShowBranchTab(step, views);

  const [tooltipText, setTooltipText] = useState('');
  const [disableButton, setDisableButton] = useState(false);

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
      <Tooltip
        content={tooltipText}
        position={layout === 'LR' ? 'top' : 'right'}
      >
        <button
          className={`${layout === 'LR' ? 'stepNode__Add' : 'stepNode__Add--vertical'
            } plusButton nodrag`}
          data-testid="stepNode__appendStep-btn"
          disabled={disableButton}
          aria-disabled={disableButton}
        >
          <PlusIcon />
        </button>
      </Tooltip>
    </Popover>
  );
};
