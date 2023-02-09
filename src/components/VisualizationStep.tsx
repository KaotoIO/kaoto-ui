import './Visualization.css';
import { MiniCatalog } from '@kaoto/components';
import { StepsService, ValidationService } from '@kaoto/services';
import {
  useIntegrationJsonStore,
  useNestedStepsStore,
  useSettingsStore,
  useVisualizationStore,
} from '@kaoto/store';
import { IStepProps, IVizStepNodeData } from '@kaoto/types';
import { AlertVariant, Popover } from '@patternfly/react-core';
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
  const stepsService = new StepsService(integrationJsonStore, nestedStepsStore, visualizationStore);

  const { addAlert } = useAlert() || {};

  const onMiniCatalogClickAppend = (selectedStep: IStepProps) => {
    stepsService.handleAppendStep(data.step, selectedStep);
  };
  const replacePlaceholderStep = (stepC: IStepProps) => {
    stepsService.replacePlaceholderStep(data, stepC)
      .then((validation) => {
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
    stepsService.handleDropOnExistingStep(data, data.step, stepC)
      .then((validation) => {
        !validation.isValid &&
        addAlert &&
        addAlert({
          title: 'Replace Step Unsuccessful',
          variant: AlertVariant.danger,
          description: validation.message ?? 'Something went wrong, please try again later.',
        });
      })
  };

  return (
    <>
      {!data.isPlaceholder ? (
        <div
          className={`stepNode`}
          onDrop={onDropReplace}
          data-testid={`viz-step-${data.step.name}`}
        >
          {/* PREPEND STEP BUTTON */}
          {!endStep && data.isFirstStep && (
            <Popover
              appendTo={() => document.body}
              aria-label="Search for a step"
              bodyContent={
                <MiniCatalog
                  handleSelectStep={onMiniCatalogClickPrepend}
                  queryParams={{
                    dsl: currentDSL,
                    type: ValidationService.prependableStepTypes(),
                  }}
                />
              }
              className={'miniCatalog__popover'}
              data-testid={'miniCatalog__popover'}
              enableFlip={true}
              flipBehavior={['top-start', 'left-start']}
              hideOnOutsideClick={true}
              position={'left-start'}
            >
              <button
                className="stepNode__Prepend plusButton nodrag"
                data-testid={'stepNode__prependStep-btn'}
              >
                <PlusIcon />
              </button>
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

          <button
            className="stepNode__Delete trashButton nodrag"
            data-testid={'configurationTab__deleteBtn'}
            onClick={handleTrashClick}
          >
            <MinusIcon />
          </button>

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
          {!endStep && data.isLastStep && (
            <Popover
              appendTo={() => document.body}
              aria-label="Search for a step"
              bodyContent={
                <MiniCatalog
                  handleSelectStep={onMiniCatalogClickAppend}
                  queryParams={{
                    dsl: currentDSL,
                    type: ValidationService.appendableStepTypes(data.step.type),
                  }}
                />
              }
              className={'miniCatalog__popover'}
              data-testid={'miniCatalog__popover'}
              enableFlip={true}
              flipBehavior={['top-start', 'left-start']}
              hideOnOutsideClick={true}
              position={'right-start'}
            >
              <button
                className="stepNode__Add plusButton nodrag"
                data-testid={'stepNode__appendStep-btn'}
              >
                <PlusIcon />
              </button>
            </Popover>
          )}
        </div>
      ) : (
        <Popover
          appendTo={() => document.body}
          aria-label="Search for a step"
          bodyContent={
            <MiniCatalog
              handleSelectStep={onMiniCatalogClickAdd}
              queryParams={{
                dsl: currentDSL,
                type: data.step.type,
              }}
            />
          }
          className={'miniCatalog__popover'}
          data-testid={'miniCatalog__popover'}
          enableFlip={true}
          flipBehavior={['top-start', 'left-start']}
          hideOnOutsideClick={true}
          position={'right-start'}
        >
          <div
            className={'stepNode stepNode__Slot stepNode__clickable'}
            onDrop={onDropNew}
            data-testid={'viz-step-slot'}
          >
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
