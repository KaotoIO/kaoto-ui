import { FieldLabelIcon } from '../FieldLabelIcon';
import PropertiesField from './PropertiesField';
import JSONSchemaBridge from 'uniforms-bridge-json-schema';

/**
 * Add {@link PropertiesField} custom field for adding generic properties editor.
 */
export class MetadataEditorBridge extends JSONSchemaBridge {
  getField(name: string): Record<string, any> {
    const field = super.getField(name);
    const { defaultValue, description, ...props } = field;
    const revisedField: Record<string, any> = {
      labelIcon: description
        ? FieldLabelIcon({ defaultValue, description, disabled: false })
        : undefined,
      ...props,
    };
    if (revisedField.type === 'object' && !revisedField.properties) {
      revisedField.uniforms = {
        component: PropertiesField,
      };
    }
    return revisedField;
  }
}
