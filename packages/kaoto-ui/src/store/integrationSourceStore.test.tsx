import YAML from './data/yaml';
import { useIntegrationSourceStore } from './integrationSourceStore';
import { act, renderHook } from '@testing-library/react';

describe('integrationSourceStore', () => {
  it('store works', () => {
    const { result } = renderHook(() => useIntegrationSourceStore());
    expect(result.current.sourceCode).toEqual('');
  });

  it('setSourceCode: updates store to provided YAML', () => {
    const { result } = renderHook(() => useIntegrationSourceStore());
    act(() => {
      result.current.setSourceCode(YAML);
    });
    expect(result.current.sourceCode).toEqual(YAML);
  });
});
