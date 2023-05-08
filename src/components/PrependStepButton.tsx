import { MiniCatalog } from './MiniCatalog';
import { StepsService, ValidationService } from '@kaoto/services';
import { useSettingsStore } from '@kaoto/store';
import { IStepProps } from '@kaoto/types';
import { Popover, Tooltip } from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import { FunctionComponent } from 'react';
import { Position } from 'reactflow';

interface IPrependStepButton {
  onMiniCatalogClickPrepend: (selectedStep: IStepProps) => void;
  position: Position;
  step: IStepProps;
  parentStepId?: string;
}

export const PrependStepButton: FunctionComponent<IPrependStepButton> = ({
  onMiniCatalogClickPrepend,
  position,
  step,
  parentStepId,
}) => {
  const currentDSL = useSettingsStore((state) => state.settings.dsl.name);

  const stepsService = new StepsService();
  const previousStepId = parentStepId ?? stepsService.getPreviousStep(step.UUID)?.id;

  return (
    <Popover
      id="popover-prepend-step"
      aria-label="Add a step"
      bodyContent={
        <MiniCatalog
          disableBranchesTab={true}
          disableBranchesTabMsg="You can't add a branch from here."
          disableStepsTab={false}
          handleSelectStep={onMiniCatalogClickPrepend}
          queryParams={{
            dsl: currentDSL,
            type: ValidationService.prependableStepTypes(),
            previousStep: previousStepId,
            followingStep: step?.id,
          }}
          step={step}
        />
      }
      className="miniCatalog__popover"
      data-testid="miniCatalog__popover"
      enableFlip={true}
      flipBehavior={['top-start', 'left-start']}
      hasAutoWidth
      hideOnOutsideClick={true}
      position="left-start"
      showClose={false}
    >
      <Tooltip content="Add a step" position={position}>
        <button
          className="stepNode__Prepend plusButton nodrag"
          data-testid="stepNode__prependStep-btn"
        >
          <PlusIcon />
        </button>
      </Tooltip>
    </Popover>
  );
};
