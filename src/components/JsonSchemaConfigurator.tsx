import { AutoFields, AutoForm, ErrorsField } from '@kie-tools/uniforms-patternfly/dist/esm';
import Ajv from 'ajv';
import { useRef } from 'react';
import { CustomJsonSchemaBridge } from './CustomJsonSchemaBridge';
import './JsonSchemaConfigurator.css';

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
  parametersOrder: string[];
  onChangeModel: (configuration: unknown, isValid: boolean) => void;
};

export const JsonSchemaConfigurator = ({
  schema,
  configuration,
  parametersOrder,
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
      placeholder={true}
    >
      <AutoFields fields={parametersOrder}/>
      <ErrorsField />
      <br />
    </AutoForm>
  );
};
