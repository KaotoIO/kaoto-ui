import { integrationSteps } from '../stubs';
import { FlowsService } from './FlowsService';
import { IStepProps } from '@kaoto/types';

describe('FlowsService', () => {
  describe('getNewFlow', () => {
    it('should generate a new flow', () => {
      const newFlow = FlowsService.getNewFlow('Integration');

      expect(newFlow).toMatchObject({
        id: /Integration-\d*/,
        dsl: 'Integration',
        description: '',
        metadata: {},
        params: [],
        steps: [],
      });
    });

    it('should generate a new flow with the provided metadata.name', () => {
      const newFlow = FlowsService.getNewFlow('Integration', {
        metadata: { name: 'my-integration', prop1: 100 },
      });

      expect(newFlow).toMatchObject({
        id: 'my-integration',
        dsl: 'Integration',
        description: '',
        metadata: { name: 'my-integration', prop1: 100 },
        params: [],
        steps: [],
      });
    });

    it('should generate a new flow with the provided metadata', () => {
      const newFlow = FlowsService.getNewFlow('Integration', {
        metadata: { prop1: 100 },
      });

      expect(newFlow).toMatchObject({
        id: /route-\d{4}/,
        dsl: 'Integration',
        description: '',
        metadata: { prop1: 100 },
        params: [],
        steps: [],
      });
    });

    describe('regenerateUuids(): should (re)generate UUIDs for all steps', () => {
      it('should generate UUIDs for the main steps array', () => {
        const result = FlowsService.regenerateUuids('Camel Route-1', integrationSteps);

        expect(result).toMatchObject<Partial<IStepProps>[]>([
          { UUID: 'Camel Route-1_timer-0' },
          { UUID: 'Camel Route-1_choice-1' },
        ]);
      });

      it('should generate UUIDs for branches', () => {
        const result = FlowsService.regenerateUuids('Camel Route-1', integrationSteps);

        expect(result).toMatchObject<Partial<IStepProps>[]>([
          { UUID: 'Camel Route-1_timer-0', branches: [] },
          {
            UUID: 'Camel Route-1_choice-1',
            branches: [
              {
                branchUuid: 'Camel Route-1_choice-1_branch-0',
                steps: expect.any(Array),
                identifier: 'true path',
              },
              {
                branchUuid: 'Camel Route-1_choice-1_branch-1',
                steps: expect.any(Array),
                identifier: 'otherwise',
              },
            ],
          },
        ]);
      });

      it('should generate UUIDs for nested steps', () => {
        const result = FlowsService.regenerateUuids('Camel Route-1', integrationSteps);

        expect(result).toMatchObject<Partial<IStepProps>[]>([
          { UUID: 'Camel Route-1_timer-0', branches: [] },
          {
            UUID: 'Camel Route-1_choice-1',
            branches: [
              {
                branchUuid: 'Camel Route-1_choice-1_branch-0',
                steps: [
                  {
                    UUID: 'Camel Route-1_choice-1_branch-0_log-0',
                    integrationId: 'Camel Route-1',
                    minBranches: 0,
                    maxBranches: 0,
                    name: 'log',
                    type: 'MIDDLE',
                  },
                ],
                identifier: 'true path',
              },
              {
                branchUuid: 'Camel Route-1_choice-1_branch-1',
                steps: [
                  {
                    UUID: 'Camel Route-1_choice-1_branch-1_log-0',
                    integrationId: 'Camel Route-1',
                    minBranches: 0,
                    maxBranches: 0,
                    name: 'log',
                    type: 'MIDDLE',
                  },
                ],
                identifier: 'otherwise',
              },
            ],
          },
        ]);
      });

      it('should generate UUIDs for nested steps at two levels deep', () => {
        const nestedIntegrationSteps: IStepProps[] = JSON.parse(JSON.stringify(integrationSteps));
        nestedIntegrationSteps[1].branches![0].steps = integrationSteps;

        const result = FlowsService.regenerateUuids('Camel Route-1', nestedIntegrationSteps);

        expect(result).toMatchObject<Partial<IStepProps>[]>([
          { UUID: 'Camel Route-1_timer-0', branches: [] },
          {
            UUID: 'Camel Route-1_choice-1',
            branches: [
              {
                branchUuid: 'Camel Route-1_choice-1_branch-0',
                steps: [
                  {
                    UUID: 'Camel Route-1_choice-1_branch-0_timer-0',
                    integrationId: 'Camel Route-1',
                    minBranches: 0,
                    maxBranches: 0,
                    name: 'timer',
                    type: 'START',
                    branches: [],
                  },
                  {
                    UUID: 'Camel Route-1_choice-1_branch-0_choice-1',
                    integrationId: 'Camel Route-1',
                    minBranches: 1,
                    maxBranches: -1,
                    name: 'choice',
                    type: 'MIDDLE',
                    branches: [
                      {
                        branchUuid: 'Camel Route-1_choice-1_branch-0_choice-1_branch-0',
                        steps: [
                          {
                            UUID: 'Camel Route-1_choice-1_branch-0_choice-1_branch-0_log-0',
                            integrationId: 'Camel Route-1',
                            minBranches: 0,
                            maxBranches: 0,
                            name: 'log',
                            type: 'MIDDLE',
                          },
                        ],
                        identifier: 'true path',
                      },
                      {
                        branchUuid: 'Camel Route-1_choice-1_branch-0_choice-1_branch-1',
                        steps: [
                          {
                            UUID: 'Camel Route-1_choice-1_branch-0_choice-1_branch-1_log-0',
                            integrationId: 'Camel Route-1',
                            minBranches: 0,
                            maxBranches: 0,
                            name: 'log',
                            type: 'MIDDLE',
                          },
                        ],
                        identifier: 'otherwise',
                      },
                    ],
                  },
                ],
                identifier: 'true path',
              },
              {
                branchUuid: 'Camel Route-1_choice-1_branch-1',
                steps: [
                  {
                    UUID: 'Camel Route-1_choice-1_branch-1_log-0',
                    integrationId: 'Camel Route-1',
                    minBranches: 0,
                    maxBranches: 0,
                    name: 'log',
                    type: 'MIDDLE',
                  },
                ],
                identifier: 'otherwise',
              },
            ],
          },
        ]);
      });

      it('should regenerate UUIDs when a branch is removed', () => {
        const localIntegrationSteps = integrationSteps.slice(1);
        const result = FlowsService.regenerateUuids('Camel Route-1', localIntegrationSteps);

        expect(result).toMatchObject<Partial<IStepProps>[]>([
          {
            UUID: 'Camel Route-1_choice-0',
            branches: [
              {
                branchUuid: 'Camel Route-1_choice-0_branch-0',
                steps: [
                  {
                    UUID: 'Camel Route-1_choice-0_branch-0_log-0',
                    integrationId: 'Camel Route-1',
                    minBranches: 0,
                    maxBranches: 0,
                    name: 'log',
                    type: 'MIDDLE',
                  },
                ],
                identifier: 'true path',
              },
              {
                branchUuid: 'Camel Route-1_choice-0_branch-1',
                steps: [
                  {
                    UUID: 'Camel Route-1_choice-0_branch-1_log-0',
                    integrationId: 'Camel Route-1',
                    minBranches: 0,
                    maxBranches: 0,
                    name: 'log',
                    type: 'MIDDLE',
                  },
                ],
                identifier: 'otherwise',
              },
            ],
          },
        ]);
      });
    });
  });
});
