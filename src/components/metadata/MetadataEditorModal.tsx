import { createValidator } from '../JsonSchemaConfigurator';
import { MetadataEditorBridge } from './MetadataEditorBridge';
import './MetadataEditorModal.css';
import { TopmostArrayTable } from './ToopmostArrayTable';
import { StepErrorBoundary } from '@kaoto/components';
import { useFlowsStore } from '@kaoto/store';
import { AutoFields, AutoForm, ErrorsField } from '@kie-tools/uniforms-patternfly/dist/esm';
import {
  Modal,
  ModalVariant,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { useState } from 'react';
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
  const [selected, setSelected] = useState(-1);
  const { metadata, setMetadata } = useFlowsStore(({ metadata, setMetadata }) => ({
    metadata: metadata[name] as any,
    setMetadata,
    shallow,
  }));

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
      return metadata && selected !== -1 ? metadata[selected] : undefined;
    }
    return metadata;
  }

  function getSchemaBridge() {
    const schemaValidator = createValidator(getFormSchema());
    return new MetadataEditorBridge(getFormSchema(), schemaValidator);
  }

  function handleChangeArrayModel(config: any) {
    setMetadata(name, config.slice());
  }

  function handleChangeDetails(details: any) {
    if (isTopmostArray()) {
      const newMetadata = metadata ? metadata.slice() : [];
      newMetadata[selected] = details;
      setMetadata(name, newMetadata);
    } else {
      setMetadata(name, typeof details === `object` ? { ...details } : details);
    }
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

  function renderDetailsForm() {
    return (
      <AutoForm
        schema={getSchemaBridge()}
        model={getFormModel()}
        onChangeModel={(model: any) => handleChangeDetails(model)}
        data-testid={'metadata-editor-form-' + name}
        placeholder={true}
        disabled={isFormDisabled()}
      >
        <AutoFields />
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
