import { CustomJsonSchemaBridge } from './CustomJsonSchemaBridge';
import Ajv from 'ajv';
import { useRef } from 'react';
import { AutoForm } from 'uniforms';
import { AutoFields, ErrorsField } from 'uniforms-patternfly';

const ajv = new Ajv({
  allErrors: true,
  useDefaults: false,
  strict: 'log',
  strictSchema: false,
});

export function createValidator(schema: object) {
  const validator = ajv.compile(schema);

  return (model: object) => {
    validator(model);
    return validator.errors?.length ? { details: validator.errors } : null;
  };
}

type JsonSchemaConfiguratorProps = {
  schema: any;
  configuration: any;
  onChangeModel: (configuration: unknown, isValid: boolean) => void;
};

export const JsonSchemaConfigurator = ({
  schema,
  configuration,
  onChangeModel,
}: JsonSchemaConfiguratorProps) => {
  schema.type = schema.type || 'object';
  const schemaValidator = createValidator(schema);
  const bridge = new CustomJsonSchemaBridge(schema, schemaValidator);
  const previousModel = useRef(configuration);
  return (
    <AutoForm
      schema={bridge}
      model={configuration}
      onChangeModel={(model: any) => {
        if (model === previousModel.current) return;
        onChangeModel(model, true);
        previousModel.current = model;
      }}
      data-testid={'json-schema-configurator'}
    >
      <AutoFields />
      <ErrorsField />
      <br />
    </AutoForm>
  );
};
