import PropertiesField from './PropertiesField';
import JSONSchemaBridge from 'uniforms-bridge-json-schema';

/**
 * Add {@link PropertiesField} custom field for adding generic properties editor.
 */
export class MetadataEditorBridge extends JSONSchemaBridge {
  getField(name: string): Record<string, any> {
    const field = super.getField(name);
    if (field.type === 'object' && !field.properties) {
      field.uniforms = {
        component: PropertiesField,
      };
    }
    return field;
  }
}
