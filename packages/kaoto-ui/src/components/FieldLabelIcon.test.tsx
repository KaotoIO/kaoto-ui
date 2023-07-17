import { AlertProvider } from '../layout';
import { FieldLabelIcon } from './FieldLabelIcon';
import { screen } from '@testing-library/dom';
import { fireEvent, render, waitFor } from '@testing-library/react';

describe('FieldLabelIcon.tsx', () => {
  test('component renders if open', async () => {
    render(
      <AlertProvider>
        <FieldLabelIcon disabled={false} />
      </AlertProvider>,
    );
    const element = screen.getByTestId('field-label-icon');
    expect(element).toBeInTheDocument();
    fireEvent.click(element);
    await waitFor(() =>
      expect(screen.getByTestId('property-description-popover')).toBeInTheDocument(),
    );
  });
});
