import { JsonSchemaConfigurator } from './JsonSchemaConfigurator';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';

describe('JsonSchemaConfigurator.tsx', () => {
  test('component renders correctly', () => {
    const stepPropertySchema = {
      type: 'string',
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

    render(
      <JsonSchemaConfigurator
        schema={{ type: 'object', properties: stepPropertySchema }}
        configuration={stepPropertyModel}
        onSubmit={jest.fn()}
      />
    );
    const element = screen.getByTestId('json-schema-configurator');
    expect(element).toBeInTheDocument();
  });
});
