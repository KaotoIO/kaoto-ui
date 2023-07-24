import { IDataTestID, ValidationResult, ValidationStatus } from '../../types';
import './InlineEdit.css';
import { Button, Form, FormGroup, InputGroup, TextInput } from '@patternfly/react-core';
import {
  CheckIcon,
  ExclamationCircleIcon,
  PencilAltIcon,
  TimesIcon,
} from '@patternfly/react-icons';
import {
  FormEventHandler,
  FunctionComponent,
  KeyboardEventHandler,
  MouseEventHandler,
  useCallback,
  useState,
} from 'react';

interface IInlineEdit extends IDataTestID {
  value?: string;
  validator?: (value: string) => ValidationResult;
  onChange?: (value: string) => void;
  onClick?: () => void;
}

export const InlineEdit: FunctionComponent<IInlineEdit> = (props) => {
  const [localValue, setLocalValue] = useState(props.value ?? '');
  const [isReadOnly, setIsReadOnly] = useState(true);

  const focusTextInput = useCallback((element: HTMLInputElement) => {
    element?.focus();
  }, []);

  const [validationResult, setValidationResult] = useState<ValidationResult>({
    status: ValidationStatus.Default,
    errMessages: [],
  });

  const onEdit: MouseEventHandler<HTMLButtonElement> = useCallback((event) => {
    setIsReadOnly(false);
    event.stopPropagation();
  }, []);

  const onChange = useCallback(
    (value: string) => {
      setLocalValue(value);

      if (value === props.value) {
        setValidationResult({ status: ValidationStatus.Default, errMessages: [] });
        return;
      }

      if (typeof props.validator === 'function') {
        setValidationResult(props.validator(value));
      }
    },
    [props],
  );

  const saveValue = useCallback(() => {
    if (
      validationResult.status !== ValidationStatus.Default &&
      validationResult.status !== ValidationStatus.Success
    )
      return;

    setIsReadOnly(true);
    if (localValue !== props.value && typeof props.onChange === 'function') {
      props.onChange(localValue);
    }
  }, [localValue, props, validationResult]);

  const cancelValue = useCallback(() => {
    setLocalValue(props.value ?? '');
    setValidationResult({ status: ValidationStatus.Default, errMessages: [] });
    setIsReadOnly(true);
  }, [props.value]);

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        saveValue();
      }
      if (event.key === 'Escape') {
        cancelValue();
      }
      event.stopPropagation();
    },
    [cancelValue, saveValue],
  );

  const onSave: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      saveValue();
      event.stopPropagation();
    },
    [saveValue],
  );

  const onCancel: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      cancelValue();
      event.stopPropagation();
    },
    [cancelValue],
  );

  const noop: FormEventHandler<HTMLFormElement> = useCallback((event) => {
    event.preventDefault();
  }, []);

  return (
    <>
      {isReadOnly ? (
        <>
          <span
            data-clickable={typeof props.onClick === 'function'}
            data-testid={props['data-testid']}
            onClick={props.onClick}
          >
            {props.value}
          </span>
          &nbsp;&nbsp;
          <Button
            variant="plain"
            data-testid={props['data-testid'] + '--edit'}
            onClick={onEdit}
            icon={<PencilAltIcon />}
          />
        </>
      ) : (
        <Form onSubmit={noop} data-testid={props['data-testid'] + '--form'}>
          <FormGroup
            type="text"
            helperTextInvalid={validationResult.errMessages[0]}
            helperTextInvalidIcon={<ExclamationCircleIcon />}
            fieldId="edit-value"
            validated={validationResult.status}
          >
            <InputGroup>
              <TextInput
                id="edit-value"
                name="edit-value"
                aria-label="edit-value"
                data-testid={props['data-testid'] + '--text-input'}
                type="text"
                ref={focusTextInput}
                onChange={onChange}
                value={localValue}
                aria-invalid={validationResult.status === ValidationStatus.Error}
                onKeyDown={onKeyDown}
              />

              <Button
                variant="plain"
                aria-label="save button for editing value"
                onClick={onSave}
                data-testid={props['data-testid'] + '--save'}
                aria-disabled={validationResult.status === ValidationStatus.Error}
                isDisabled={validationResult.status === ValidationStatus.Error}
              >
                <CheckIcon />
              </Button>

              <Button
                variant="plain"
                aria-label="close button for editing value"
                data-testid={props['data-testid'] + '--cancel'}
                onClick={onCancel}
              >
                <TimesIcon />
              </Button>
            </InputGroup>
          </FormGroup>
        </Form>
      )}
    </>
  );
};
