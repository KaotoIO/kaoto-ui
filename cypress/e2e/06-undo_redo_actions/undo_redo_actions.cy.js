describe('Test for undo/redo actions on code-editor', () => {
  before(() => {
    cy.intercept('/v1/integrations/dsls').as('getDSLs');
    cy.intercept('/v1/view-definitions').as('getViewDefinitions');
    cy.intercept('/v1/integrations*').as('getIntegration');

    cy.openHomePage();

    cy.uploadFixture('KafkaSourceSink.yaml');
  });

  // Blocked by https://github.com/KaotoIO/kaoto-ui/issues/1275
  it.skip("undoes and redoes the user's changes, updating the visualization respectively", () => {
    // CHECK THE VISUALIZATION CANVAS HAS UPDATED ACCORDINGLY
    cy.get('[data-testid="viz-step-kafka-sink"]').should('be.visible');
    cy.get('[data-testid="viz-step-kafka-source"]').should('be.visible');

    // LOAD SECOND FIXTURE
    cy.uploadFixture('ChuckNorris.yaml', false);

    // CHECK THE VISUALIZATION CANVAS HAS UPDATED ACCORDINGLY
    cy.get('[data-testid="viz-step-chuck-norris-source"]').should('be.visible');
    cy.get('[data-testid="viz-step-chunk-template-action"]').should('be.visible');
    cy.get('[data-testid="viz-step-kafka-sink"]').should('be.visible');

    // ...and revert to the previous one
    // note: must click three times:
    // 1. to undo the previous 'enter',
    // 2. to undo the file upload, and
    // 3. to undo the first 'enter', reverting it to the original kafka-source-sink spec)
    // cy.editorClickUndoXTimes(3);
    // CHECK THE INITIAL STATE
    // cy.get('[data-testid="viz-step-kafka-sink"]').should('be.visible');
    // cy.get('[data-testid="viz-step-kafka-source"]').should('be.visible');
  });
});
