import { integrationJsonInitialState, useIntegrationJsonStore } from './integrationJsonStore';
import { act, renderHook } from '@testing-library/react';

describe('integrationJsonStore', () => {
  it('store works', () => {
    const { result } = renderHook(() => useIntegrationJsonStore());
    expect(result.current.integrationJson).toMatchObject(
      integrationJsonInitialState.integrationJson
    );
    expect(result.current.views).toEqual([]);
  });

  it('appendStep', () => {
    const { result } = renderHook(() => useIntegrationJsonStore());
    act(() => {
      result.current.updateIntegration({
        ...integrationJsonInitialState,
        steps: [{ UUID: 'first', maxBranches: 0, minBranches: 0, name: '', type: '' }],
      });

      result.current.appendStep({
        UUID: 'second',
        maxBranches: 0,
        minBranches: 0,
        name: '',
        type: '',
      });
    });

    expect(result.current.integrationJson.steps).toHaveLength(2);
  });

  it('deleteBranchStep', () => {
    const { result } = renderHook(() => useIntegrationJsonStore());
    act(() => {
      result.current.updateIntegration({
        ...integrationJsonInitialState,
        steps: [
          {
            UUID: 'first',
            maxBranches: 0,
            minBranches: 0,
            name: '',
            type: '',
            branches: [{ steps: [{ UUID: 'a-branch-step' }] }],
          },
        ],
      });
    });

    // result.current.deleteBranchStep();

    // expect(result.current.integrationJson).toHaveLength(1);
    // expect(result.current.integrationJson).toEqual(1);
  });

  it('deleteIntegration', () => {
    // const { result } = renderHook(() => useIntegrationJsonStore());
    act(() => {
      //
    });

    // expect(result.current.integrationJson).toHaveLength(1);
    // expect(result.current.integrationJson).toEqual(1);
  });

  it('deleteStep', () => {
    // const { result } = renderHook(() => useIntegrationJsonStore());
    act(() => {
      //
    });

    // expect(result.current.integrationJson).toHaveLength(1);
    // expect(result.current.integrationJson).toEqual(1);
  });

  it('deleteSteps', () => {
    // const { result } = renderHook(() => useIntegrationJsonStore());
    act(() => {
      //
    });

    // expect(result.current.integrationJson).toHaveLength(1);
    // expect(result.current.integrationJson).toEqual(1);
  });

  it('insertStep', () => {
    // const { result } = renderHook(() => useIntegrationJsonStore());
    act(() => {
      //
    });

    // expect(result.current.integrationJson).toHaveLength(1);
    // expect(result.current.integrationJson).toEqual(1);
  });

  it('prependStep', () => {
    // const { result } = renderHook(() => useIntegrationJsonStore());
    act(() => {
      //
    });

    // expect(result.current.integrationJson).toHaveLength(1);
    // expect(result.current.integrationJson).toEqual(1);
  });

  it('replaceBranchParentStep', () => {
    // const { result } = renderHook(() => useIntegrationJsonStore());
    act(() => {
      //
    });

    // expect(result.current.integrationJson).toHaveLength(1);
    // expect(result.current.integrationJson).toEqual(1);
  });

  it('replaceStep', () => {
    // const { result } = renderHook(() => useIntegrationJsonStore());
    act(() => {
      //
    });

    // expect(result.current.integrationJson).toHaveLength(1);
    // expect(result.current.integrationJson).toEqual(1);
  });

  it('setViews', () => {
    // const { result } = renderHook(() => useIntegrationJsonStore());
    act(() => {
      //
    });

    // expect(result.current.integrationJson).toHaveLength(1);
    // expect(result.current.integrationJson).toEqual(1);
  });

  it('updateIntegration', () => {
    // const { result } = renderHook(() => useIntegrationJsonStore());
    act(() => {
      //
    });

    // expect(result.current.integrationJson).toHaveLength(1);
    // expect(result.current.integrationJson).toEqual(1);
  });
});
