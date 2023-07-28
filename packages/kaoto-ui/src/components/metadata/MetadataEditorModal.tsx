import { createValidator } from '../JsonSchemaConfigurator';
import { MetadataEditorBridge } from './MetadataEditorBridge';
import './MetadataEditorModal.css';
import { TopmostArrayTable } from './ToopmostArrayTable';
import { StepErrorBoundary } from '@kaoto/components';
import { useFlowsStore } from '@kaoto/store';
import { AutoField, AutoForm, ErrorsField } from '@kie-tools/uniforms-patternfly/dist/esm';
import {
  Button,
  Modal,
  ModalVariant,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { createElement, useEffect, useRef, useState } from 'react';
import { shallow } from 'zustand/shallow';

export interface IMetadataEditorModalProps {
  handleCloseModal: () => void;
  isModalOpen: boolean;
  name: string;
  schema: any;
}

/**
 * Metadata editor modal which shows:
 * <ul>
 *   <li> Topmost array metadata: 2 pane layout form, selectable table view at left side
 *   and details editor form at right side
 *   <li> Non-array metadata: editor form for single object
 * </ul>
 * @param props
 * @constructor
 */
export function MetadataEditorModal({
  handleCloseModal,
  isModalOpen,
  name,
  schema,
}: IMetadataEditorModalProps) {
  const schemaBridge = new MetadataEditorBridge(getFormSchema(), createValidator(getFormSchema()));
  const firstInputRef = useRef<HTMLInputElement>();
  const [selected, setSelected] = useState(-1);
  const { metadata, setMetadata } = useFlowsStore(({ metadata, setMetadata }) => ({
    metadata: metadata[name] as any,
    setMetadata,
    shallow,
  }));
  const [preparedModel, setPreparedModel] = useState<any>(null);

  useEffect(() => {
    setPreparedModel(null);
  }, [metadata, setMetadata]);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, [selected]);

  function isTopmostArray() {
    return schema.type === 'array' && schema.items;
  }

  function isFormDisabled() {
    if (!isTopmostArray()) {
      return false;
    }
    const targetModel = preparedModel != null ? preparedModel : metadata;
    return !targetModel || selected === -1 || selected > targetModel?.length - 1;
  }

  function getFormSchema() {
    if (isTopmostArray()) {
      const itemSchema = schema.items;
      itemSchema.title = schema.title;
      itemSchema.description = schema.description;
      return itemSchema;
    }
    return schema;
  }

  function getFormModel() {
    const targetModel = preparedModel != null ? preparedModel : metadata?.slice();
    if (isTopmostArray()) {
      return targetModel && selected !== -1 ? targetModel[selected] : undefined;
    }
    return targetModel;
  }

  function prepareFormModelChange(model: any) {
    if (isTopmostArray()) {
      const newMetadata = metadata ? metadata.slice() : [];
      const newPreparedModel = preparedModel ? preparedModel.slice() : newMetadata;
      newPreparedModel[selected] = model;
      setPreparedModel(newPreparedModel);
    } else {
      setPreparedModel(typeof model === `object` ? { ...preparedModel } : preparedModel);
    }
  }

  function commitModelChange() {
    if (preparedModel == null) {
      return;
    }
    setMetadata(name, preparedModel);
    setPreparedModel(null);
  }

  function cancelModelChange() {
    setPreparedModel(null);
  }

  function handleSetSelected(index: number) {
    setSelected(index);
  }

  function renderTopmostArrayView() {
    return (
      <Split hasGutter>
        <SplitItem className="metadataEditorModalListView">
          <TopmostArrayTable
            model={preparedModel != null ? preparedModel : metadata}
            itemSchema={getFormSchema()}
            name={name}
            selected={selected}
            onSelected={handleSetSelected}
            onChangeModel={setPreparedModel}
          />
        </SplitItem>

        <SplitItem className="metadataEditorModalDetailsView">
          <Stack hasGutter>
            <StackItem>
              <Title headingLevel="h2">Details</Title>
            </StackItem>
            <StackItem isFilled>{renderDetailsForm()}</StackItem>
          </Stack>
        </SplitItem>
      </Split>
    );
  }

  function renderAutoFields(props: any = {}) {
    return createElement(
      'div',
      props,
      schemaBridge.getSubfields().map((field, index) => {
        const props: any = { key: field, name: field };
        if (index === 0) {
          props.inputRef = firstInputRef;
        }
        return createElement(AutoField, props);
      }),
    );
  }

  function renderDetailsForm() {
    return (
      <AutoForm
        schema={schemaBridge}
        model={getFormModel()}
        onChangeModel={(model: any) => prepareFormModelChange(model)}
        data-testid={'metadata-editor-form-' + name}
        placeholder={true}
        disabled={isFormDisabled()}
      >
        {renderAutoFields()}
        <ErrorsField />
        <br />
      </AutoForm>
    );
  }

  return (
    <Modal
      className="metadataEditorModal"
      data-testid={`metadata-${name}-modal`}
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      title={schema.title + ' Configuration'}
      variant={ModalVariant.large}
      actions={[
        <Button
          key="save"
          data-testid={`metadata-${name}-save-btn`}
          variant="primary"
          isDisabled={preparedModel == null}
          onClick={() => {
            commitModelChange();
            handleCloseModal();
          }}
        >
          Save
        </Button>,
        <Button
          key="cancel"
          data-testid={`metadata-${name}-cancel-btn`}
          variant="secondary"
          onClick={() => {
            cancelModelChange();
            handleCloseModal();
          }}
        >
          Cancel
        </Button>,
      ]}
    >
      <StepErrorBoundary>
        {isTopmostArray() ? renderTopmostArrayView() : renderDetailsForm()}
      </StepErrorBoundary>
    </Modal>
  );
}
