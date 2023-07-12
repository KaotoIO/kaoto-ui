import { FlowsService } from '../services/FlowsService';
import { NestedStepsService } from '../services/NestedStepsService';
import { debeziumMongoDBStep, flowWithBranch, initialFlows, kameletSourceStepStub } from '../stubs';
import { useFlowsStore } from './FlowsStore';
import { useVisualizationStore } from './visualizationStore';
import { IFlowsWrapper, IIntegration, IViewProps } from '@kaoto/types';
import { act, renderHook } from '@testing-library/react';

describe('FlowsStore - initial state', () => {
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
});

describe('FlowsStore', () => {
  const MOCK_FLOW_ID = 'route-1234';
  const MOCK_FLOW_ID_2 = 'route-4321';

  beforeEach(() => {
    useFlowsStore.getState().deleteAllFlows();

    jest.spyOn(FlowsService, 'getNewFlowId').mockReturnValueOnce(MOCK_FLOW_ID);
    jest.spyOn(FlowsService, 'getNewFlowId').mockReturnValueOnce(MOCK_FLOW_ID_2);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('insertStep', () => {
    it('should return the same state if the flow does not exist', () => {
      const { result } = renderHook(() => useFlowsStore());

      act(() => {
        result.current.deleteAllFlows();
        result.current.insertStep('non-existing-id', debeziumMongoDBStep, { mode: 'append' });
      });

      expect(result.current.flows).toMatchObject([]);
    });

    it('should append a new step at the end of the steps array', () => {
      const { result } = renderHook(() => useFlowsStore());

      act(() => {
        result.current.addNewFlow('Integration');
        result.current.insertStep(MOCK_FLOW_ID, debeziumMongoDBStep, { mode: 'append' });
      });

      expect(result.current.flows).toMatchObject([
        {
          id: MOCK_FLOW_ID,
          steps: [
            {
              ...debeziumMongoDBStep,
              UUID: `${MOCK_FLOW_ID}_debezium-mongodb-0`,
              integrationId: MOCK_FLOW_ID,
            },
          ],
        },
      ]);
    });

    it('should insert a new step at the given index', () => {
      const { result } = renderHook(() => useFlowsStore());

      act(() => {
        result.current.addNewFlow('Integration');
        result.current.insertStep(MOCK_FLOW_ID, debeziumMongoDBStep, { mode: 'append' });
        result.current.insertStep(MOCK_FLOW_ID, kameletSourceStepStub, {
          mode: 'insert',
          index: 1,
        });
      });

      expect(result.current.flows).toMatchObject([
        {
          id: MOCK_FLOW_ID,
          steps: [
            {
              ...debeziumMongoDBStep,
              UUID: `${MOCK_FLOW_ID}_debezium-mongodb-0`,
              integrationId: MOCK_FLOW_ID,
            },
            {
              ...kameletSourceStepStub,
              UUID: `${MOCK_FLOW_ID}_timer-source-1`,
              integrationId: MOCK_FLOW_ID,
            },
          ],
        },
      ]);
    });

    it('should insert a new step at the 0 index', () => {
      const { result } = renderHook(() => useFlowsStore());

      act(() => {
        result.current.addNewFlow('Integration');
        result.current.insertStep(MOCK_FLOW_ID, debeziumMongoDBStep, { mode: 'append' });
        result.current.insertStep(MOCK_FLOW_ID, kameletSourceStepStub, {
          mode: 'insert',
          index: 0,
        });
      });

      expect(result.current.flows).toMatchObject([
        {
          id: MOCK_FLOW_ID,
          steps: [
            {
              ...kameletSourceStepStub,
              UUID: `${MOCK_FLOW_ID}_timer-source-0`,
              integrationId: MOCK_FLOW_ID,
            },
            {
              ...debeziumMongoDBStep,
              UUID: `${MOCK_FLOW_ID}_debezium-mongodb-1`,
              integrationId: MOCK_FLOW_ID,
            },
          ],
        },
      ]);
    });

    it('should replace a step at the given index', () => {
      const { result } = renderHook(() => useFlowsStore());

      act(() => {
        result.current.addNewFlow('Integration');
        result.current.insertStep(MOCK_FLOW_ID, kameletSourceStepStub, { mode: 'append' });
        result.current.insertStep(MOCK_FLOW_ID, kameletSourceStepStub, { mode: 'append' });
        result.current.insertStep(MOCK_FLOW_ID, debeziumMongoDBStep, {
          mode: 'replace',
          index: 0,
        });
      });

      expect(result.current.flows).toMatchObject([
        {
          id: MOCK_FLOW_ID,
          steps: [
            {
              ...debeziumMongoDBStep,
              UUID: `${MOCK_FLOW_ID}_debezium-mongodb-0`,
              integrationId: MOCK_FLOW_ID,
            },
            {
              ...kameletSourceStepStub,
              UUID: `${MOCK_FLOW_ID}_timer-source-1`,
              integrationId: MOCK_FLOW_ID,
            },
          ],
        },
      ]);
    });

    it('should replace a step at the given path using the path property', () => {
      const { result } = renderHook(() => useFlowsStore());

      act(() => {
        result.current.addNewFlow('Integration');
        result.current.insertStep(MOCK_FLOW_ID, kameletSourceStepStub, { mode: 'append' });
        result.current.insertStep(MOCK_FLOW_ID, kameletSourceStepStub, { mode: 'append' });
        result.current.insertStep(MOCK_FLOW_ID, debeziumMongoDBStep, {
          mode: 'replace',
          path: ['0'],
        });
      });

      expect(result.current.flows).toMatchObject([
        {
          id: MOCK_FLOW_ID,
          steps: [
            {
              ...debeziumMongoDBStep,
              UUID: `${MOCK_FLOW_ID}_debezium-mongodb-0`,
              integrationId: MOCK_FLOW_ID,
            },
            {
              ...kameletSourceStepStub,
              UUID: `${MOCK_FLOW_ID}_timer-source-1`,
              integrationId: MOCK_FLOW_ID,
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
        result.current.addNewFlow('Integration'); // MOCK_FLOW_ID
        result.current.deleteStep('non-existing-flow', 'step-1234');
      });

      expect(result.current.flows).toMatchObject([
        {
          description: '',
          dsl: 'Integration',
          id: MOCK_FLOW_ID,
          metadata: {
            name: MOCK_FLOW_ID,
          },
          params: [],
          steps: [],
        },
      ]);
    });

    it('should allow consumers to delete a step', () => {
      const { result } = renderHook(() => useFlowsStore());

      act(() => {
        result.current.addNewFlow('Integration');
        result.current.insertStep(MOCK_FLOW_ID, kameletSourceStepStub, { mode: 'append' });
        result.current.deleteStep(MOCK_FLOW_ID, `${MOCK_FLOW_ID}_timer-source-0`);
      });

      expect(result.current.flows).toMatchObject([
        {
          id: MOCK_FLOW_ID,
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
            {
              ...flowWithBranch.steps[1],
              branches: [{ ...flowWithBranch.steps[1].branches, steps: [] }],
            },
          ],
        },
      ]);
    });
  });

  describe('addNewFlow', () => {
    it('should allow consumers to add a new flow', () => {
      useFlowsStore.getState().addNewFlow('Integration');
      useFlowsStore.getState().addNewFlow('Integration');

      expect(useFlowsStore.getState().flows).toMatchObject([
        {
          description: '',
          dsl: 'Integration',
          id: MOCK_FLOW_ID,
          metadata: {
            name: MOCK_FLOW_ID,
          },
          params: [],
          steps: [],
        },
        {
          /** Newly created flow */
          description: '',
          dsl: 'Integration',
          id: MOCK_FLOW_ID_2,
          metadata: {
            name: MOCK_FLOW_ID_2,
          },
          params: [],
          steps: [],
        },
      ]);
    });

    it('should hide previous flows and only show the newly created one', () => {
      const { result: visualizationStoreRef } = renderHook(() => useVisualizationStore());
      const { result: flowsStoreRef } = renderHook(() => useFlowsStore());

      act(() => {
        flowsStoreRef.current.addNewFlow('Integration');
        flowsStoreRef.current.addNewFlow('Integration');
      });

      expect(flowsStoreRef.current.flows).toHaveLength(2);

      expect(visualizationStoreRef.current.visibleFlows).toEqual({
        [MOCK_FLOW_ID]: false,
        [MOCK_FLOW_ID_2]: true,
      });
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
            name: 'Camel Route-1',
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

    it('should set a flow id using the metadata.name field', () => {
      useFlowsStore.getState().setFlowsWrapper({
        flows: [
          {
            ...initialFlows[0],
            metadata: {
              name: 'A-custom-name',
            },
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
          id: 'A-custom-name',
          metadata: {
            name: 'A-custom-name',
          },
          params: [],
          steps: [
            {
              UUID: 'A-custom-name_timer-source-0',
              branches: [],
              description: 'Produces periodic messages with a custom payload.',
              group: 'Timer',
              icon: 'data:image/svg+xml;base64,',
              id: 'timer-source',
              integrationId: 'A-custom-name',
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

    it('should set a random flow id if none is provided', () => {
      useFlowsStore.getState().setFlowsWrapper({
        flows: [
          {
            ...initialFlows[0],
            metadata: undefined,
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
          id: MOCK_FLOW_ID,
          metadata: {
            name: MOCK_FLOW_ID,
          },
          params: [],
          steps: [
            {
              UUID: `${MOCK_FLOW_ID}_timer-source-0`,
              branches: [],
              description: 'Produces periodic messages with a custom payload.',
              group: 'Timer',
              icon: 'data:image/svg+xml;base64,',
              id: 'timer-source',
              integrationId: MOCK_FLOW_ID,
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

    it('should update the id of a duplicated flow id', () => {
      jest.spyOn(FlowsService, 'getNewFlowId').mockReset().mockReturnValue(MOCK_FLOW_ID_2);

      useFlowsStore.getState().setFlowsWrapper({
        flows: [
          {
            metadata: { name: MOCK_FLOW_ID },
            dsl: 'KameletBinding',
            steps: [],
          } as unknown as IIntegration,
          {
            metadata: { name: MOCK_FLOW_ID },
            dsl: 'KameletBinding',
            steps: [],
          } as unknown as IIntegration,
        ],
        metadata: {},
        properties: {},
      } as IFlowsWrapper);

      expect(useFlowsStore.getState().flows).toMatchObject([
        {
          dsl: 'KameletBinding',
          id: MOCK_FLOW_ID,
          metadata: {
            name: MOCK_FLOW_ID,
          },
          steps: [],
        },
        {
          dsl: 'KameletBinding',
          id: MOCK_FLOW_ID_2,
          metadata: {
            name: MOCK_FLOW_ID_2,
          },
          steps: [],
        },
      ]);
    });
  });

  it('should allow consumers to delete a flow', () => {
    useFlowsStore.getState().addNewFlow('Integration');

    useFlowsStore.getState().deleteFlow(MOCK_FLOW_ID);

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

  describe('setFlowName', () => {
    it('should allow consumers to set the name of a flow', () => {
      useFlowsStore.getState().addNewFlow('Integration');

      useFlowsStore.getState().setFlowName(MOCK_FLOW_ID, 'new-name');

      expect(useFlowsStore.getState().flows[0].metadata.name).toEqual('new-name');
    });

    it('should ignore non existing flows', () => {
      const initialState = useFlowsStore.getState();

      useFlowsStore.getState().setFlowName('non-existing-flow', 'new-name');

      expect(useFlowsStore.getState()).toEqual(initialState);
    });
  });

  it('should allow consumers to update the metadata property', () => {
    useFlowsStore.getState().deleteAllFlows();

    useFlowsStore.getState().setMetadata('beans', { name: 'foo', type: 'bar' });

    expect(useFlowsStore.getState().metadata).toEqual({ beans: { name: 'foo', type: 'bar' } });
  });
});
