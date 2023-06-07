import { JsonSchemaConfigurator } from './JsonSchemaConfigurator';
import { render } from '@testing-library/react';
import { JSONSchemaBridge } from 'uniforms-bridge-json-schema';

describe('JsonSchemaConfigurator.tsx', () => {
  test('component renders correctly', () => {
    const stepPropertySchema = {
      type: 'object',
      properties: {
        keywords: {
          label: 'keywords',
          type: 'string',
          value: '',
        },
        type: {
          label: 'type',
          type: 'string',
          value: '',
        },
      },
    };

    const stepPropertyModel = {
      defaultValue: 'Some string',
      description:
        'The keywords to use in the Twitter search (Supports Twitter standard operators)',
      id: 'keywords',
      label: 'keywords',
      path: false,
      type: 'string',
    };

    const validator = jest.fn();
    const bridge = new JSONSchemaBridge(stepPropertySchema, validator);

    const wrapper = render(
      <JsonSchemaConfigurator
        schema={bridge}
        configuration={stepPropertyModel}
        onChangeModel={jest.fn()}
        parametersOrder={[]}
      />
    );
    const element = wrapper.getByTestId('json-schema-configurator');
    expect(element).toBeInTheDocument();
  });
});
