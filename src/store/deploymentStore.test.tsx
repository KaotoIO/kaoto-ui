import { useDeploymentStore } from './deploymentStore';
import { act, renderHook } from '@testing-library/react';

describe('deploymentStore', () => {
  it('setDeploymentCrd', () => {
    const { result } = renderHook(() => useDeploymentStore());

    act(() => {
      result.current.setDeploymentCrd('The best deployment ever');
    });

    // check parameters individually for accuracy
    expect(result.current.deployment.crd).toEqual('The best deployment ever');
    expect(result.current.deployment.errors).toHaveLength(0);
    expect(result.current.deployment.name).toEqual('integration');
    expect(result.current.deployment.status).toEqual('Stopped');
    expect(result.current.deployment.type).toEqual('Camel Route');
  });
});
