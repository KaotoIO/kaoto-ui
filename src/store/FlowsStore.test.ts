import { initialFlows, kameletSourceStepStub } from '../stubs';
import { useFlowsStore } from './FlowsStore';
import { useVisualizationStore } from './visualizationStore';
import { StepsService } from '@kaoto/services';
import { IFlowsWrapper, IViewProps } from '@kaoto/types';
import { act, renderHook } from '@testing-library/react';

describe('FlowsStoreFacade', () => {
  it('should start with a default value', () => {
    const initialState = useFlowsStore.getState();

    expect(initialState).toMatchObject({
      flows: [
        {
          id: /Camel Route-\d*/,
          dsl: 'Camel Route',
          description: '',
          metadata: {},
          params: [],
          steps: [],
        },
      ],
      properties: {},
      views: [],
      metadata: {},
    });
  });

  it('should allow consumers to add a new flow', () => {
    useFlowsStore.getState().addNewFlow('Integration');

    expect(useFlowsStore.getState().flows).toMatchObject([
      {
        description: '',
        dsl: 'Camel Route',
        id: /Camel Route-\d*/,
        metadata: {
          name: 'integration',
          namespace: '',
        },
        params: [],
        steps: [],
      },
      {
        description: '',
        dsl: 'Integration',
        id: /Integration-\d*/,
        metadata: {},
        params: [],
        steps: [],
      },
    ]);
  });

  it('should allow consumers to add a new flow with a given ID', () => {
    useFlowsStore.getState().addNewFlow('Integration', 'Arbitrary ID');

    expect(useFlowsStore.getState().flows).toMatchObject([
      {
        description: '',
        dsl: 'Camel Route',
        id: /Camel Route-\d*/,
        metadata: {
          name: 'integration',
          namespace: '',
        },
        params: [],
        steps: [],
      },
      {
        description: '',
        dsl: 'Integration',
        id: 'Arbitrary ID',
        metadata: {},
        params: [],
        steps: [],
      },
    ]);
  });

  it('should hide previous flows and only show the newly created one', () => {
    const { result: visualizationStoreRef } = renderHook(() => useVisualizationStore());
    const { result: flowsStoreRef } = renderHook(() => useFlowsStore());

    act(() => {
      flowsStoreRef.current.deleteAllFlows();
      flowsStoreRef.current.addNewFlow('Integration', 'route-1234');
      flowsStoreRef.current.addNewFlow('Integration', 'route-4321');
    });

    expect(flowsStoreRef.current.flows).toHaveLength(2);

    expect(visualizationStoreRef.current.visibleFlows).toEqual({
      'route-1234': false,
      'route-4321': true,
    });
  });

  it('should allow consumers to update views', () => {
    useFlowsStore
      .getState()
      .updateViews([{ id: 'ID1', name: 'View Name', type: 'STEP' }] as IViewProps[]);

    expect(useFlowsStore.getState().views).toMatchObject([
      { id: 'ID1', name: 'View Name', type: 'STEP' },
    ]);
  });

  it('should extract nested steps upon setting the Flows wrapper object', () => {
    const extractNestedStepsSpy = jest.spyOn(StepsService, 'extractNestedSteps');

    useFlowsStore.getState().setFlowsWrapper({
      flows: [{ ...initialFlows[0], steps: [kameletSourceStepStub] }],
      metadata: {},
      properties: {},
    } as IFlowsWrapper);

    expect(extractNestedStepsSpy).toHaveBeenCalledTimes(1);
    expect(extractNestedStepsSpy).toHaveBeenCalledWith([
      {
        ...kameletSourceStepStub,
        UUID: 'Camel Route-1_timer-source-0',
        integrationId: 'Camel Route-1',
      },
    ]);
  });

  it('should allow consumers to set the Flows wrapper object', () => {
    useFlowsStore.getState().setFlowsWrapper({
      flows: [{ ...initialFlows[0], steps: [kameletSourceStepStub] }],
      metadata: {},
      properties: {},
    } as IFlowsWrapper);

    expect(useFlowsStore.getState().flows).toMatchObject([
      {
        dsl: 'Camel Route',
        id: 'Camel Route-1',
        metadata: {
          name: 'integration',
          namespace: '',
        },
        params: [],
        steps: [
          {
            UUID: 'Camel Route-1_timer-source-0',
            branches: [],
            description: 'Produces periodic messages with a custom payload.',
            group: 'Timer',
            icon: 'data:image/svg+xml;base64,',
            id: 'timer-source',
            integrationId: 'Camel Route-1',
            kind: 'Kamelet',
            maxBranches: 1,
            minBranches: 0,
            name: 'timer-source',
            parameters: [],
            required: [],
            title: 'Timer Source',
            type: 'START',
          },
        ],
      },
    ]);
  });

  it('should allow consumers to delete a flow', () => {
    useFlowsStore.getState().deleteAllFlows();
    useFlowsStore.getState().addNewFlow('Integration', 'route-1234');

    useFlowsStore.getState().deleteFlow('route-1234');

    expect(useFlowsStore.getState().flows).toHaveLength(0);
  });

  it('should allow consumers to delete all flows', () => {
    useFlowsStore.getState().deleteAllFlows();

    expect(useFlowsStore.getState().flows).toHaveLength(0);
  });

  it('should clean useVisualizationStore.visibleFlows after deleting all flows', () => {
    useFlowsStore.getState().addNewFlow('Integration');
    useFlowsStore.getState().deleteAllFlows();

    expect(useFlowsStore.getState().flows).toHaveLength(0);
    expect(useVisualizationStore.getState().visibleFlows).toEqual({});
  });
});
