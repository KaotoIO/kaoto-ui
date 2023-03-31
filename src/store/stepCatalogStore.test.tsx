import useStepCatalogStore from './stepCatalogStore';
import { IStepProps } from '@kaoto/types';
import { act, renderHook } from '@testing-library/react';

describe('stepCatalogStore', () => {
  it('setDsl', () => {
    const { result } = renderHook(() => useStepCatalogStore());

    act(() => {
      result.current.setDsl('KameletBinding');
    });

    expect(result.current.dsl).toEqual('KameletBinding');
  });

  it('setStepCatalog', () => {
    const { result } = renderHook(() => useStepCatalogStore());

    act(() => {
      result.current.setStepCatalog([{}, {}, {}] as IStepProps[]);
    });

    expect(result.current.stepCatalog).toHaveLength(3);
  });
});
