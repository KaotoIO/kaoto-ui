import { IIntegration, IStepProps } from '@kaoto/types';
import { getRandomArbitraryNumber } from '@kaoto/utils';
import cloneDeep from 'lodash.clonedeep';

/**
 * Flows Store Service
 *
 * This class cannot import the FlowsStore as this class its meant
 * for generating static data or to calculate outputs based on the
 * input methods.
 */
export class FlowsService {
  static getNewFlow(
    dsl: string,
    options?: { metadata: IIntegration['metadata'] },
  ): IIntegration {
    const metadata = options?.metadata ?? {};
    const id = metadata.name ?? this.getNewFlowId();

    return {
      id,
      dsl,
      description: '',
      metadata: {...metadata, name: metadata.name ?? id},
      params: [],
      steps: [],
    };
  }

  /**
   * Regenerate a UUID for a list of Steps
   * Every time there is a change to steps or their positioning in the Steps array,
   * their UUIDs need to be regenerated
   * @param steps
   * @param prefix
   */
  static regenerateUuids(
    integrationId: string,
    steps: IStepProps[],
    prefix?: string,
  ): IStepProps[] {
    let newSteps = cloneDeep(steps);
    const integrationPrefix = prefix ?? `${integrationId}_`;

    newSteps.forEach((step, stepIndex) => {
      step.UUID = `${integrationPrefix}${step.name}-${stepIndex}`;
      step.integrationId = integrationId;

      step.branches?.forEach((branch, branchIndex) => {
        branch.branchUuid = `${step.UUID}_branch-${branchIndex}`;
        branch.steps = this.regenerateUuids(integrationId, branch.steps, `${branch.branchUuid}_`);
      });
    });

    return newSteps;
  }

  static getNewFlowId(): string {
    const randomNumber = getRandomArbitraryNumber();
    return `route-${randomNumber.toString(10).slice(0, 4)}`
  }
}
