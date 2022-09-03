describe('Test for deleting steps', () => {
  before(() => {
    let url = Cypress.config().baseUrl;

    cy.intercept('/v1/integrations/dsls').as('getDSLs');
    cy.intercept('/v1/view-definitions').as('getViewDefinitions');
    cy.intercept('/v1/integrations*').as('getIntegration');
    cy.intercept('/v1/deployments*').as('getDeployments');

    cy.visit(url);
    cy.viewport(2000, 1000);
  });

  it('verifies that deleting a step gets updated in the code editor', () => {
    // show the code editor
    cy.get('[data-testid="toolbar-show-code-btn"]').click();

    // LOAD FIXTURE
    // attaches the file as an input, NOT drag-and-drop, as that will
    // create a dropzone overlay that then prevents you from typing
    cy.get('.pf-c-code-editor__main > input').attachFile('ChuckNorris.yaml');

    // trigger the visualization to update
    cy.get('.pf-c-file-upload').click().type('{end}{enter}');

    // wait until the API returns the updated visualization
    cy.wait('@getIntegration');
    cy.wait('@getDSLs');
    cy.wait('@getViewDefinitions');

    cy.get('[data-testid="react-flow-wrapper"]').contains('chuck-norris').click();

    // delete step
    cy.get('.pf-c-drawer__panel-main > :nth-child(2) > .pf-c-button').click();

    // wait until the API returns the updated visualization
    cy.wait('@getIntegration');

    cy.get('.code-editor').contains('chuck-norris').should('not.exist');

    // delete step
    cy.get('[data-testid="react-flow-wrapper"]').contains('chunk-template').click();
    cy.get('.pf-c-drawer__panel-main > :nth-child(2) > .pf-c-button').click();

    // wait until the API returns the updated visualization
    cy.wait('@getIntegration');

    cy.get('[data-testid="react-flow-wrapper"]').contains('kafka-sink').click();
    cy.get(':nth-child(2) > .pf-c-button').click();

    cy.get('[data-testid="react-flow-wrapper"]').contains('ADD A STEP').should('exist');
  });
});
