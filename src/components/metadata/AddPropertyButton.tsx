import {
  Button,
  FormGroup,
  HelperText,
  HelperTextItem,
  Popover,
  Radio,
  Split,
  SplitItem,
  Stack,
  StackItem,
  TextInput,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useState } from 'react';

type AddPropertyPopoverProps = {
  textLabel?: string;
  model: any;
  path: string[];
  disabled?: boolean;
  onChangeModel: (model: any) => void;
};

/**
 * Add property button shows a popover to receive user inputs for new property name and type,
 * as well as to validate if the property name already exists before actually adding it
 * into the model object.
 * @param props
 * @constructor
 */
export function AddPropertyButton({
  textLabel = '',
  model,
  path,
  disabled = false,
  onChangeModel,
}: AddPropertyPopoverProps) {
  const [isVisible, doSetVisible] = useState<boolean>(false);
  const [propertyType, setPropertyType] = useState<'string' | 'object'>('string');
  const [propertyName, setPropertyName] = useState<string>('');
  const [propertyValue, setPropertyValue] = useState<string>('');

  function isReadyToAdd() {
    return !!(propertyName && model[propertyName] == null);
  }

  function isDuplicate() {
    if (!model || !propertyName) {
      return false;
    }
    return model[propertyName] != null;
  }
  function setVisible(visible: boolean) {
    if (!model) {
      onChangeModel({});
    }
    doSetVisible(visible);
  }

  function handleAddProperty() {
    if (propertyType === 'object') {
      model[propertyName] = {};
    } else {
      model[propertyName] = propertyValue;
    }
    onChangeModel(model);
    setPropertyName('');
    setPropertyValue('');
    setPropertyType('string');
    setVisible(false);
  }

  return (
    <Popover
      aria-label={`add-property-popover-${path.join('-')}`}
      data-testid={`properties-add-property-${path.join('-')}-popover`}
      isVisible={isVisible}
      shouldOpen={() => setVisible(true)}
      shouldClose={() => setVisible(false)}
      bodyContent={
        <Stack hasGutter>
          <StackItem>
            <FormGroup>
              <Title headingLevel="h4">Name</Title>
              <TextInput
                name="property-name"
                aria-label={`properties-add-property-${path.join('-')}-name-input`}
                data-testid={`properties-add-property-${path.join('-')}-name-input`}
                aria-invalid={isDuplicate()}
                value={propertyName}
                onChange={(value) => setPropertyName(value)}
              />
              {isDuplicate() && (
                <HelperText>
                  <HelperTextItem variant="error">
                    Please specify a unique property name
                  </HelperTextItem>
                </HelperText>
              )}
            </FormGroup>
          </StackItem>
          <StackItem>
            <Split hasGutter>
              <SplitItem>
                <FormGroup isInline>
                  <Split hasGutter>
                    <SplitItem>
                      <Radio
                        name="property-type"
                        label="String"
                        id={`properties-add-property-${path.join('-')}-type-string`}
                        data-testid={`properties-add-property-${path.join('-')}-type-string`}
                        isChecked={propertyType === 'string'}
                        onChange={(checked) => checked && setPropertyType('string')}
                      />
                    </SplitItem>
                    <SplitItem>
                      <Radio
                        name="property-type"
                        label="Object"
                        id={`properties-add-property-${path.join('-')}-type-object`}
                        data-testid={`properties-add-property-${path.join('-')}-type-object`}
                        isChecked={propertyType === 'object'}
                        onChange={(checked) => checked && setPropertyType('object')}
                      />
                    </SplitItem>
                  </Split>
                </FormGroup>
              </SplitItem>
            </Split>
          </StackItem>
          <StackItem>
            <FormGroup>
              <Title headingLevel={'h4'}>Value</Title>
              <TextInput
                name="property-value"
                aria-label={`properties-add-property-${path.join('-')}-value-input`}
                data-testid={`properties-add-property-${path.join('-')}-value-input`}
                value={propertyValue}
                isDisabled={propertyType === 'object'}
                onChange={(value) => setPropertyValue(value)}
              />
            </FormGroup>
          </StackItem>
          <StackItem>
            <Button
              aria-label={`properties-add-property-${path.join('-')}-add-btn`}
              data-testid={`properties-add-property-${path.join('-')}-add-btn`}
              variant="primary"
              onClick={handleAddProperty}
              isDisabled={!isReadyToAdd()}
            >
              Add
            </Button>
          </StackItem>
        </Stack>
      }
    >
      <Tooltip content="Add property">
        <Button
          data-testid={`properties-add-property-${path.join('-')}-popover-btn`}
          variant={'link'}
          icon={<PlusCircleIcon />}
          isDisabled={disabled}
        >
          {textLabel}
        </Button>
      </Tooltip>
    </Popover>
  );
}
