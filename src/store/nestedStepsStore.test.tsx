import { useNestedStepsStore } from './nestedStepsStore';
import { INestedStep } from '@kaoto/types';
import { act, renderHook } from '@testing-library/react';

describe('nestedStepsStore', () => {
  it('store works', () => {
    const { result } = renderHook(() => useNestedStepsStore());
    expect(result.current.nestedSteps).toHaveLength(0);
  });

  it('addStep: adds a nested step', () => {
    const { result } = renderHook(() => useNestedStepsStore());
    act(() => {
      result.current.addStep({
        stepUuid: 'durian',
      } as INestedStep);
    });

    expect(result.current.nestedSteps).toHaveLength(1);
  });

  it('clearNestedSteps: resets store state back to initial state', () => {
    const { result } = renderHook(() => useNestedStepsStore());
    act(() => {
      result.current.clearNestedSteps();
    });

    expect(result.current.nestedSteps).toHaveLength(0);
  });

  it('deleteStep: removes step containing specified UUID', () => {
    const { result } = renderHook(() => useNestedStepsStore());
    act(() => {
      result.current.addStep({
        stepUuid: 'raspberry',
      } as INestedStep);
    });

    expect(result.current.nestedSteps).toHaveLength(1);

    act(() => {
      result.current.deleteStep('example-step');
    });

    expect(result.current.nestedSteps).toHaveLength(0);
  });

  it('updateSteps: updates store to provided array of nested steps', () => {
    const { result } = renderHook(() => useNestedStepsStore());
    act(() => {
      result.current.updateSteps([
        {
          stepUuid: 'plum',
        },
        {
          stepUuid: 'prune',
        },
      ] as INestedStep[]);
    });

    expect(result.current.nestedSteps).toHaveLength(2);
    expect(result.current.nestedSteps).toEqual([
      {
        stepUuid: 'plum',
      },
      {
        stepUuid: 'prune',
      },
    ]);
  });
});
