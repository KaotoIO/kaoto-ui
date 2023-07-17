import { PropertyPlaceholderRow } from './PropertyPlaceholderRow';
import { fireEvent, render, screen } from '@testing-library/react';

describe('PropertyPlaceholderRow.tsx', () => {
  test('render add string property', () => {
    const model: any = {};
    let onChangeModel = 0;
    render(
      <table>
        <tbody>
          <PropertyPlaceholderRow
            propertyName="beans"
            path={['one', 'two']}
            parentModel={model}
            rowIndex={0}
            level={0}
            posinset={0}
            isObject={false}
            onChangeModel={() => onChangeModel++}
          />
        </tbody>
      </table>,
    );
    const nameInput = screen.getByTestId('beans-one-two-placeholder-name-input');
    fireEvent.input(nameInput, { target: { value: 'foo' } });
    fireEvent.blur(nameInput);
    expect(model.foo).toBe('');
    expect(onChangeModel).toBe(1);
  });

  test('render add object property', () => {
    const model: any = {};
    let onChangeModel = 0;
    render(
      <table>
        <tbody>
          <PropertyPlaceholderRow
            propertyName="beans"
            path={['one', 'two']}
            parentModel={model}
            rowIndex={0}
            level={0}
            posinset={0}
            isObject={true}
            onChangeModel={() => onChangeModel++}
          />
        </tbody>
      </table>,
    );
    const nameInput = screen.getByTestId('beans-one-two-placeholder-name-input');
    fireEvent.input(nameInput, { target: { value: 'foo' } });
    fireEvent.blur(nameInput);
    expect(typeof model.foo).toBe('object');
    expect(onChangeModel).toBe(1);
  });
});
