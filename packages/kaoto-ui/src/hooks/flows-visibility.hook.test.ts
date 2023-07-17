import { useFlowsVisibility } from './flows-visibility.hook';
import { useVisualizationStore } from '@kaoto/store';
import { renderHook } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

describe('useFlowsVisibility', () => {
  it('should react to the visibleFlows property from the store', () => {
    useVisualizationStore.setState({
      visibleFlows: {
        'route-1234': false,
        'route-4321': false,
      },
    });

    const { result } = renderHook(() => useFlowsVisibility());

    act(() => {
      useVisualizationStore.setState({
        visibleFlows: {},
      });
    });

    expect(result.current).toMatchObject({
      singleFlowId: undefined,
      visibleFlowsCount: 0,
      totalFlowsCount: 0,
      isCanvasEmpty: true,
    });
  });

  it('should return the flow id for a single visible flow', () => {
    useVisualizationStore.setState({
      visibleFlows: {
        'route-1234': true,
        'route-4321': false,
      },
    });

    const { result } = renderHook(() => useFlowsVisibility());

    expect(result.current).toMatchObject({
      singleFlowId: 'route-1234',
    });
  });

  it('should return undefined when there are more than one visible flow', () => {
    useVisualizationStore.setState({
      visibleFlows: {
        'route-1234': true,
        'route-4321': true,
      },
    });

    const { result } = renderHook(() => useFlowsVisibility());

    expect(result.current).toMatchObject({
      singleFlowId: undefined,
    });
  });

  it('should return undefined when there is any visible flow', () => {
    useVisualizationStore.setState({
      visibleFlows: {
        'route-1234': false,
        'route-4321': false,
      },
    });

    const { result } = renderHook(() => useFlowsVisibility());

    expect(result.current).toMatchObject({
      singleFlowId: undefined,
    });
  });

  it('should return the visible flows count - all flows visible', () => {
    useVisualizationStore.setState({
      visibleFlows: {
        'route-1234': true,
        'route-4321': true,
      },
    });

    const { result } = renderHook(() => useFlowsVisibility());

    expect(result.current).toMatchObject({
      visibleFlowsCount: 2,
      totalFlowsCount: 2,
    });
  });

  it('should return the visible flows count - some flows visible', () => {
    useVisualizationStore.setState({
      visibleFlows: {
        'route-1234': true,
        'route-4321': false,
      },
    });

    const { result } = renderHook(() => useFlowsVisibility());

    expect(result.current).toMatchObject({
      visibleFlowsCount: 1,
      totalFlowsCount: 2,
    });
  });

  it('should return the visible flows count - no flow visible', () => {
    useVisualizationStore.setState({
      visibleFlows: {
        'route-1234': false,
        'route-4321': false,
      },
    });

    const { result } = renderHook(() => useFlowsVisibility());

    expect(result.current).toMatchObject({
      visibleFlowsCount: 0,
      totalFlowsCount: 2,
    });
  });

  it('should set isCanvasEmpty=true when there is no flows', () => {
    useVisualizationStore.setState({
      visibleFlows: {},
    });

    const { result } = renderHook(() => useFlowsVisibility());

    expect(result.current).toMatchObject({
      singleFlowId: undefined,
      visibleFlowsCount: 0,
      totalFlowsCount: 0,
      isCanvasEmpty: true,
    });
  });

  it('should set isCanvasEmpty=true when there all flows are hidden', () => {
    useVisualizationStore.setState({
      visibleFlows: {
        'route-1234': false,
        'route-4321': false,
      },
    });

    const { result } = renderHook(() => useFlowsVisibility());

    expect(result.current).toMatchObject({
      singleFlowId: undefined,
      visibleFlowsCount: 0,
      totalFlowsCount: 2,
      isCanvasEmpty: true,
    });
  });
});
