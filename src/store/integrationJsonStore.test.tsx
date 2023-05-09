import { integrationJsonInitialState, useIntegrationJsonStore } from './integrationJsonStore';
import { IStepProps, IStepPropsBranch } from '@kaoto/types';
import { act, renderHook } from '@testing-library/react';

describe('integrationJsonStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useIntegrationJsonStore());
    act(() => {
      result.current.deleteIntegration();
    });
  });

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
        ...integrationJsonInitialState.integrationJson,
        steps: [{ name: 'apple' }] as IStepProps[],
      });

      result.current.appendStep({
        name: 'lychee',
      } as IStepProps);
    });

    expect(result.current.integrationJson.steps).toHaveLength(2);
  });

  it('deleteBranchStep', () => {
    // we should probably evaluate whether this method is needed, or
    // at least rename or refactor it
    const { result } = renderHook(() => useIntegrationJsonStore());
    act(() => {
      result.current.updateIntegration({
        ...integrationJsonInitialState.integrationJson,
        steps: [
          {
            name: 'peach',
            branches: [{ steps: [{ name: 'a-branch-step' }] }],
          },
        ] as IStepProps[],
      });
    });

    expect(result.current.integrationJson.steps[0].branches![0].steps).toHaveLength(1);

    // replace with an empty branch
    const newBranch = { steps: [] as IStepProps[] } as IStepPropsBranch;
    act(() => {
      result.current.deleteBranchStep(
        {
          name: 'peach',
          branches: [newBranch] as IStepPropsBranch[],
        } as IStepProps,
        0
      );
    });

    expect(result.current.integrationJson.steps[0].branches![0].steps).toHaveLength(0);
  });

  it('deleteIntegration', () => {
    const { result } = renderHook(() => useIntegrationJsonStore());

    act(() => {
      result.current.deleteIntegration();
    });

    expect(result.current.integrationJson).toMatchObject(
      integrationJsonInitialState.integrationJson
    );
  });

  it('deleteStep', () => {
    const { result } = renderHook(() => useIntegrationJsonStore());
    act(() => {
      result.current.updateIntegration({
        ...integrationJsonInitialState.integrationJson,
        steps: [
          { name: 'cantaloupe' },
          { name: 'watermelon' },
          { name: 'strawberry' },
        ] as IStepProps[],
      });
      result.current.deleteStep(1);
    });

    expect(result.current.integrationJson.steps).toHaveLength(2);
  });

  it('deleteSteps', () => {
    const { result } = renderHook(() => useIntegrationJsonStore());
    act(() => {
      result.current.updateIntegration({
        ...integrationJsonInitialState.integrationJson,
        steps: [{ name: 'kiwi' }, { name: 'mango' }, { name: 'papaya' }] as IStepProps[],
      });

      result.current.deleteSteps();
    });

    expect(result.current.integrationJson.steps).toHaveLength(0);
  });

  it('insertStep', () => {
    const { result } = renderHook(() => useIntegrationJsonStore());
    act(() => {
      result.current.updateIntegration({
        ...integrationJsonInitialState.integrationJson,
        steps: [{ name: 'pear' }, { name: 'pineapple' }, { name: 'grape' }] as IStepProps[],
      });
      result.current.insertStep({ name: 'blackberry' } as IStepProps, 1);
    });

    expect(result.current.integrationJson.steps).toHaveLength(4);
    expect(result.current.integrationJson.steps[1]).toEqual({
      UUID: 'Camel Route-1_blackberry-1',
      name: 'blackberry',
    });
  });

  it('prependStep', () => {
    const { result } = renderHook(() => useIntegrationJsonStore());
    act(() => {
      result.current.updateIntegration({
        ...integrationJsonInitialState.integrationJson,
        steps: [{ name: 'banana' }] as IStepProps[],
      });

      result.current.prependStep(0, { name: 'blueberry' } as IStepProps);
    });

    expect(result.current.integrationJson.steps).toHaveLength(2);
    expect(result.current.integrationJson.steps[0].name).toEqual('blueberry');
  });

  it('replaceBranchParentStep', () => {
    const { result } = renderHook(() => useIntegrationJsonStore());
    act(() => {
      result.current.updateIntegration({
        ...integrationJsonInitialState.integrationJson,
        steps: [
          {
            name: 'satsuma',
          },
          {
            name: 'orange',
            branches: [
              { steps: [{ name: 'dragonfruit', branches: [{ steps: [{ name: 'guava' }] }] }] },
            ],
          },
        ] as IStepProps[],
      });

      // replace with an empty branch
      const newBranch = {
        steps: [{ name: 'apricot', branches: [{ steps: [{ name: 'guava' }] }] }] as IStepProps[],
      } as IStepPropsBranch;

      // we want to replace the 'dragonfruit' step, but keep its branch the same
      result.current.replaceBranchParentStep(
        {
          name: 'orange',
          branches: [newBranch] as IStepPropsBranch[],
        } as IStepProps,
        ['1', 'branches', '0', 'steps', '0']
      );
    });

    expect(result.current.integrationJson.steps).toHaveLength(2);
    expect(result.current.integrationJson.steps[1].branches![0].steps[0].name).toEqual('orange');
  });

  it('replaceStep', () => {
    const { result } = renderHook(() => useIntegrationJsonStore());
    act(() => {
      result.current.updateIntegration({
        ...integrationJsonInitialState.integrationJson,
        steps: [{ name: 'blackcurrant' }, { name: 'grapefruit' }] as IStepProps[],
      });
      result.current.replaceStep({ name: 'pomegranate' } as IStepProps, 1);
    });

    expect(result.current.integrationJson.steps).toHaveLength(2);
    expect(result.current.integrationJson.steps[1].name).toEqual('pomegranate');
  });

  it('updateViews', () => {
    const { result } = renderHook(() => useIntegrationJsonStore());
    act(() => {
      result.current.updateViews([
        {
          name: 'Integration View',
          type: 'generic',
          id: 'integration',
          step: '',
          url: '',
          constraints: [],
          scope: '',
          module: '',
        },
      ]);
    });

    expect(result.current.views).toHaveLength(1);
  });

  it('updateIntegration', () => {
    const { result } = renderHook(() => useIntegrationJsonStore());
    act(() => {
      result.current.updateIntegration({
        ...integrationJsonInitialState.integrationJson,
        steps: [{ name: 'mulberry' }, { name: 'lemon' }, { name: 'cranberry' }] as IStepProps[],
      });
    });

    expect(result.current.integrationJson.steps).toHaveLength(3);
  });
});
