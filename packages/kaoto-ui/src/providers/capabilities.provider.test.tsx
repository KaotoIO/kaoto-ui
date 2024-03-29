import { capabilitiesStub } from '../stubs';
import { CapabilitiesProvider } from './capabilities.provider';
import { fetchBackendVersion, fetchCapabilities } from '@kaoto/api';
import { initDsl, useSettingsStore } from '@kaoto/store';
import { act, render } from '@testing-library/react';

jest.mock('@kaoto/api', () => {
  const actual = jest.requireActual('@kaoto/api');

  return {
    ...actual,
    fetchBackendVersion: jest.fn(),
    fetchCapabilities: jest.fn(),
  };
});

describe('capabilities.provider.tsx', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    (fetchBackendVersion as jest.Mock).mockRejectedValue(null);
    (fetchCapabilities as jest.Mock).mockResolvedValue({ dsls: [initDsl] });
    consoleSpy = jest.spyOn(console, 'error').mockImplementationOnce(() => {});
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
    (fetchBackendVersion as jest.Mock).mockClear();
    (fetchCapabilities as jest.Mock).mockClear();
  });

  test('component renders in loading mode', async () => {
    const wrapper = await act(async () =>
      render(
        <CapabilitiesProvider>
          <span data-testid="children">This is a placeholder</span>
        </CapabilitiesProvider>,
      ),
    );

    const element = wrapper.queryByTestId('children');
    expect(element).not.toBeInTheDocument();
  });

  test('component times out and display error message', async () => {
    const wrapper = await act(async () =>
      render(
        <CapabilitiesProvider>
          <span data-testid="children">This is a placeholder</span>
        </CapabilitiesProvider>,
      ),
    );

    for (let i = 0; i <= 120; i++) {
      await act(async () => {
        jest.advanceTimersByTime(1_100);
      });
    }

    const element = wrapper.queryByText('Kaoto API is unreachable');
    expect(element).toBeInTheDocument();
  });

  test('component times out and display error message when the capabilities API fails', async () => {
    (fetchBackendVersion as jest.Mock).mockResolvedValueOnce('1.0-backend-version');
    (fetchCapabilities as jest.Mock).mockRejectedValueOnce(new Error('Wild error!'));

    const wrapper = await act(async () =>
      render(
        <CapabilitiesProvider>
          <span data-testid="children">This is a placeholder</span>
        </CapabilitiesProvider>,
      ),
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
    (fetchCapabilities as jest.Mock).mockResolvedValueOnce([initDsl]);

    const wrapper = await act(async () =>
      render(
        <CapabilitiesProvider>
          <span data-testid="children">This is a placeholder</span>
        </CapabilitiesProvider>,
      ),
    );

    await act(async () => {
      jest.advanceTimersByTime(1_100);
    });

    const element = wrapper.queryByText('This is a placeholder');
    expect(element).toBeInTheDocument();
  });

  test('component fetch capabilities and saves it to the settings store', async () => {
    (fetchBackendVersion as jest.Mock).mockResolvedValueOnce('1.0-backend-version');
    (fetchCapabilities as jest.Mock).mockResolvedValueOnce([capabilitiesStub[0]]);

    await act(async () =>
      render(
        <CapabilitiesProvider>
          <span data-testid="children">This is a placeholder</span>
        </CapabilitiesProvider>,
      ),
    );

    await act(async () => {
      jest.advanceTimersByTime(1_100);
    });

    expect(useSettingsStore.getState().settings.capabilities[0].name).toEqual('Integration');
  });

  test('component fetch capabilities and errors out', async () => {
    (fetchBackendVersion as jest.Mock).mockResolvedValueOnce('1.0-backend-version');
    (fetchCapabilities as jest.Mock).mockRejectedValueOnce(new Error('Wild error!'));

    await act(async () =>
      render(
        <CapabilitiesProvider>
          <span data-testid="children">This is a placeholder</span>
        </CapabilitiesProvider>,
      ),
    );

    await act(async () => {
      jest.advanceTimersByTime(1_100);
    });

    expect(useSettingsStore.getState().settings.capabilities).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('Error when fetching capabilities', expect.any(Error));
  });
});
