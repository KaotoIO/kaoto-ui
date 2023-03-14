import DisabledField from './DisabledField';
import { FieldLabelIcon } from './FieldLabelIcon';
import JSONSchemaBridge from 'uniforms-bridge-json-schema';

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

    const isDisabled = field.type === 'object';
    const revisedField: any = {
      labelIcon: description ? FieldLabelIcon({ description, disabled: isDisabled }) : undefined,
      ...props,
    };
    if (isDisabled) {
      revisedField.uniforms = {
        component: DisabledField,
      };
    }
    return revisedField;
  }
}
