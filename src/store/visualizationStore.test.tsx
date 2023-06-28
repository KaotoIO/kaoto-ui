import { useVisualizationStore } from './visualizationStore';
import { IStepProps, IVizStepNode, IVizStepPropsEdge } from '@kaoto/types';
import { MarkerType, Position } from '@reactflow/core';
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

  it('onNodesChange', () => {
    const { result } = renderHook(() => useVisualizationStore());
    act(() => {
      result.current.setNodes([
        {
          "data": {
            "label": "ADD A STEP",
            "step": {
              "name": "",
              "type": "START",
              "UUID": "placeholder-4271109058",
              "integrationId": "route-2747"
            },
            "isPlaceholder": true
          },
          "id": "node_0--266733212",
          "draggable": false,
          "position": {
            "x": 0,
            "y": 0
          },
          "type": "step",
          "width": 80,
          "height": 80,
          "targetPosition": Position.Left,
          "sourcePosition": Position.Right,
        } as IVizStepNode,
      ]);

      result.current.onNodesChange([
        {
          "id": "node_0--266733212",
          "type": "select",
          "selected": true
        },
      ]);
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

  it('setEdges', () => {
    const { result } = renderHook(() => useVisualizationStore());
    expect(result.current.edges).toEqual([]);

    act(() => {
      result.current.setEdges([
        { id: 'id-1234', source: 'step-1', target: 'step-3' },
      ] as IVizStepPropsEdge[]);
    });

    expect(result.current.edges).toEqual([{ id: 'id-1234', source: 'step-1', target: 'step-3' }]);
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

  it('setLayout', () => {
    const { result } = renderHook(() => useVisualizationStore());
    expect(result.current.layout).toBe('LR');

    act(() => {
      result.current.setLayout('TB');
    });

    expect(result.current.layout).toBe('TB');
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
        0,
      );
    });

    expect(result.current.nodes).toHaveLength(1);
    expect(result.current.nodes[0].id).toEqual('starfruit');
  });

  describe('Visibility handlers', () => {
    beforeEach(() => {
      useVisualizationStore.getState().toggleFlowVisible('route-1234', false);
      useVisualizationStore.getState().toggleFlowVisible('route-4321', false);
    });

    it('should allow consumers to set the visibility of a given flow', () => {
      useVisualizationStore.getState().toggleFlowVisible('route-1234', true);
      const visibleFlows = useVisualizationStore.getState().visibleFlows;

      expect(visibleFlows).toEqual({
        'route-1234': true,
        'route-4321': false,
      });
    });

    it('should allow consumers to toggle the visibility of a given flow', () => {
      useVisualizationStore.getState().toggleFlowVisible('route-1234');
      const visibleFlows = useVisualizationStore.getState().visibleFlows;

      expect(visibleFlows).toEqual({
        'route-1234': true,
        'route-4321': false,
      });
    });

    it('should allow consumers show all flows', () => {
      useVisualizationStore.getState().showAllFlows();
      const visibleFlows = useVisualizationStore.getState().visibleFlows;

      expect(visibleFlows).toEqual({
        'route-1234': true,
        'route-4321': true,
      });
    });

    it('should allow consumers to hide all flows', () => {
      useVisualizationStore.getState().hideAllFlows();
      const visibleFlows = useVisualizationStore.getState().visibleFlows;

      expect(visibleFlows).toEqual({
        'route-1234': false,
        'route-4321': false,
      });
    });

    it('should allow consumers to clear all flows', () => {
      useVisualizationStore.getState().setVisibleFlows({});
      const visibleFlows = useVisualizationStore.getState().visibleFlows;

      expect(visibleFlows).toEqual({});
    });
  });
});
