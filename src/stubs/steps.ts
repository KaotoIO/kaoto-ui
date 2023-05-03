import { IStepProps } from '@kaoto/types';
import { MarkerType, Position } from 'reactflow';

export const kameletSourceStepStub: IStepProps = {
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
  branches: [],
  minBranches: 0,
  maxBranches: 1,
  UUID: 'timer-source-0',
  integrationId: 'Camel Route-1',
}

export const stepsStub = {
  nodes: [
    {
      data: {
        icon: 'data:image/svg+xml;base64,',
        kind: 'Kamelet',
        label: 'timer-source',
        step: kameletSourceStepStub,
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
      UUID: 'timer-source-0',
      integrationId: 'Camel Route-1',
    }
  ],
  params: []
}

export const stepsCatalog: IStepProps[] = [
  {
    name: 'activemq',
    type: 'MIDDLE',
    id: 'activemq-action',
    kind: 'Camel-Connector',
    icon: 'data:image/svg+xml;base64,',
    title: 'ActiveMQ',
    description: 'Send messages to (or consume from) Apache ActiveMQ. This component extends the Camel JMS component.',
    group: 'Camel-Component',
    minBranches: 0,
    maxBranches: 0,
    UUID: 'random-id-1',
    integrationId: 'Camel Route-1',
  },
  {
    name: 'activemq',
    type: 'START',
    id: 'activemq-consumer',
    kind: 'Camel-Connector',
    icon: 'data:image/svg+xml;base64,',
    title: 'ActiveMQ',
    description: 'Send messages to (or consume from) Apache ActiveMQ. This component extends the Camel JMS component.',
    group: 'Camel-Component',
    minBranches: 0,
    maxBranches: 0,
    UUID: 'random-id-2',
    integrationId: 'Camel Route-1',
  },
  {
    name: 'activemq',
    type: 'END',
    id: 'activemq-producer',
    kind: 'Camel-Connector',
    icon: 'data:image/svg+xml;base64,',
    title: 'ActiveMQ',
    description: 'Send messages to (or consume from) Apache ActiveMQ. This component extends the Camel JMS component.',
    group: 'Camel-Component',
    minBranches: 0,
    maxBranches: 0,
    UUID: 'random-id-3',
    integrationId: 'Camel Route-1',
  },
];
