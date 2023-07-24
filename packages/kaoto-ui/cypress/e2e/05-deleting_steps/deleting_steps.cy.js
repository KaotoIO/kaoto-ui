describe('Test for deleting steps', () => {
  beforeEach(() => {
    cy.intercept('/v1/deployments*').as('getDeployments');
    cy.intercept('/v1/integrations/dsls').as('getDSLs');
    cy.intercept('/v1/view-definitions').as('getViewDefinitions');
    cy.intercept('/v2/integrations*').as('getIntegration');

    cy.openHomePage();
    cy.uploadFixture('ChuckNorris.yaml');
  });

  it('verifies that deleting a step gets updated in the code editor', () => {
    cy.deleteStep('chuck-norris-source');
    // Check that YAML was updated
    cy.isomorphicGet('.code-editor').contains('chuck-norris-source').should('not.exist');

    cy.deleteStep('chunk-template-action');
    // Check that YAML was updated
    cy.isomorphicGet('.code-editor').contains('chunk-template-action').should('not.exist');

    cy.deleteStep('kafka-sink');
    // Check that YAML was updated
    cy.isomorphicGet('.code-editor').contains('viz-step-kafka-sink').should('not.exist');

    // Check that the canvas is empty
    cy.isomorphicGet('[data-testid="react-flow-wrapper"]').contains('ADD A STEP').should('be.visible');
    // Check init state hint arrow and text were shown
    cy.isomorphicGet('[data-testid="nodeHintArrow"]').contains('⤹').should('be.visible');
    cy.isomorphicGet('[data-testid="nodeHintText"]').contains('click on a node to add a step.').should('be.visible');
  });
});
