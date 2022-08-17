describe('Test for undo/redo actions on code-editor', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
  });

  it('loads the YAML editor', () => {
    cy.viewport(2000, 1000);
    const dataTransfer = new DataTransfer();
    cy.get('[data-testid="toolbar-show-code-btn"]').click();
    cy.get('.code-editor').click().type('{meta}A {backspace}');
    cy.get('.pf-c-empty-state__secondary > .pf-c-button').click();
    cy.fixture('undo_redo.txt').then((user) => {
      cy.get('.code-editor').type(user);
      cy.wait(2000);
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
      cy.wait(2000);
    });
  });
});
