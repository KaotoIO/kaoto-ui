import { FlowsService } from './FlowsService';

describe('FlowsService', () => {
  it('should generate a new flow', () => {
    const newFlow = FlowsService.getNewFlow('Integration');

    expect(newFlow).toMatchObject({
      id: /Integration-[0-9]*/,
      dsl: 'Integration',
      description: '',
      metadata: {},
      params: [],
      steps: [],
    });
  });

  it('should generate a new flow with the provided ID', () => {
    const newFlow = FlowsService.getNewFlow('Integration', 'Arbitrary-Id');

    expect(newFlow).toMatchObject({
      id: 'Arbitrary-Id',
      dsl: 'Integration',
      description: '',
      metadata: {},
      params: [],
      steps: [],
    });
  });

  it('should generate a new flow with the provided metadata', () => {
    const newFlow = FlowsService.getNewFlow('Integration', 'Arbitrary-Id', {
      metadata: { prop1: 100 },
    });

    expect(newFlow).toMatchObject({
      id: 'Arbitrary-Id',
      dsl: 'Integration',
      description: '',
      metadata: { prop1: 100 },
      params: [],
      steps: [],
    });
  });
});
