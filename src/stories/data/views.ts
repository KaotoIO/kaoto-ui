export default [
  {
    id: 'detail-step',
    name: 'Detail View',
    type: 'step',
  },
  {
    id: 'detail-step',
    name: 'Detail View',
    type: 'step',
  },
  {
    id: 'custom-step',
    name: 'Kafka Properties',
    type: 'step',
    module: './Button',
    scope: 'stepextension',
    step: '3kafka-sink',
    url: 'https://step-extension.netlify.app/remoteEntry.js',
  },
  {
    id: 'detail-step',
    name: 'Custom Details',
    type: 'step',
    module: './Button',
    scope: 'stepextension',
    step: '0twitter-search-source',
    url: 'https://step-extension.netlify.app/remoteEntry.js',
  },
  {
    id: 'kameletBinding',
    name: 'Kamelet Binding',
    type: 'generic',
    constraints: [
      {
        mandatory: true,
        operation: 'SIZE_GREATER_THAN',
        parameter: '1',
      },
      {
        mandatory: true,
        operation: 'CONTAINS_STEP_TYPE',
        parameter: 'KAMELET',
      },
    ],
  },
  {
    id: 'integration',
    name: 'Integration View',
    type: 'generic',
    constraints: [
      {
        mandatory: true,
        operation: 'SIZE_GREATER_THAN',
        parameter: '1',
      },
    ],
  },
];
