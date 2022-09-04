describe('source code and drag and drop', () => {
  before(() => {
    let url = Cypress.config().baseUrl;

    cy.intercept('/v1/integrations/dsls').as('getDSLs');
    cy.intercept('/v1/view-definitions').as('getViewDefinitions');
    cy.intercept('/v1/integrations*').as('getIntegration');

    cy.visit(url);
    cy.viewport(2000, 1000);
  });

  it('loads the YAML editor and synchronizes steps with visualization', () => {
    const dataTransfer = new DataTransfer();
    cy.get('[data-testid="toolbar-show-code-btn"]').click();

    // LOAD FIXTURE
    // attaches the file as an input, NOT drag-and-drop, as that will
    // create a dropzone overlay that then prevents you from typing
    cy.get('.pf-c-code-editor__main > input').attachFile('KafkaSourceSink.yaml');

    // trigger the visualization to update
    cy.get('.pf-c-file-upload').click().type('{end}{enter}');

    // wait until the API returns the updated visualization
    cy.wait('@getIntegration');
    cy.wait('@getDSLs');
    cy.wait('@getViewDefinitions');

    // open catalog, search for timer step
    cy.get('[data-testid="toolbar-step-catalog-btn"]').click();
    cy.get('#stepSearch').type('timer-source');

    cy.get('[data-testid="catalog-step-timer-source"]').trigger('dragstart', {
      dataTransfer,
    });

    // drag timer source from catalog over existing kafka step
    cy.get('[data-testid="viz-step-kafka-source"]').trigger('drop', {
      dataTransfer,
    });

    // wait for API to sync code editor & visualization
    cy.wait('@getIntegration');

    // verify that the code editor contains the new timer source step
    cy.get('[data-testid="toolbar-show-code-btn"]').click();

    cy.get('.pf-c-code-editor__code').contains('timer-source').should('exist');
  });
});
