import { camelRouteMultiYaml } from '../stubs/source-code';
import { KogitoEditorIntegrationProvider } from './KogitoEditorIntegrationProvider';
import { fetchIntegrationSourceCode } from '@kaoto/api';
import { useFlowsStore } from '@kaoto/store';
import { act, render, screen } from '@testing-library/react';

describe('KogitoEditorIntegrationProvider', () => {
  beforeEach(() => {
    useFlowsStore.getState().deleteAllFlows();
    useFlowsStore.getState().addNewFlow('Integration');
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('detects metadata update', async () => {
    const sourceCode = camelRouteMultiYaml;
    (fetchIntegrationSourceCode as jest.Mock).mockResolvedValue(sourceCode);
    const onReady = jest.fn();
    const onContentChanged = jest.fn();
    render(
      <KogitoEditorIntegrationProvider
        children={<>keip-test</>}
        content={sourceCode}
        contentPath={''}
        onContentChanged={onContentChanged}
        onReady={onReady}
      ></KogitoEditorIntegrationProvider>,
    );
    const text = screen.getByText('keip-test');
    expect(text).toHaveTextContent('keip-test');
    expect(onContentChanged.mock.calls.length).toBe(0);
    await act(() =>
      useFlowsStore.getState().setMetadata('beans', [{ name: 'testBean', type: 'testBeanType' }]),
    );
    expect(onContentChanged.mock.calls.length).toBe(1);
  });
});
