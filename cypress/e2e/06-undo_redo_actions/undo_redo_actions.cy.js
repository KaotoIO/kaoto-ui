describe('Test for undo/redo actions on code-editor', () => {
  before(() => {
    let url = Cypress.config().baseUrl;

    cy.intercept('/v1/integrations/dsls').as('getDSLs');
    cy.intercept('/v1/view-definitions').as('getViewDefinitions');
    cy.intercept('/v1/integrations*').as('getIntegration');
    cy.intercept('/v1/deployments*').as('getDeployments');

    cy.visit(url);
  });

  it("undoes and redoes the user's changes, updating the visualization respectively", () => {
    // open the source code editor
    cy.get('[data-testid="toolbar-show-code-btn"]').click();
    cy.get('[data-testid="sourceCode--clearButton"]').should('be.visible').click({ force: true });
    // LOAD FIRST FIXTURE
    // attaches the file as an input, NOT drag-and-drop, as that will
    // create a dropzone overlay that then prevents you from typing
    cy.get('.pf-c-code-editor__main').should('be.visible');
    cy.get('.pf-c-code-editor__main > input').attachFile('KafkaSourceSink.yaml');

    cy.get('[data-testid="sourceCode--applyButton"]').click();

    cy.wait('@getIntegration');
    // trigger the visualization to update
    cy.get('.pf-c-file-upload').click().type('{end} ');

    // wait until the API returns the updated visualization
    cy.wait('@getIntegration');
    cy.wait('@getDSLs');
    cy.wait('@getViewDefinitions');

    // CHECK THE VISUALIZATION CANVAS HAS UPDATED ACCORDINGLY
    cy.get('[data-testid="viz-step-kafka-sink"]').should('be.visible');
    cy.get('[data-testid="viz-step-kafka-source"]').should('be.visible');

    // Blocked by https://github.com/KaotoIO/kaoto-ui/issues/1275

    // LOAD SECOND FIXTURE
    // now we will try to upload a different YAML spec
    // cy.get('[data-testid="sourceCode--clearButton"]').click({force: true});
    // cy.get('.pf-c-code-editor__main > input').attachFile('ChuckNorris.yaml');
    // cy.get('.pf-c-file-upload').click().type('{end} ');

    // cy.wait('@getIntegration');

    // ...and revert to the previous one
    // note: must click three times:
    // 1. to undo the previous 'enter',
    // 2. to undo the file upload, and
    // 3. to undo the first 'enter', reverting it to the original kafka-source-sink spec)
    // cy.get('[data-testid="sourceCode--undoButton"]').click();
    // cy.get('.pf-c-code-editor__code').contains('kafka-source');
  });
});
