### Rest DSL component

This component should be promoted to its own package when KaotoUI turns into a monorepo.

The purpose of this component is to present a tabular UI similar to the Swagger UI that
renders an OpenAPI definition.

### The structure is as follows:

```jsx
// Main Component that will display Rest DSL flows
<RestVisualization>

  // Each RestFlow component will render all associated REST operations (GETs, POSTs, PUTs)
  <RestFlow>

    // Each RestOperation component represents an individual rest operation, (GET, POST, PUT)
    <RestOperation />
  </RestFlow>

</RestVisualization>
```
