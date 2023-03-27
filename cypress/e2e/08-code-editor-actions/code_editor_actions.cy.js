describe('editing properties', () => {
  beforeEach(() => {
    cy.intercept('/v1/integrations/dsls').as('getDSLs');
    cy.intercept('/v1/view-definitions').as('getViewDefinitions');
    cy.intercept('/v1/integrations*').as('getIntegration');

    cy.openHomePage();

    cy.zoomOutXTimes(3)
  });

  it('User adds step to the YAML', () => {
    cy.uploadFixture('TimerKafka.yaml');

    const stepToInsert = `  steps:
  - ref:
      apiVersion: camel.apache.org/v1alpha1
      name: insert-field-action
      kind: Kamelet`;
    const insertLine = 10;
    cy.editorAddText(insertLine, stepToInsert);
    cy.syncUpCodeChanges();

    // CHECK the insert-field-action step was added
    cy.get('[data-testid="viz-step-insert-field-action"]').should('be.visible');
  });

  it('User removes step from the YAML', () => {
    cy.uploadFixture('TimerKafka.yaml');

    cy.editorDeleteLine(10, 5);
    cy.syncUpCodeChanges();

    // CHECK the kafka-sink step was removed
    cy.get('[data-testid="viz-step-kafka-sink"]').should('not.exist');
  });

  it('User edits step in the YAML', () => {
    cy.uploadFixture('TimerKafka.yaml');

    cy.editorDeleteLine(14);
    const name = `      name: aws-s3-sink`;
    cy.editorAddText(14, name);
    cy.syncUpCodeChanges();

    // CHECK the kafka-sink step was replaced by the aws s3 sink step
    cy.get('[data-testid="viz-step-kafka-sink"]').should('not.exist');
    cy.get('[data-testid="viz-step-aws-s3-sink"]').should('be.visible');
  });

  it('User Deletes branch in the YAML', () => {
    cy.uploadFixture('EipAction.yaml');

    cy.editorDeleteLine(31, 7);
    cy.syncUpCodeChanges();

    // CHECK branch with digitalocean and set header step was deleted
    cy.get('[data-testid="viz-step-digitalocean"]').should('not.exist');
    cy.get('[data-testid="viz-step-set-header"]').should('not.exist');
  });

  it('User Add a new branch in the YAML', () => {
    cy.uploadFixture('EipAction.yaml');

    // CHECK atlasmap step is not
    cy.get('[data-testid="viz-step-atlasmap"]').should('not.exist');

    const stepToInsert = `          - simple: '{{}{{}?test}}'
            steps:
            - to:
              uri: atlasmap:null`;
    const insertLine = 30;
    cy.editorAddText(insertLine, stepToInsert);
    cy.syncUpCodeChanges();

    // CHECK branch with atlasmap was created
    cy.get('[data-testid="viz-step-atlasmap"]').should('be.visible');
  });

  it('User undoes a change they saved, syncs with canvas', () => {
    cy.uploadFixture('EipAction.yaml');

    cy.editorDeleteLine(31, 7);
    cy.syncUpCodeChanges();

    // CHECK branch with digitalocean and set header step was deleted
    cy.get('[data-testid="viz-step-digitalocean"]').should('not.exist');
    cy.get('[data-testid="viz-step-set-header"]').should('not.exist');

    // First click undo button => alert is displayed
    cy.editorClickUndoXTimes();

    // CHECK alert is displayed
    cy.get('.pf-c-alert__title').contains('Any invalid code will be replaced after sync. If you don\'t want to lose your changes please make a backup.');

    // Second click undo button => changes reverted
    cy.editorClickUndoXTimes();
    cy.syncUpCodeChanges();

    // CHECK branch with digitalocean and set header step was deleted
    cy.get('[data-testid="viz-step-digitalocean"]').should('be.visible');
    cy.get('[data-testid="viz-step-set-header"]').should('be.visible');
  });

  it('User uploads YAML file, syncs with canvas', () => {
    cy.uploadFixture('TimerKafka.yaml');

    // CHECK the kafka-sink and timer-source were imported
    cy.get('[data-testid="viz-step-timer-source"]').should('be.visible');
    cy.get('[data-testid="viz-step-kafka-sink"]').should('be.visible');
  });
});
