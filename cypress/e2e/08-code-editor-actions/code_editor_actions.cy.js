describe('editing properties', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;

    cy.visit(url);

    cy.get('[data-testid="toolbar-show-code-btn"]').click();
    cy.get('[data-testid="sourceCode--clearButton"]').should('be.visible').click({ force: true });
    cy.get('.pf-c-code-editor__main').should('be.visible');
  });

  it('User adds step to the YAML', () => {
    cy.get('.pf-c-code-editor__main > input').attachFile('TimerKafka.yaml');
    cy.get('[data-testid="sourceCode--applyButton"]').click();

    const stepToInsert = `  steps:
  - ref:
      apiVersion: camel.apache.org/v1alpha1
      name: insert-field-action
      kind: Kamelet`;
    const insertLine = 10;
    cy.editorAddText(insertLine, stepToInsert);
    cy.get('[data-testid="sourceCode--applyButton"]').click();

    // CHECK the insert-field-action step was added
    cy.get('[data-testid="viz-step-insert-field-action"]').should('be.visible');
  });

  it('User removes step from the YAML', () => {
    cy.get('.pf-c-code-editor__main > input').attachFile('TimerKafka.yaml');
    cy.get('[data-testid="sourceCode--applyButton"]').click();
    cy.editorDeleteLine(10, 5);
    cy.get('[data-testid="sourceCode--applyButton"]').click();

    // CHECK the kafka-sink step was removed
    cy.get('[data-testid="viz-step-kafka-sink"]').should('not.exist');
  });

  it('User edits step in the YAML', () => {
    cy.get('.pf-c-code-editor__main > input').attachFile('TimerKafka.yaml');
    cy.get('[data-testid="sourceCode--applyButton"]').click();
    cy.editorDeleteLine(14);
    const name = `      name: aws-s3-sink`;
    cy.editorAddText(14, name);
    cy.get('[data-testid="sourceCode--applyButton"]').click();

    // CHECK the kafka-sink step was replaced by the aws s3 sink step
    cy.get('[data-testid="viz-step-kafka-sink"]').should('not.exist');
    cy.get('[data-testid="viz-step-aws-s3-sink"]').should('be.visible');
  });

  it('User Deletes branch in the YAML', () => {
    cy.get('.pf-c-code-editor__main > input').attachFile('EipAction.yaml');
    cy.get('[data-testid="sourceCode--applyButton"]').click();
    cy.editorDeleteLine(31, 7);
    cy.get('[data-testid="sourceCode--applyButton"]').click();

    // CHECK branch with digitalocean and set header step was deleted
    cy.get('[data-testid="viz-step-digitalocean"]').should('not.exist');
    cy.get('[data-testid="viz-step-set-header"]').should('not.exist');
  });

  it('User Add a new branch in the YAML', () => {
    cy.get('.pf-c-code-editor__main > input').attachFile('EipAction.yaml');
    cy.get('[data-testid="sourceCode--applyButton"]').click();

    // CHECK atlasmap step is not
    cy.get('[data-testid="viz-step-atlasmap"]').should('not.exist');

    const stepToInsert = `          - simple: '{{}{{}?test}}'
            steps:
            - to:
              uri: atlasmap:null`;
    const insertLine = 30;
    cy.editorAddText(insertLine, stepToInsert);
    cy.get('[data-testid="sourceCode--applyButton"]').click();

    // CHECK branch with atlasmap was created
    cy.get('[data-testid="viz-step-atlasmap"]').should('be.visible');
  });

  it('User undoes a change they saved, syncs with canvas', () => {
    cy.get('.pf-c-code-editor__main > input').attachFile('EipAction.yaml');
    cy.get('[data-testid="sourceCode--applyButton"]').click();
    cy.editorDeleteLine(31, 7);
    cy.get('[data-testid="sourceCode--applyButton"]').click();

    // CHECK branch with digitalocean and set header step was deleted
    cy.get('[data-testid="viz-step-digitalocean"]').should('not.exist');
    cy.get('[data-testid="viz-step-set-header"]').should('not.exist');

    // Undo and apply the reverted changes - has to click twice, as there is an alert displayed
    cy.get('[data-testid="sourceCode--undoButton"]').click();
    cy.get('[data-testid="sourceCode--undoButton"]').click();
    cy.get('[data-testid="sourceCode--applyButton"]').click();

    // CHECK branch with digitalocean and set header step was deleted
    cy.get('[data-testid="viz-step-digitalocean"]').should('be.visible');
    cy.get('[data-testid="viz-step-set-header"]').should('be.visible');
  });

  it('User uploads YAML file, syncs with canvas', () => {
    cy.get('.pf-c-code-editor__main > input').attachFile('TimerKafka.yaml');
    cy.get('[data-testid="sourceCode--applyButton"]').click();

    // CHECK the kafka-sink and timer-source were imported
    cy.get('[data-testid="viz-step-timer-source"]').should('be.visible');
    cy.get('[data-testid="viz-step-kafka-sink"]').should('be.visible');
  });
});
