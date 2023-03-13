describe('Test for deleting steps', () => {
  before(() => {
    let url = Cypress.config().baseUrl;

    cy.intercept('/v1/integrations/dsls').as('getDSLs');
    cy.intercept('/v1/view-definitions').as('getViewDefinitions');
    cy.intercept('/v1/integrations*').as('getIntegration');
    cy.intercept('/v1/deployments*').as('getDeployments');

    cy.visit(url);
  });

  it('verifies that deleting a step gets updated in the code editor', () => {
    // show the code editor
    cy.get('[data-testid="toolbar-show-code-btn"]').click();

    // LOAD FIXTURE
    // wait for the editor to be visible and attaches the file as an
    // input, NOT drag-and-drop, as that will create a dropzone overlay
    // that then prevents you from typing
    cy.get('.pf-c-code-editor__main').should('be.visible');
    cy.get('.pf-c-code-editor__main > input').attachFile('ChuckNorris.yaml');

    // trigger the visualization to update
    cy.get('[data-testid="sourceCode--applyButton"]').click();

    // wait until the API returns the updated visualization
    cy.wait('@getIntegration');
    cy.wait('@getDSLs');
    cy.wait('@getViewDefinitions');

    // delete step
    cy.get('[data-testid="viz-step-chuck-norris-source"]').trigger('mouseover');
    cy.get(
      '[data-testid="viz-step-chuck-norris-source"] > [data-testid="configurationTab__deleteBtn"]'
    ).click({ force: true });

    // wait until the API returns the updated visualization
    cy.wait('@getIntegration');

    cy.get('.code-editor').contains('chuck-norris-source').should('not.exist');

    // delete step
    cy.get('[data-testid="viz-step-chunk-template-action"]').trigger('mouseover');
    cy.get(
      '[data-testid="viz-step-chunk-template-action"] > [data-testid="configurationTab__deleteBtn"]'
    ).click({ force: true });

    // wait until the API returns the updated visualization
    cy.wait('@getIntegration');

    cy.get('.code-editor').contains('chunk-template-action').should('not.exist');

    // delete step
    cy.get('[data-testid="viz-step-kafka-sink"]').trigger('mouseover');
    cy.get(
      '[data-testid="viz-step-kafka-sink"] > [data-testid="configurationTab__deleteBtn"]'
    ).click({ force: true });

    cy.wait('@getIntegration');
    cy.get('.code-editor').contains('viz-step-kafka-sink').should('not.exist');

    cy.get('[data-testid="react-flow-wrapper"]').contains('ADD A STEP').should('exist');
  });
});
