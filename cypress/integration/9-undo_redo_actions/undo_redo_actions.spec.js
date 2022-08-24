describe('Test for undo/redo actions on code-editor', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
    cy.wait(100);
  });

  it('loads the YAML editor', () => {
    cy.viewport(2000, 1000);

    // open source code editor
    cy.get('[data-testid="toolbar-show-code-btn"]').click();
    cy.wait(2000);

    // erase default yaml
    cy.get('[data-testid="sourceCode--clearButton"]').click();

    // select "start from scratch" in code editor's empty state
    cy.get('.pf-c-empty-state__secondary > .pf-c-button').click();

    // load fixture
    cy.fixture('undo_redo.txt').then((yaml) => {
      cy.get('.pf-c-code-editor__code').type(yaml, { timeout: 2000 });

      // the code editor should contain the loaded yaml
      cy.get('.code-editor', { timeout: 200 })
        .contains('kafka-source', { timeout: 200 })
        .type(
          '{end}' +
            '{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}' +
            '{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}' +
            'timer-source',
          { delay: 500 }
        );
      cy.get('[data-testid="sourceCode--undoButton"]').dblclick();
      cy.get('.pf-c-code-editor__code').contains('kafka-source');
      cy.get('[data-testid="sourceCode--redoButton"]').dblclick({ force: true });
      cy.get('.pf-c-code-editor__code').contains('timer-source');
    });
  });
});
