import { mockSchema } from './TestUtil';
import * as api from '@kaoto/api';
import { MetadataToolbarItems } from '@kaoto/components';
import { screen } from '@testing-library/dom';
import { fireEvent, render, waitFor } from '@testing-library/react';

jest.mock('@kaoto/api', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@kaoto/api'),
  };
});
jest.mock('../../hooks/flows-visibility.hook', () => {
  return {
    useFlowsVisibility: () => ({
      singleFlowId: '',
      visibleFlowsCount: 1,
      totalFlowsCount: 1,
      isCanvasEmpty: false,
    }),
  };
});

describe('MetadataToolbarItems.tsx', () => {
  test('component renders multiple metadata items', async () => {
    jest.spyOn(api, 'fetchMetadataSchema').mockResolvedValue(mockSchema);
    render(<MetadataToolbarItems />);
    const beansBtn = await waitFor(() => screen.getByTestId('toolbar-metadata-beans-btn'));
    await waitFor(() => screen.getByTestId('toolbar-metadata-single-btn'));
    fireEvent.click(beansBtn);
    await waitFor(() => screen.getByTestId('metadata-beans-modal'));
  });
});
