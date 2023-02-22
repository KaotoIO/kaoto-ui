import { BranchBuilder } from './BranchBuilder';
import './Visualization.css';
import { MiniCatalog } from '@kaoto/components';
import { StepsService, ValidationService, VisualizationService } from '@kaoto/services';
import {
  useIntegrationJsonStore,
  useNestedStepsStore,
  useSettingsStore,
  useVisualizationStore,
} from '@kaoto/store';
import { IStepProps, IVizStepNodeData } from '@kaoto/types';
import { AlertVariant, Popover, Tooltip } from '@patternfly/react-core';
import { CubesIcon, PlusIcon, MinusIcon } from '@patternfly/react-icons';
import { useAlert } from '@rhoas/app-services-ui-shared';
import { Handle, NodeProps, Position } from 'reactflow';

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
          variant: AlertVariant.danger,
          description: validation.message ?? 'Something went wrong, please try again later.',
        });
    });
  };

  return (
    <>
      {!data.isPlaceholder ? (
        <div
          className={
            `stepNode` +
            `${VisualizationService.shouldHighlightNode(
              visualizationStore.hoverStepUuid,
              data.branchInfo?.branchParentUuid ?? data.step.UUID
            )}`
          }
          onDrop={onDropReplace}
          onMouseEnter={() => {
            if (data.branchInfo || supportsBranching) {
              visualizationStore.setHoverStepUuid(
                data.branchInfo?.branchParentUuid ?? data.step.UUID
              );
            } else {
              visualizationStore.setHoverStepUuid(data.step.UUID);
            }
          }}
          onMouseLeave={() => visualizationStore.setHoverStepUuid('')}
          data-testid={`viz-step-${data.step.name}`}
        >
          {/* PREPEND STEP BUTTON */}
          {visualizationService.showPrependStepButton(data) && (
            <Popover
              appendTo={() => document.body}
              aria-label="Add a step"
              bodyContent={
                <MiniCatalog
                  children={<BranchBuilder handleAddBranch={handleAddBranch} />}
                  disableBranchesTab={true}
                  disableBranchesTabMsg={"You can't add a branch from here."}
                  disableStepsTab={!showStepsTab}
                  handleSelectStep={onMiniCatalogClickPrepend}
                  queryParams={{
                    dsl: currentDSL,
                    type: ValidationService.prependableStepTypes(),
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
              position={'left-start'}
              showClose={false}
            >
              <Tooltip content={ValidationService.getPlusButtonTooltipMsg(false, showStepsTab)}>
                <button
                  className="stepNode__Prepend plusButton nodrag"
                  data-testid={'stepNode__prependStep-btn'}
                >
                  <PlusIcon />
                </button>
              </Tooltip>
            </Popover>
          )}

          {/* LEFT-SIDE HANDLE FOR EDGE TO CONNECT WITH */}
          {!StepsService.isStartStep(data.step) && (
            <Handle
              isConnectable={false}
              type="target"
              position={visualizationStore.layout === 'RIGHT' ? Position.Left : Position.Top}
              id="a"
              style={{ borderRadius: 0 }}
            />
          )}

          {/* DELETE STEP BUTTON */}
          <Tooltip content={'Delete step'}>
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
              isConnectable={false}
              type="source"
              position={visualizationStore.layout === 'RIGHT' ? Position.Right : Position.Bottom}
              id="b"
              style={{ borderRadius: 0 }}
            />
          )}

          {/* ADD/APPEND STEP BUTTON */}
          {VisualizationService.showAppendStepButton(data, endStep) ? (
            <Popover
              appendTo={() => document.body}
              aria-label="Search for a step"
              bodyContent={
                <MiniCatalog
                  children={<BranchBuilder handleAddBranch={handleAddBranch} />}
                  disableBranchesTab={!showBranchesTab}
                  disableBranchesTabMsg={"This step doesn't support branching."}
                  disableStepsTab={!showStepsTab}
                  disableStepsTabMsg={"You can't add a step between a step and a branch."}
                  handleSelectStep={onMiniCatalogClickAppend}
                  queryParams={{
                    dsl: currentDSL,
                    type: ValidationService.appendableStepTypes(data.step.type),
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
              showClose={false}
            >
              <Tooltip
                content={ValidationService.getPlusButtonTooltipMsg(showBranchesTab, showStepsTab)}
              >
                <button
                  className="stepNode__Add plusButton nodrag"
                  data-testid={'stepNode__appendStep-btn'}
                >
                  <PlusIcon />
                </button>
              </Tooltip>
            </Popover>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <Popover
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
                isConnectable={false}
                type="target"
                position={visualizationStore.layout === 'RIGHT' ? Position.Left : Position.Top}
                id="a"
                style={{ borderRadius: 0 }}
              />
            )}

            {/* VISUAL REPRESENTATION OF PLACEHOLDER STEP */}
            <div className={'stepNode__Icon stepNode__clickable'}>
              <CubesIcon />
            </div>

            {/* RIGHT-SIDE HANDLE FOR EDGE TO CONNECT WITH */}
            <Handle
              type="source"
              position={visualizationStore.layout === 'RIGHT' ? Position.Right : Position.Bottom}
              id="b"
              style={{ borderRadius: 0 }}
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
