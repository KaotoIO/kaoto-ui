import { IFlowsStore, useFlowsStore } from './FlowsStore';
import { FlowsStoreFacade } from './FlowsStoreFacade';
import { IIntegration } from '@kaoto/types';

describe('FlowsStoreFacade', () => {
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
