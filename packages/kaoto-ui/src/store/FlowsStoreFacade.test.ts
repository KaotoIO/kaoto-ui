import { IFlowsStore, useFlowsStore } from './FlowsStore';
import { FlowsStoreFacade } from './FlowsStoreFacade';
import { IIntegration } from '@kaoto/types';

describe('FlowsStoreFacade', () => {
  describe('isSameDsl', () => {
    it('should return "true" if all existing flows are the same as the provided type', () => {
      useFlowsStore.setState({
        flows: [{ dsl: 'Integration' }, { dsl: 'Integration' }],
      } as IFlowsStore);

      const isSameDsl = FlowsStoreFacade.isSameDsl('Integration');

      expect(isSameDsl).toBeTruthy();
    });

    it('should return "true" if there is no flows', () => {
      useFlowsStore.setState({
        flows: [] as IIntegration[],
      } as IFlowsStore);

      const isSameDsl = FlowsStoreFacade.isSameDsl('Integration');

      expect(isSameDsl).toBeTruthy();
    });

    it('should return "false" if not all existing flows are the same as the provided type', () => {
      useFlowsStore.setState({
        flows: [{ dsl: 'Integration' }, { dsl: 'Integration' }],
      } as IFlowsStore);

      const isSameDsl = FlowsStoreFacade.isSameDsl('Kamelet');

      expect(isSameDsl).toBeFalsy();
    });
  });

  it('should return the flows from useFlowsStore', () => {
    const facadeFlows = FlowsStoreFacade.getFlows();
    const storeFlows = useFlowsStore.getState().flows;

    expect(facadeFlows).toBe(storeFlows);
  });

  it('should return the flows ids from useFlowsStore', () => {
    useFlowsStore.setState({
      flows: [{ id: '1' }, { id: '2' }] as IIntegration[],
    } as IFlowsStore);

    const facadeFlowsIds = FlowsStoreFacade.getFlowsIds();

    expect(facadeFlowsIds).toEqual(['1', '2']);
  });
});
