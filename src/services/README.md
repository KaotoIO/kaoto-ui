## Services

Services in this directory implement relevant business logic between the presentation layer (stateless components) and application logic (stateful components).

### contentService
Contains methods pertaining to content rendered in the UI, such as a tooltips, popovers, modals, or other text. Likely relevant for i18n. Example methods: `getTooltipMsg`

### stepsService
Contains methods pertaining to Steps, where we might modify the business model through a copy of it. Example methods: `insertStep`, `regenerateUuids`

### utilityService
Contains methods pertaining to common, cross-cutting utilities that may or may not contain business logic. Example methods: `formatDateTime`, `getDeepValue`

### validationService
Contains methods pertaining to validation of Steps. These methods ensure that the Step does what you expect it to do. Example methods: `isFirstStep`, `reachedMinBranches`

### visualizationService
Contains methods pertaining to any mutations for the canvas or visualization. This is where you build nodes, find nodes, etc. Example methods: `buildNodesAndEdges`
