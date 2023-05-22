import { AppendStepButton } from './AppendStepButton';
import { BranchBuilder } from './BranchBuilder';
import { PrependStepButton } from './PrependStepButton';
import './Visualization.css';
import { MiniCatalog } from '@kaoto/components';
import { usePosition } from '@kaoto/hooks';
import { StepsService, VisualizationService } from '@kaoto/services';
import { useSettingsStore, useVisualizationStore } from '@kaoto/store';
import { IStepProps, IVizStepNodeData } from '@kaoto/types';
import { AlertVariant, Popover, Tooltip } from '@patternfly/react-core';
import { CubesIcon, MinusIcon } from '@patternfly/react-icons';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { Handle, NodeProps } from 'reactflow';

const currentDSL = useSettingsStore.getState().settings.dsl.name;

// Custom Node type and component for React Flow
const VisualizationStep = ({ data }: NodeProps<IVizStepNodeData>) => {
  const endStep = StepsService.isEndStep(data.step!);
  const visualizationStore = useVisualizationStore();
  const visualizationService = new VisualizationService();
  const stepsService = new StepsService();
  const showBranchesTab = VisualizationService.showBranchesTab(data.step);
  const showStepsTab = VisualizationService.showStepsTab(data);
  const supportsBranching = StepsService.supportsBranching(data.step);
  const parentStepId = data.branchInfo?.parentStepUuid
    ? stepsService.findStepWithUUID(data.step.integrationId, data.branchInfo.parentStepUuid)?.id
    : undefined;

  const {
    layoutCssClass,
    plusIconPosition,
    minusIconPosition,
    leftHandlePosition,
    rightHandlePosition,
  } = usePosition();

  const { addAlert } = useAlert() || {};

  const onMiniCatalogClickAppend = (selectedStep: IStepProps) => {
    stepsService.handleAppendStep(data.step, selectedStep);
  };

  const replacePlaceholderStep = (stepC: IStepProps) => {
    stepsService.replacePlaceholderStep(data, stepC).then((validation) => {
      !validation?.isValid &&
        addAlert &&
        addAlert({
          title: 'Add Step Unsuccessful',
          dataTestId: 'alert-box-add-unsuccessful',
          variant: AlertVariant.danger,
          description: validation.message ?? 'Something went wrong, please try again later.',
        });
    });
  };

  const onMiniCatalogClickAdd = (stepC: IStepProps) => {
    replacePlaceholderStep(stepC);
  };

  const onMiniCatalogClickPrepend = (selectedStep: IStepProps): void => {
    stepsService.handlePrependStep(data.step.integrationId, data.step, selectedStep);
  };

  const handleAddBranch = () => {
    stepsService.addBranch(data.step, { branchUuid: '', identifier: '', steps: [] });
  };

  const handleTrashClick = () => {
    data.handleDeleteStep && data.handleDeleteStep(data.step.integrationId, data.step.UUID);
  };

  /**
   * Handles dropping a step onto a slot
   * @param e
   */
  const onDropNew = (e: { dataTransfer: { getData: (arg0: string) => any } }) => {
    const dataJSON = e.dataTransfer.getData('text');
    const stepC: IStepProps = JSON.parse(dataJSON);
    replacePlaceholderStep(stepC);
  };

  /**
   * Handles dropping a step onto an existing step (i.e. step replacement)
   */
  const onDropReplace = (event: any) => {
    event.preventDefault();

    const dataJSON = event.dataTransfer.getData('text');
    const stepC: IStepProps = JSON.parse(dataJSON);
    stepsService.handleDropOnExistingStep(data, data.step, stepC).then((validation) => {
      !validation.isValid &&
        addAlert &&
        addAlert({
          title: 'Replace Step Unsuccessful',
          dataTestId: 'alert-box-replace-unsuccessful',
          variant: AlertVariant.danger,
          description: validation.message ?? 'Something went wrong, please try again later.',
        });
    });
  };

  const getSelectedClass = (): string => {
    return VisualizationService.getNodeClass(
      visualizationStore.selectedStepUuid,
      data.step.UUID,
      ' stepNode__Selected'
    );
  };

  const getHoverClass = (): string => {
    return VisualizationService.getNodeClass(
      visualizationStore.hoverStepUuid,
      data.branchInfo?.rootStepUuid ?? data.step.UUID,
      ' stepNode__Hover'
    );
  };

  return (
    <>
      {!data.isPlaceholder ? (
        <div
          className={
            `stepNode stepNode--${layoutCssClass} stepNode__clickable` +
            getSelectedClass() +
            getHoverClass()
          }
          onDrop={onDropReplace}
          onMouseEnter={() => {
            if (data.branchInfo || supportsBranching) {
              visualizationStore.setHoverStepUuid(data.branchInfo?.rootStepUuid ?? data.step.UUID);
            } else {
              visualizationStore.setHoverStepUuid(data.step.UUID);
            }
          }}
          onMouseLeave={() => visualizationStore.setHoverStepUuid('')}
          data-testid={`viz-step-${data.step.name}`}
        >
          {/* PREPEND STEP BUTTON */}
          {visualizationService.showPrependStepButton(data) && (
            <PrependStepButton
              onMiniCatalogClickPrepend={onMiniCatalogClickPrepend}
              position={plusIconPosition}
              step={data.step}
              parentStepId={parentStepId}
            />
          )}

          {/* LEFT-SIDE HANDLE FOR EDGE TO CONNECT WITH */}
          {!StepsService.isStartStep(data.step) && (
            <Handle
              className={'stepHandle'}
              isConnectable={false}
              type="target"
              position={leftHandlePosition}
              id="a"
            />
          )}

          {/* DELETE STEP BUTTON */}
          <Tooltip content={'Delete step'} position={minusIconPosition}>
            <button
              className="stepNode__Delete trashButton nodrag"
              data-testid={'configurationTab__deleteBtn'}
              onClick={handleTrashClick}
            >
              <MinusIcon />
            </button>
          </Tooltip>

          {/* VISUAL REPRESENTATION OF STEP WITH ICON */}
          <div className={'stepNode__Icon stepNode__clickable'}>
            <img src={data.step.icon} alt={data.label} />
          </div>
          {/* STEP LABEL */}
          <div className={'stepNode__Label'}>
            <span className={'stepNode__clickable'}>{data.label}</span>
          </div>
          {/* RIGHT-SIDE HANDLE FOR EDGE TO CONNECT WITH */}
          {!StepsService.isEndStep(data.step) && (
            <Handle
              className={'stepHandle'}
              isConnectable={false}
              type="source"
              position={rightHandlePosition}
              id="b"
            />
          )}

          {/* ADD/APPEND STEP BUTTON */}
          {VisualizationService.showAppendStepButton(data, endStep) && (
            <AppendStepButton
              handleAddBranch={handleAddBranch}
              handleSelectStep={onMiniCatalogClickAppend}
              position={plusIconPosition}
              step={data.step}
              showStepsTab={showStepsTab}
            />
          )}
        </div>
      ) : (
        <Popover
          id="popover-add-step"
          appendTo={() => document.body}
          aria-label="Add a step"
          bodyContent={
            <MiniCatalog
              children={<BranchBuilder handleAddBranch={handleAddBranch} />}
              disableBranchesTab={!showBranchesTab}
              disableBranchesTabMsg={"This step doesn't support branching."}
              disableStepsTab={!showStepsTab}
              handleSelectStep={onMiniCatalogClickAdd}
              queryParams={{
                dsl: currentDSL,
                type: data.step.type,
                previousStep: parentStepId,
              }}
              step={data.step}
            />
          }
          className={'miniCatalog__popover'}
          data-testid={'miniCatalog__popover'}
          enableFlip={true}
          flipBehavior={['top-start', 'left-start']}
          hasAutoWidth
          hideOnOutsideClick={true}
          position={'right-start'}
        >
          <div
            className={'stepNode stepNode__Slot stepNode__clickable'}
            onDrop={onDropNew}
            data-testid={'viz-step-slot'}
          >
            {/* PLACEHOLDER HINT FOR EMPTY STATE */}
            {VisualizationService.isFirstAndOnlyNode(data) && (
              <div className={'nodeHintWrapper'} data-testid={'placeholderHint'}>
                <div className={'nodeHintArrow'} data-testid="nodeHintArrow">
                  ⤹
                </div>
                <div data-testid="nodeHintText">click on a node to add a step.</div>
              </div>
            )}

            {/* LEFT-SIDE HANDLE FOR EDGE TO CONNECT WITH */}
            {(!StepsService.isStartStep(data.step) || data.branchInfo) && (
              <Handle
                className={'stepHandle'}
                isConnectable={false}
                type="target"
                position={leftHandlePosition}
                id="a"
              />
            )}

            {/* VISUAL REPRESENTATION OF PLACEHOLDER STEP */}
            <div className={'stepNode__Icon stepNode__clickable'}>
              <CubesIcon />
            </div>

            {/* RIGHT-SIDE HANDLE FOR EDGE TO CONNECT WITH */}
            <Handle
              className={'stepHandle'}
              type="source"
              position={rightHandlePosition}
              id="b"
              isConnectable={false}
            />
            <div className={'stepNode__Label'}>
              <span className={'stepNode__clickable'}>{data.label}</span>
            </div>
          </div>
        </Popover>
      )}
    </>
  );
};

export { VisualizationStep };
