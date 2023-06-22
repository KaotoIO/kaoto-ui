import { createValidator } from '../JsonSchemaConfigurator';
import { MetadataEditorBridge } from './MetadataEditorBridge';
import './MetadataEditorModal.css';
import { TopmostArrayTable } from './ToopmostArrayTable';
import { StepErrorBoundary } from '@kaoto/components';
import { useFlowsStore } from '@kaoto/store';
import { AutoField, AutoForm, ErrorsField } from '@kie-tools/uniforms-patternfly/dist/esm';
import {
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
    return selected === -1 || selected > metadata?.length - 1;
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
    if (isTopmostArray()) {
      return selected !== -1 && metadata[selected];
    }
    return metadata;
  }

  function handleChangeArrayModel(config: any) {
    setMetadata(name, config.slice());
  }

  function prepareModelChange(model: any) {
    setPreparedModel(model);
  }

  function commitModelChange() {
    if (preparedModel == null) {
      return;
    }
    if (isTopmostArray()) {
      const newMetadata = metadata ? metadata.slice() : [];
      newMetadata[selected] = preparedModel;
      setMetadata(name, newMetadata);
    } else {
      setMetadata(name, typeof preparedModel === `object` ? { ...preparedModel } : preparedModel);
    }
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
            model={metadata}
            itemSchema={getFormSchema()}
            name={name}
            selected={selected}
            onSelected={handleSetSelected}
            onChangeModel={handleChangeArrayModel}
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
        onChangeModel={(model: any) => prepareModelChange(model)}
        data-testid={'metadata-editor-form-' + name}
        placeholder={true}
        disabled={isFormDisabled()}
        onBlur={() => commitModelChange()}
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
    >
      <StepErrorBoundary>
        {isTopmostArray() ? renderTopmostArrayView() : renderDetailsForm()}
      </StepErrorBoundary>
    </Modal>
  );
}
