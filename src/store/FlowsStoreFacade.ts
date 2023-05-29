import { useFlowsStore } from '@kaoto/store';

/**
 * Flows Store Facade
 *
 * In this class should only be accessors for mapped properties
 * from the flowsStore.
 *
 * The purpose of this facade is to avoid the circular dependency
 * between the store and the service.
 */
export class FlowsStoreFacade {
  static isSameDsl(dsl: string): boolean {
    return useFlowsStore.getState().flows.every((flow) => flow.dsl === dsl);
  }
}
