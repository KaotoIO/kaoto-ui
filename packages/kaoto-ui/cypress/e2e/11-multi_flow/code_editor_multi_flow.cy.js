describe('Test for Multi route actions from the code editor', () => {
  beforeEach(() => {
    cy.intercept('/v1/deployments*').as('getDeployments');
    cy.intercept('/v1/steps/id/*').as('getStepDetails');
    cy.intercept('/v1/integrations/dsls').as('getDSLs');
    cy.intercept('/v1/view-definitions').as('getViewDefinitions');
    cy.intercept('POST', '/v2/integrations*').as('getIntegration');

    cy.openHomePage();
    cy.zoomOutXTimes(3);
  });

  it('User deletes first route from multi-route using code editor', () => {
    cy.uploadFixture('IntegrationMultiFlow.yaml');

    cy.editorDeleteLine(6, 11);
    cy.syncUpCodeChanges();

    cy.showAllRoutes();
    cy.isomorphicGet('[data-testid^="rf__node-node_0"]').should('have.length', 1);
  });

  it('User adds new route to Camel multi-route using code editor', () => {
    cy.uploadFixture('CamelRouteMultiFlow.yaml');

    const stepToInsert = `- route:
    from:
      uri: null
      steps: []`;

    cy.editorAddText(18, stepToInsert);
    cy.syncUpCodeChanges();
    cy.showAllRoutes();

    // CHECK the new empty route was added
    cy.isomorphicGet('[data-testid="viz-step-slot"]').should('have.length', 1).and('be.visible');
    cy.isomorphicGet('[data-testid^="rf__node-node_0"]').should('have.length', 3);
  });

  /** Skip until https://github.com/KaotoIO/kaoto-backend/issues/738 is done */
  it.skip('User adds new route to Integration multi-route using code editor', () => {
    cy.uploadFixture('IntegrationMultiFlow.yaml');

    const stepToInsert = `  - route:
      from:
        uri: null
        steps: []`;

    cy.editorAddText(28, stepToInsert);
    cy.syncUpCodeChanges();
    cy.showAllRoutes();

    // CHECK the new empty route was added
    cy.isomorphicGet('[data-testid="viz-step-slot"]').should('have.length', 1).and('be.visible');
    cy.isomorphicGet('[data-testid^="rf__node-node_0"]').should('have.length', 3);
  });

  it('User deletes second route from multi-route using code editor', () => {
    cy.uploadFixture('IntegrationMultiFlow.yaml');

    cy.editorDeleteLine(17, 7);
    cy.syncUpCodeChanges();

    cy.showAllRoutes();
    cy.isomorphicGet('[data-testid^="rf__node-node_0"]').should('have.length', 1);
  });

  it('User deletes step from first route using code editor', () => {
    cy.uploadFixture('IntegrationMultiFlow.yaml');

    cy.editorDeleteLine(13, 2);
    cy.syncUpCodeChanges();

    cy.showAllRoutes();
    cy.isomorphicGet('[data-testid="viz-step-set-body"]').should('not.exist');
    cy.isomorphicGet('[data-testid^="rf__node-node_0"]').should('have.length', 2);
  });

  it('User adds step to the first route using code editor', () => {
    cy.uploadFixture('IntegrationMultiFlow.yaml');

    const stepToInsert = `        - set-header:
            constant: test`;
    const insertLine = 13;
    cy.editorAddText(insertLine, stepToInsert);
    cy.syncUpCodeChanges();

    // CHECK the set-header step was added
    cy.isomorphicGet('[data-testid="viz-step-set-header"]').should('be.visible');
  });

  it('User adds step to the second route using code editor', () => {
    cy.uploadFixture('IntegrationMultiFlow.yaml');

    cy.showAllRoutes();
    const stepToInsert = `        - set-body:
            constant: test`;
    const insertLine = 22;
    cy.editorAddText(insertLine, stepToInsert);
    cy.syncUpCodeChanges();
    // CHECK the insert-field-action step was added
    cy.isomorphicGet('[data-testid="viz-step-set-body"]').should('be.visible');
  });

  it('User reverts route deletion using code editor', () => {
    cy.uploadFixture('CamelRouteMultiFlow.yaml');

    cy.editorDeleteLine(8, 12);
    cy.syncUpCodeChanges();

    cy.showAllRoutes();
    cy.isomorphicGet('[data-testid^="rf__node-node_0"]').should('have.length', 1);

    // First click undo button => reverted automatic adjustments
    cy.editorClickUndoXTimes();
    // Second click undo button => changes reverted & alert is displayed
    cy.editorClickUndoXTimes(12);
    cy.syncUpCodeChanges();

    cy.showAllRoutes();
    cy.isomorphicGet('[data-testid^="rf__node-node_0"]').should('have.length', 2);
  });
});
