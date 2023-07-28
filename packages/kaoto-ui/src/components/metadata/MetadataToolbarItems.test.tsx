import { mockSchema } from './TestUtil';
import * as api from '@kaoto/api';
import { MetadataToolbarItems } from '@kaoto/components';
import { fireEvent, render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

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
    const wrapper = await act(async () => render(<MetadataToolbarItems />));
    const beansBtn = wrapper.getByTestId('toolbar-metadata-beans-btn');
    wrapper.getByTestId('toolbar-metadata-single-btn');
    fireEvent.click(beansBtn);
    wrapper.getByTestId('metadata-beans-modal');
  });
});
