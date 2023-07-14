export const camelRouteMultiYaml = `
- route:
    id: camel route 1
    from:
      uri: timer:test
      steps:
      - set-header:
          constant: test
          name: test
      - to:
          uri: log:test
- route:
    id: camel route 2
    from:
      uri: 'activemq:queue:'
      steps:
      - to:
          uri: 'activemq:queue:'
`;
