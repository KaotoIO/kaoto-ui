describe('Test for undo/redo actions on code-editor', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
  });

  it('loads the YAML editor', () => {
    cy.viewport(2000, 1000);

    // open source code editor
    cy.get('[data-testid="toolbar-show-code-btn"]').click();
    cy.get('.code-editor').click().type('{selectAll}{backspace}');

    // select "start from scratch" in code editor's empty state
    cy.get('.pf-c-empty-state__secondary > .pf-c-button').click();

    // load fixture
    cy.fixture('undo_redo.txt').then((yaml) => {
      cy.get('.code-editor').type(yaml);
      cy.wait(4000);

      // the code editor should contain the loaded yaml
      cy.get('.code-editor')
        .contains('kafka-source')
        .type(
          '{end}' +
            '{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}' +
            '{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}' +
            'timer-source',
          { delay: 500 }
        );
      cy.get('[aria-label="Undo change"] > svg').click();
      cy.get('[aria-label="Undo change"] > svg').click();
      cy.get('[data-testid="react-flow-wrapper"]').contains('kafka-source');
      cy.get('[aria-label="Redo change"] > svg').click();
      cy.get('[aria-label="Redo change"] > svg').click();
      cy.get('[data-testid="react-flow-wrapper"]').contains('timer-source');
    });
  });
});
