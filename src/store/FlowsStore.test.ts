import { initialFlows, kameletSourceStepStub } from '../stubs';
import { useFlowsStore } from './FlowsStore';
import { StepsService } from '@kaoto/services';
import { IFlowsWrapper, IViewProps } from '@kaoto/types';

describe('FlowsStoreFacade', () => {
  it('should start with a default value', () => {
    const initialState = useFlowsStore.getState();

    expect(initialState).toMatchObject({
      flows: [
        {
          id: /Camel Route-[0-9]*/,
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
        id: /Camel Route-[0-9]*/,
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
        id: /Integration-[0-9]*/,
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
        id: /Camel Route-[0-9]*/,
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
        UUID: 'Camel Route-0_timer-source-0',
        integrationId: 'Camel Route-0',
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
        id: 'Camel Route-0',
        metadata: {
          name: 'integration',
          namespace: '',
        },
        params: [],
        steps: [
          {
            UUID: 'Camel Route-0_timer-source-0',
            branches: [],
            description: 'Produces periodic messages with a custom payload.',
            group: 'Timer',
            icon: 'data:image/svg+xml;base64,',
            id: 'timer-source',
            integrationId: 'Camel Route-0',
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

  it('should allow consumers to delete all flows', () => {
    useFlowsStore.getState().deleteAllFlows();

    expect(useFlowsStore.getState().flows).toHaveLength(0);
  });
});
