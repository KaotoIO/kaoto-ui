import { Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import JSONSchemaBridge from 'uniforms-bridge-json-schema';

/**
 * Returns a label tooltip element for the form or undefined if the field has no description
 * @param description 
 * @returns 
 */
const getLabelIcon = (description: string) =>
  typeof (description) !== 'undefined' ?
    (
      <Popover bodyContent={description}>
        <button
          type="button"
          aria-label="More info for field"
          aria-describedby="form-group-label-info"
          className="pf-c-form__group-label-help"
        >
          <HelpIcon /></button>
      </Popover>
    ) : undefined;

/**
 * CustomJsonSchemaBridge generates the appropriate attributes for uniforms-patternfly
 * based on the incoming model data
 */
export class CustomJsonSchemaBridge extends JSONSchemaBridge {

  constructor(schema: any, validator: any) {
    super(schema, validator);
  }

  getField(name: string): Record<string, any> {
    const field = super.getField(name);
    const { description, ...props } = field;

    return {
      labelIcon: getLabelIcon(description),
      ...props
    };
  }
}
