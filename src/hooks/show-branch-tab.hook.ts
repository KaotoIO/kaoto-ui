import { StepsService, ValidationService, VisualizationService } from '@kaoto/services';
import { IStepProps, IViewProps } from '@kaoto/types';
import { useEffect, useState } from 'react';

export const useShowBranchTab = (step: IStepProps, views: IViewProps[]) => {
  const supportsBranching = StepsService.supportsBranching(step);

  const [hasCustomStepExtension, setHasCustomStepExtension] = useState(
    StepsService.hasCustomStepExtension(step, views)
  );

  const [disableBranchesTab, setDisableBranchesTab] = useState(false);
  const [disableBranchesTabMsg, setDisableBranchesTabMsg] = useState('');

  useEffect(() => {
    setHasCustomStepExtension(StepsService.hasCustomStepExtension(step, views));
  }, [step, views]);

  useEffect(() => {
    const showBranchesTab = VisualizationService.showBranchesTab(step);
    setDisableBranchesTab(hasCustomStepExtension || !showBranchesTab || !supportsBranching);
  }, [step, hasCustomStepExtension, supportsBranching]);

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
  }, [hasCustomStepExtension, step, supportsBranching]);

  return { disableBranchesTab, disableBranchesTabMsg };
};
