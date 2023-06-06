describe('Test for Multi route actions from the code editor', () => {
  beforeEach(() => {
    cy.intercept('/v1/deployments*').as('getDeployments');
    cy.intercept('/v1/steps/id/*').as('getStepDetails');
    cy.intercept('/v1/integrations/dsls').as('getDSLs');
    cy.intercept('/v1/view-definitions').as('getViewDefinitions');
    cy.intercept('POST', '/v2/integrations*').as('getIntegration');

    cy.openHomePage();
    cy.uploadFixture('IntegrationMultiFlow.yaml');

    cy.zoomOutXTimes(3);
  });

  it('User deletes first route from multi-route using code editor', () => {
    cy.editorDeleteLine(0, 15);
    cy.syncUpCodeChanges();

    cy.showAllRoutes();
    cy.get('[data-testid^="rf__node-node_0"]').should('have.length', 1);
  });

  it('User deletes second route from multi-route using code editor', () => {
    cy.editorDeleteLine(15, 12);
    cy.syncUpCodeChanges();

    cy.showAllRoutes();
    cy.get('[data-testid^="rf__node-node_0"]').should('have.length', 1);
  });

  it('User deletes step from first route using code editor', () => {
    cy.editorDeleteLine(11, 2);
    cy.syncUpCodeChanges();

    cy.showAllRoutes();
    cy.get('[data-testid="viz-step-set-body"]').should('not.exist');
    cy.get('[data-testid^="rf__node-node_0"]').should('have.length', 2);
  });

  it('User adds step to the first route using code editor', () => {
    const stepToInsert = `      - set-header:
          constant: test`;
    const insertLine = 11;
    cy.editorAddText(insertLine, stepToInsert);
    cy.syncUpCodeChanges();

    // CHECK the set-header step was added
    cy.get('[data-testid="viz-step-set-header"]').should('be.visible');
  });

  // Blocked by - https://github.com/KaotoIO/kaoto-ui/issues/1910
  it.skip('User adds step to the second route using code editor', () => {
    cy.showAllRoutes();
    const stepToInsert = `      - set-body:
          constant: test`;
    const insertLine = 25;
    cy.editorAddText(insertLine, stepToInsert);
    cy.syncUpCodeChanges();
    // CHECK the insert-field-action step was added
    cy.get('[data-testid="viz-step-set-body"]').should('be.visible');
  });

  it('User reverts route deletion using code editor', () => {
    cy.editorDeleteLine(15, 12);
    cy.syncUpCodeChanges();

    cy.showAllRoutes();
    cy.get('[data-testid^="rf__node-node_0"]').should('have.length', 1);

    // First click undo button => reverted automatic adjustments
    cy.editorClickUndoXTimes();
    // Second click undo button => changes reverted & alert is displayed
    cy.editorClickUndoXTimes();
    cy.syncUpCodeChanges();

    cy.showAllRoutes();
    cy.get('[data-testid^="rf__node-node_0"]').should('have.length', 2);
  });
});
