import { fetchBackendVersion } from '@kaoto/api';
import { act, render } from '@testing-library/react';
import { AppLayout } from './AppLayout';

jest.mock('@kaoto/api', () => {
  const actual = jest.requireActual('@kaoto/api');

  return ({
    ...actual,
    fetchBackendVersion: jest.fn(),
  });
});

describe('AppLayout.tsx', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (fetchBackendVersion as jest.Mock).mockRejectedValue(null);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    (fetchBackendVersion as jest.Mock).mockClear();
  });

  test('component renders in loading mode', async () => {
    const wrapper = render(
      <AppLayout>
        <span data-testid="children">This is a placeholder</span>
      </AppLayout>
    );

    const element = wrapper.queryByTestId('children');
    expect(element).not.toBeInTheDocument();
  });

  test('component times out and display error message', async () => {
    const wrapper = render(
      <AppLayout>
        <span data-testid="children">This is a placeholder</span>
      </AppLayout>
    );

    for (let i = 0; i <= 120; i++) {
      await act(async () => {
        jest.advanceTimersByTime(1_100);
      });
    }

    const element = wrapper.queryByText('Kaoto API is unreachable');
    expect(element).toBeInTheDocument();
  });

  test('component display its children once the API has been reached', async () => {
    (fetchBackendVersion as jest.Mock).mockResolvedValueOnce('1.0-backend-version');

    const wrapper = render(
      <AppLayout>
        <span data-testid="children">This is a placeholder</span>
      </AppLayout>
    );

    await act(async () => {
      jest.advanceTimersByTime(1_100);
    });

    const element = wrapper.queryByText('This is a placeholder');
    expect(element).toBeInTheDocument();
  });
});
