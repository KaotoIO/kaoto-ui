describe('3 step integration', () => {
  beforeEach(() => {
    cy.intercept('/v1/deployments*').as('getDeployments');
    cy.intercept('/v1/steps/id/*').as('getStepDetails');
    cy.intercept('/v1/integrations/dsls').as('getDSLs');
    cy.intercept('/v1/view-definitions').as('getViewDefinitions');
    cy.intercept('/v2/integrations*').as('getIntegration');

    cy.openHomePage();
  });

  it('add the step integration', () => {
    // add timer via drag and drop from the catalog
    cy.dragAndDropFromCatalog('timer', 'slot', 'start');

    // CHECK the code editor contains the new timer step
    cy.openCodeEditor();
    cy.get('.code-editor').should('contain.text', 'timer');

    // add an action from the mini catalog
    cy.appendStepMiniCatalog('timer', 'aggregate');

    // CHECK the code editor contains the new timer aggregate
    cy.get('.code-editor').should('contain.text', 'aggregate');

    // add kafka from the mini catalog
    cy.appendStepMiniCatalog('aggregate', 'kafka');

    // CHECK the code editor contains the new kafka step
    cy.get('.code-editor').should('contain.text', 'kafka');

    // delete middle step
    cy.deleteStep('aggregate');

    // open step catalog, replace timer with debezium-postgres
    cy.dragAndDropFromCatalog('debezium-postgres', 'timer', 'start');

    // verify the visualization has the correct steps (debezium-postgres)
    // and configuration loads as expected
    cy.openStepConfigurationTab('debezium-postgres');
    cy.closeCatalogOrCodeEditor();
    cy.closeStepConfigurationTab();

    // insert a step into the middle of the integration
    // and opens the mini catalog without issues
    cy.insertStepMiniCatalog('chunk');
    cy.openCodeEditor();

    // CHECK the code editor has the correct steps (debezium-postgres, chunk, kafka)
    cy.get('.code-editor')
      .should('contain.text', 'debezium-postgres')
      .and('contain.text', 'chunk')
      .and('contain.text', 'kafka');
    // CHECK that stepNodes contains of the three steps
    cy.get('.stepNode').should('have.length', 3);
    // CHECK that stepNodes are in the correct order
    cy.get('.stepNode').eq(0).should('have.attr', 'data-testid', 'viz-step-debezium-postgres');
    cy.get('.stepNode').eq(1).should('have.attr', 'data-testid', 'viz-step-chunk');
    cy.get('.stepNode').eq(2).should('have.attr', 'data-testid', 'viz-step-kafka');

    // Sync up code editor
    cy.syncUpCodeChanges();

    // CHECK the code editor has the correct steps (debezium-postgres, chunk, kafka)
    cy.get('.code-editor')
      .should('contain.text', 'debezium-postgres')
      .and('contain.text', 'chunk')
      .and('contain.text', 'kafka');
    // CHECK that stepNodes contains of the three steps
    cy.get('.stepNode').should('have.length', 3);
    // CHECK that stepNodes are in the correct order
    cy.get('.stepNode').eq(0).should('have.attr', 'data-testid', 'viz-step-debezium-postgres');
    cy.get('.stepNode').eq(1).should('have.attr', 'data-testid', 'viz-step-chunk');
    cy.get('.stepNode').eq(2).should('have.attr', 'data-testid', 'viz-step-kafka');
  });
});
