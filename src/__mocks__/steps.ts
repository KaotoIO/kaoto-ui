import { MarkerType, Position } from 'reactflow';

export const stepsStub = {
  nodes: [
    {
      data: {
        icon: 'data:image/svg+xml;base64,',
        kind: 'Kamelet',
        label: 'timer-source',
        step: {
          name: 'timer-source',
          type: 'START',
          id: 'timer-source',
          kind: 'Kamelet',
          icon: 'data:image/svg+xml;base64,',
          title: 'Timer Source',
          description: 'Produces periodic messages with a custom payload.',
          group: 'Timer',
          parameters: [],
          required: [],
          branches: null,
          minBranches: 0,
          maxBranches: 0,
          UUID: 'timer-source-0'
        },
        isPlaceholder: false,
        isLastStep: true
      },
      draggable: false,
      id: 'node_0-timer-source-0-4076175505',
      position: {
        x: -28,
        y: -28
      },
      type: 'step',
      width: 80,
      height: 80,
      isLastStep: true,
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
      selected: true
    }
  ],
  edges: [],
  layout: MarkerType.Arrow
}

export const integrationJSONStub = {
  dsl: 'KameletBinding',
  metadata: {
    name: 'integration',
    namespace: 'default'
  },
  steps: [
    {
      name: 'timer-source',
      type: 'START',
      id: 'timer-source',
      kind: 'Kamelet',
      icon: 'data:image/svg+xml;base64,',
      title: 'Timer Source',
      description: 'Produces periodic messages with a custom payload.',
      group: 'Timer',
      parameters: [],
      required: [],
      branches: null,
      minBranches: 0,
      maxBranches: 0,
      UUID: 'timer-source-0'
    }
  ],
  params: []
}
