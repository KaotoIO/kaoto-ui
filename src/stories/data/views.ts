export default [
  {
    "id": "detail-step",
    "name": "Detail View",
    "type": "step"
  },
  {
    "id": "detail-step",
    "name": "Detail View",
    "type": "step"
  },
  {
    "id": "kameletBinding",
    "name": "Kamelet Binding",
    "type": "generic",
    "constraints": [
      {
        "mandatory": true,
        "operation": "SIZE_GREATER_THAN",
        "parameter": "1"
      },
      {
        "mandatory": true,
        "operation": "CONTAINS_STEP_TYPE",
        "parameter": "KAMELET"
      }
    ]
  },
  {
    "id": "integration",
    "name": "Integration View",
    "type": "generic",
    "constraints": [
      {
        "mandatory": true,
        "operation": "SIZE_GREATER_THAN",
        "parameter": "1"
      }
    ]
  }
];
