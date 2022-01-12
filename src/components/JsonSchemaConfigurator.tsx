import { ActionGroup, Button } from '@patternfly/react-core';
import Ajv from 'ajv';
import { FunctionComponent } from 'react';
import { AutoForm } from 'uniforms';
import { JSONSchemaBridge } from 'uniforms-bridge-json-schema';
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
  onSubmit: (configuration: unknown, isValid: boolean) => void;
};

export const JsonSchemaConfigurator: FunctionComponent<JsonSchemaConfiguratorProps> = ({
  schema,
  configuration,
  onSubmit,
}) => {
  schema.type = schema.type || 'object';
  const schemaValidator = createValidator(schema);
  const bridge = new JSONSchemaBridge(schema, schemaValidator);
  return (
    <AutoForm
      schema={bridge}
      model={configuration}
      onSubmit={(model: any) => onSubmit(model, true)}
      data-testid={'json-schema-configurator'}
    >
      <AutoFields />
      <ErrorsField />
      <br />
      <ActionGroup>
        <Button variant={'primary'} type={'submit'}>
          Verify Configuration
        </Button>
      </ActionGroup>
    </AutoForm>
  );
};
