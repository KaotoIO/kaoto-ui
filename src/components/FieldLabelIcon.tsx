import { Button, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

type FieldLabelIconProps = {
  description?: string;
  disabled: boolean;
};

/**
 * Returns a label tooltip element for the form or undefined if the field has no description
 * @param description
 * @returns
 */
export const FieldLabelIcon = (props: FieldLabelIconProps) => {
  const headerContent = props.disabled
    ? 'Please use the source code editor to configure this property.'
    : '';
  const bodyContent = props.description ? props.description : '';
  return (
    <Popover headerContent={headerContent} bodyContent={bodyContent}>
      <Button
        variant="plain"
        type="button"
        aria-label="More info for field"
        aria-describedby="form-group-label-info"
        className="pf-c-form__group-label-help"
      >
        <HelpIcon />
      </Button>
    </Popover>
  );
};
