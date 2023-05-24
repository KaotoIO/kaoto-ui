import { AppLayout } from './AppLayout';
import { fetchBackendVersion, fetchCapabilities } from '@kaoto/api';
import { useSettingsStore } from '@kaoto/store';
import { act, render } from '@testing-library/react';

jest.mock('@kaoto/api', () => {
  const actual = jest.requireActual('@kaoto/api');

  return {
    ...actual,
    fetchBackendVersion: jest.fn(),
    fetchCapabilities: jest.fn(),
  };
});

describe('AppLayout.tsx', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (fetchBackendVersion as jest.Mock).mockRejectedValue(null);
    (fetchCapabilities as jest.Mock).mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    (fetchBackendVersion as jest.Mock).mockClear();
    (fetchCapabilities as jest.Mock).mockClear();
  });

  test('component renders in loading mode', async () => {
    const wrapper = render(
      <AppLayout>
        <span data-testid="children">This is a placeholder</span>
      </AppLayout>,
    );

    const element = wrapper.queryByTestId('children');
    expect(element).not.toBeInTheDocument();
  });

  test('component times out and display error message', async () => {
    const wrapper = render(
      <AppLayout>
        <span data-testid="children">This is a placeholder</span>
      </AppLayout>,
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
      </AppLayout>,
    );

    await act(async () => {
      jest.advanceTimersByTime(1_100);
    });

    const element = wrapper.queryByText('This is a placeholder');
    expect(element).toBeInTheDocument();
  });

  test('component fetch capabilities and saves it to the settings store', async () => {
    (fetchBackendVersion as jest.Mock).mockResolvedValueOnce('1.0-backend-version');
    (fetchCapabilities as jest.Mock).mockResolvedValueOnce({
      dsls: [
        {
          output: 'true',
          input: 'true',
          validationSchema: '/v1/capabilities/Integration/schema',
          deployable: 'true',
          name: 'Integration',
          description: 'An Integration defines a workflow of actions and steps.',
          'step-kinds': '[CAMEL-CONNECTOR, EIP, EIP-BRANCH]',
        },
      ],
    });

    render(
      <AppLayout>
        <span data-testid="children">This is a placeholder</span>
      </AppLayout>,
    );

    await act(async () => {
      jest.advanceTimersByTime(1_100);
    });

    expect(useSettingsStore.getState().settings.capabilities[0].name).toEqual('Integration');
  });

  test('component fetch capabilities and errors out', async () => {
    (fetchBackendVersion as jest.Mock).mockResolvedValueOnce('1.0-backend-version');
    (fetchCapabilities as jest.Mock).mockRejectedValueOnce(new Error('Wild error!'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementationOnce(() => {});

    render(
      <AppLayout>
        <span data-testid="children">This is a placeholder</span>
      </AppLayout>,
    );

    await act(async () => {
      jest.advanceTimersByTime(1_100);
    });

    expect(useSettingsStore.getState().settings.capabilities).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('Error when fetching capabilities', expect.any(Error));
  });
});
