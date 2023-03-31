import { useVisualizationStore } from './visualizationStore';
import { IStepProps } from '@kaoto/types';
import { MarkerType } from '@reactflow/core';
import { act, renderHook } from '@testing-library/react';

describe('visualizationStore', () => {
  it('store works', () => {
    const { result } = renderHook(() => useVisualizationStore());
    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);
  });

  it('deleteNode', () => {
    const { result } = renderHook(() => useVisualizationStore());
    act(() => {
      result.current.setNodes([
        { id: 'node-1', position: { x: 0, y: 0 }, data: { label: '', step: {} as IStepProps } },
        { id: 'node-2', position: { x: 0, y: 0 }, data: { label: '', step: {} as IStepProps } },
      ]);

      result.current.deleteNode(1);
    });

    expect(result.current.nodes).toHaveLength(1);
  });

  it('onEdgesChange', () => {
    const { result } = renderHook(() => useVisualizationStore());
    act(() => {
      const edge = {
        arrowHeadType: 'arrowclosed',
        id: 'e-undefined>undefined',
        markerEnd: {
          color: '#d2d2d2',
          strokeWidth: 2,
          type: MarkerType.Arrow,
        },
        source: '',
        style: {
          stroke: '#d2d2d2',
          strokeWidth: 2,
        },
        target: '',
        type: 'CUSTOM-NODE',
      };

      result.current.onEdgesChange([
        {
          item: edge,
          type: 'add',
        },
      ]);
    });

    expect(result.current.edges).toHaveLength(1);
  });

  it('onConnect', () => {
    const { result } = renderHook(() => useVisualizationStore());
    act(() => {
      result.current.onConnect({ source: 'a', target: 'b', sourceHandle: '', targetHandle: '' });
    });

    expect(result.current.edges).toHaveLength(1);
  });

  it('setHoverStepUuid', () => {
    const { result } = renderHook(() => useVisualizationStore());
    expect(result.current.hoverStepUuid).toBe('');

    act(() => {
      result.current.setHoverStepUuid('elderberry');
    });

    expect(result.current.hoverStepUuid).toBe('elderberry');
  });

  it('setNodes', () => {
    const { result } = renderHook(() => useVisualizationStore());
    act(() => {
      result.current.setNodes([
        { id: 'node-1', position: { x: 0, y: 0 }, data: { label: '', step: {} as IStepProps } },
        { id: 'node-2', position: { x: 0, y: 0 }, data: { label: '', step: {} as IStepProps } },
      ]);
    });

    expect(result.current.nodes).toHaveLength(2);
  });

  it('setSelectedStepUuid', () => {
    const { result } = renderHook(() => useVisualizationStore());
    expect(result.current.selectedStepUuid).toBe('');

    act(() => {
      result.current.setSelectedStepUuid('jackfruit');
    });

    expect(result.current.selectedStepUuid).toBe('jackfruit');
  });

  it('updateNode', () => {
    const { result } = renderHook(() => useVisualizationStore());
    act(() => {
      result.current.setNodes([
        { id: 'kumquat', position: { x: 0, y: 0 }, data: { label: '', step: {} as IStepProps } },
      ]);

      result.current.updateNode(
        {
          id: 'starfruit',
          position: { x: 0, y: 0 },
          data: { label: '', step: {} as IStepProps },
        },
        0
      );
    });

    expect(result.current.nodes).toHaveLength(1);
    expect(result.current.nodes[0].id).toEqual('starfruit');
  });
});
