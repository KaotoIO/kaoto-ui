import { AppendStepButton } from './AppendStepButton';
import { BranchBuilder } from './BranchBuilder';
import './Visualization.css';
import { MiniCatalog } from '@kaoto/components';
import { StepsService, VisualizationService } from '@kaoto/services';
import {
  useIntegrationJsonStore,
  useNestedStepsStore,
  useSettingsStore,
  useVisualizationStore,
} from '@kaoto/store';
import { IStepProps, IVizStepNodeData } from '@kaoto/types';
import { AlertVariant, Popover, Tooltip } from '@patternfly/react-core';
import { CubesIcon, MinusIcon } from '@patternfly/react-icons';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { Handle, NodeProps, Position } from 'reactflow';
import { PrependStepButton } from './PrependStepButton';

const currentDSL = useSettingsStore.getState().settings.dsl.name;

// Custom Node type and component for React Flow
const VisualizationStep = ({ data }: NodeProps<IVizStepNodeData>) => {
  const endStep = StepsService.isEndStep(data.step!);
  const nestedStepsStore = useNestedStepsStore();
  const visualizationStore = useVisualizationStore();
  const integrationJsonStore = useIntegrationJsonStore();
  const visualizationService = new VisualizationService(integrationJsonStore, visualizationStore);
  const stepsService = new StepsService(integrationJsonStore, nestedStepsStore, visualizationStore);
  const showBranchesTab = VisualizationService.showBranchesTab(data);
  const showStepsTab = VisualizationService.showStepsTab(data);
  const supportsBranching = StepsService.supportsBranching(data.step);

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
    stepsService.handlePrependStep(data.step, selectedStep);
  };

  const handleAddBranch = () => {
    stepsService.addBranch(data.step, { branchUuid: '', identifier: '', steps: [] });
  };

  const handleTrashClick = () => {
    data.handleDeleteStep && data.handleDeleteStep(data.step?.UUID);
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
          className={`stepNode` + getSelectedClass() + getHoverClass()}
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
              layout={visualizationStore.layout}
              step={data.step}
            />
          )}

          {/* LEFT-SIDE HANDLE FOR EDGE TO CONNECT WITH */}
          {!StepsService.isStartStep(data.step) && (
            <Handle
              className={'stepHandle'}
              isConnectable={false}
              type="target"
              position={visualizationStore.layout === 'LR' ? Position.Left : Position.Top}
              id="a"
            />
          )}

          {/* DELETE STEP BUTTON */}
          <Tooltip
            content={'Delete step'}
            position={visualizationStore.layout === 'LR' ? 'top' : 'left'}
          >
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
          <div className={'stepNode__Label stepNode__clickable'}>
            <span>{data.label}</span>
          </div>
          {/* RIGHT-SIDE HANDLE FOR EDGE TO CONNECT WITH */}
          {!StepsService.isEndStep(data.step) && (
            <Handle
              className={'stepHandle'}
              isConnectable={false}
              type="source"
              position={visualizationStore.layout === 'LR' ? Position.Right : Position.Bottom}
              id="b"
            />
          )}

          {/* ADD/APPEND STEP BUTTON */}
          {VisualizationService.showAppendStepButton(data, endStep) && (
            <AppendStepButton
              handleAddBranch={handleAddBranch}
              handleSelectStep={onMiniCatalogClickAppend}
              layout={visualizationStore.layout}
              step={data.step}
              showBranchesTab={showBranchesTab}
              showStepsTab={showStepsTab}
              supportsBranching={supportsBranching}
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
                <div className={'nodeHintArrow'}>⤹</div>
                <div>click on a node to add a step.</div>
              </div>
            )}

            {/* LEFT-SIDE HANDLE FOR EDGE TO CONNECT WITH */}
            {(!StepsService.isStartStep(data.step) || data.branchInfo) && (
              <Handle
                className={'stepHandle'}
                isConnectable={false}
                type="target"
                position={visualizationStore.layout === 'LR' ? Position.Left : Position.Top}
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
              position={visualizationStore.layout === 'LR' ? Position.Right : Position.Bottom}
              id="b"
              isConnectable={false}
            />
            <div className={'stepNode__Label stepNode__clickable'}>{data.label}</div>
          </div>
        </Popover>
      )}
    </>
  );
};

export { VisualizationStep };
