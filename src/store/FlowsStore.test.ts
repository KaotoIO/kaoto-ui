import { NestedStepsService } from '../services/NestedStepsService';
import { debeziumMongoDBStep, flowWithBranch, initialFlows, kameletSourceStepStub } from '../stubs';
import { useFlowsStore } from './FlowsStore';
import { useVisualizationStore } from './visualizationStore';
import { IFlowsWrapper, IIntegration, IViewProps } from '@kaoto/types';
import { act, renderHook } from '@testing-library/react';

describe('FlowsStoreFacade', () => {
  const flowId = 'route-1234';

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

  describe('insertStep', () => {
    it('should return the same state if the flow does not exist', () => {
      const { result } = renderHook(() => useFlowsStore());

      act(() => {
        result.current.deleteAllFlows();
        result.current.insertStep(flowId, debeziumMongoDBStep, { mode: 'append' });
      });

      expect(result.current.flows).toMatchObject([]);
    });

    it('should append a new step at the end of the steps array', () => {
      const { result } = renderHook(() => useFlowsStore());

      act(() => {
        result.current.deleteAllFlows();
        result.current.addNewFlow('Integration', flowId);
        result.current.insertStep(flowId, debeziumMongoDBStep, { mode: 'append' });
      });

      expect(result.current.flows).toMatchObject([
        {
          id: flowId,
          steps: [
            {
              ...debeziumMongoDBStep,
              UUID: 'route-1234_debezium-mongodb-0',
              integrationId: flowId,
            },
          ],
        },
      ]);
    });

    it('should insert a new step at the given index', () => {
      const { result } = renderHook(() => useFlowsStore());

      act(() => {
        result.current.deleteAllFlows();
        result.current.addNewFlow('Integration', flowId);
        result.current.insertStep(flowId, debeziumMongoDBStep, { mode: 'append' });
        result.current.insertStep(flowId, kameletSourceStepStub, { mode: 'insert', index: 1 });
      });

      expect(result.current.flows).toMatchObject([
        {
          id: flowId,
          steps: [
            {
              ...debeziumMongoDBStep,
              UUID: 'route-1234_debezium-mongodb-0',
              integrationId: flowId,
            },
            {
              ...kameletSourceStepStub,
              UUID: 'route-1234_timer-source-1',
              integrationId: flowId,
            },
          ],
        },
      ]);
    });

    it('should insert a new step at the 0 index', () => {
      const { result } = renderHook(() => useFlowsStore());

      act(() => {
        result.current.deleteAllFlows();
        result.current.addNewFlow('Integration', flowId);
        result.current.insertStep(flowId, debeziumMongoDBStep, { mode: 'append' });
        result.current.insertStep(flowId, kameletSourceStepStub, { mode: 'insert', index: 0 });
      });

      expect(result.current.flows).toMatchObject([
        {
          id: flowId,
          steps: [
            {
              ...kameletSourceStepStub,
              UUID: 'route-1234_timer-source-0',
              integrationId: flowId,
            },
            {
              ...debeziumMongoDBStep,
              UUID: 'route-1234_debezium-mongodb-1',
              integrationId: flowId,
            },
          ],
        },
      ]);
    });

    it('should replace a step at the given index', () => {
      const { result } = renderHook(() => useFlowsStore());

      act(() => {
        result.current.deleteAllFlows();
        result.current.addNewFlow('Integration', flowId);
        result.current.insertStep(flowId, kameletSourceStepStub, { mode: 'append' });
        result.current.insertStep(flowId, kameletSourceStepStub, { mode: 'append' });
        result.current.insertStep(flowId, debeziumMongoDBStep, { mode: 'replace', index: 0 });
      });

      expect(result.current.flows).toMatchObject([
        {
          id: flowId,
          steps: [
            {
              ...debeziumMongoDBStep,
              UUID: 'route-1234_debezium-mongodb-0',
              integrationId: flowId,
            },
            {
              ...kameletSourceStepStub,
              UUID: 'route-1234_timer-source-1',
              integrationId: flowId,
            },
          ],
        },
      ]);
    });

    it('should replace a step at the given path using the path property', () => {
      const { result } = renderHook(() => useFlowsStore());

      act(() => {
        result.current.deleteAllFlows();
        result.current.addNewFlow('Integration', flowId);
        result.current.insertStep(flowId, kameletSourceStepStub, { mode: 'append' });
        result.current.insertStep(flowId, kameletSourceStepStub, { mode: 'append' });
        result.current.insertStep(flowId, debeziumMongoDBStep, { mode: 'replace', path: ['0'] });
      });

      expect(result.current.flows).toMatchObject([
        {
          id: flowId,
          steps: [
            {
              ...debeziumMongoDBStep,
              UUID: 'route-1234_debezium-mongodb-0',
              integrationId: flowId,
            },
            {
              ...kameletSourceStepStub,
              UUID: 'route-1234_timer-source-1',
              integrationId: flowId,
            },
          ],
        },
      ]);
    });

    it('should replace a step at the given path using the path property with a nested path', () => {
      const { result } = renderHook(() => useFlowsStore());

      act(() => {
        result.current.setFlowsWrapper({ flows: [flowWithBranch], metadata: {}, properties: {} });
        result.current.insertStep('route-1814', debeziumMongoDBStep, {
          mode: 'replace',
          path: ['1', 'branches', '0', 'steps', '0'],
        });
      });

      expect(result.current.flows).toMatchObject([
        {
          id: 'route-1814',
          steps: [
            flowWithBranch.steps[0],
            {
              ...flowWithBranch.steps[1],
              branches: [
                {
                  steps: [
                    {
                      ...debeziumMongoDBStep,
                      UUID: 'route-1814_pipeline-1_branch-0_debezium-mongodb-0',
                      integrationId: 'route-1814',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);
    });
  });

  describe('deleteStep', () => {
    it('should return the same state if the flow does not exist', () => {
      const { result } = renderHook(() => useFlowsStore());

      act(() => {
        result.current.deleteAllFlows();
        result.current.addNewFlow('Integration', 'another-flow');
        result.current.deleteStep(flowId, 'step-1234');
      });

      expect(result.current.flows).toMatchObject([
        {
          description: '',
          dsl: 'Integration',
          id: 'another-flow',
          metadata: {},
          params: [],
          steps: [],
        },
      ]);
    });

    it('should allow consumers to delete a step', () => {
      const { result } = renderHook(() => useFlowsStore());

      act(() => {
        result.current.deleteAllFlows();
        result.current.addNewFlow('Integration', flowId);
        result.current.insertStep(flowId, kameletSourceStepStub, { mode: 'append' });
        result.current.deleteStep(flowId, 'route-1234_timer-source-0');
      });

      expect(result.current.flows).toMatchObject([
        {
          id: flowId,
          steps: [],
        },
      ]);
    });

    /**
     * The following test it's disabled since this logic is embedded on StepsService#deleteStep
     * TODO: enable this test once the logic is moved to the Flows store
     */
    it.skip('should update nestedStepStore upon deleting a nested step', () => {
      const { result } = renderHook(() => useFlowsStore());

      act(() => {
        result.current.setFlowsWrapper({ flows: [flowWithBranch], metadata: {}, properties: {} });
        result.current.deleteStep('route-1814', 'route-1814_pipeline-1_branch-0_log-0');
      });

      expect(result.current.flows).toMatchObject([
        {
          id: 'route-1814',
          steps: [
            flowWithBranch.steps[0],
            { ...flowWithBranch.steps[1], branches: [{ steps: [] }] },
          ],
        },
      ]);
    });
  });

  describe('addNewFlow', () => {
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

  describe('setFlowsWrapper', () => {
    it('should extract nested steps upon setting the Flows wrapper object', () => {
      const extractNestedStepsSpy = jest.spyOn(NestedStepsService, 'extractNestedSteps');

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

    it('should set a flow id is not set already', () => {
      useFlowsStore.getState().setFlowsWrapper({
        flows: [
          {
            ...initialFlows[0],
            dsl: 'KameletBinding',
            id: undefined,
            steps: [kameletSourceStepStub],
          } as unknown as IIntegration,
        ],
        metadata: {},
        properties: {},
      } as IFlowsWrapper);

      expect(useFlowsStore.getState().flows).toMatchObject([
        {
          dsl: 'KameletBinding',
          id: 'KameletBinding-0',
          metadata: {
            name: 'integration',
            namespace: '',
          },
          params: [],
          steps: [
            {
              UUID: 'KameletBinding-0_timer-source-0',
              branches: [],
              description: 'Produces periodic messages with a custom payload.',
              group: 'Timer',
              icon: 'data:image/svg+xml;base64,',
              id: 'timer-source',
              integrationId: 'KameletBinding-0',
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
