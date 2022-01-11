import { Card, CardBody } from '@patternfly/react-core';
import Ajv from 'ajv';
import { FunctionComponent } from 'react';
import { AutoForm } from 'uniforms';
import { JSONSchemaBridge } from 'uniforms-bridge-json-schema';
import { AutoFields, SubmitField } from 'uniforms-patternfly';

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
  onChange?: (configuration: unknown, isValid: boolean) => void;
  onSubmit: (configuration: unknown, isValid: boolean) => void;
};

export const JsonSchemaConfigurator: FunctionComponent<JsonSchemaConfiguratorProps> = ({
  schema,
  configuration,
  onChange,
  onSubmit,
}) => {
  schema.type = schema.type || 'object';
  const schemaValidator = createValidator(schema);
  const bridge = new JSONSchemaBridge(schema, schemaValidator);
  return (
    <AutoForm
      schema={bridge}
      model={configuration}
      onChangeModel={(model: any) => onChange(model, false)}
      onSubmit={(model: any) => onSubmit(model, true)}
    >
      <AutoFields />

      <Card isPlain>
        <CardBody>{<SubmitField value={'Verify configuration'} />}</CardBody>
      </Card>
    </AutoForm>
  );
};
