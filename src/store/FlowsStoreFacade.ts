import { useFlowsStore } from '@kaoto/store';
import { IIntegration } from '@kaoto/types';

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

  static getFlows(): IIntegration[] {
    return useFlowsStore.getState().flows;
  }

  static getFlowsIds(): string[] {
    return FlowsStoreFacade.getFlows().map((flow) => flow.id);
  }
}
