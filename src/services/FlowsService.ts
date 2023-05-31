import { IIntegration } from '@kaoto/types';
import { getRandomArbitraryNumber } from '@kaoto/utils';

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
    flowId?: string,
    options?: { metadata: IIntegration['metadata'] },
  ): IIntegration {
    const randomNumber = getRandomArbitraryNumber();
    const id = flowId ?? `route-${randomNumber.toString(10).slice(0, 4)}`;

    return {
      id,
      dsl,
      description: '',
      metadata: options?.metadata ?? {},
      params: [],
      steps: [],
    };
  }
}
