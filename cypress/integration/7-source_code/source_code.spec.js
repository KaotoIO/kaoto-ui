describe('source code and drag and drop', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
  });
  it('loads the YAML editor', () => {
    const dataTransfer = new DataTransfer();
    cy.get('[data-testid="toolbar-show-code-btn"]').click();
    cy.get('.pf-c-empty-state__secondary > .pf-c-button').click();
    cy.fixture('editor.txt').then((user) => {
      cy.get('.code-editor').type(user);
      cy.wait(2000);
      cy.get('[data-testid="toolbar-show-code-btn"]').click();
      cy.get('[data-testid="toolbar-step-catalog-btn"]').click();
      cy.get('#stepSearch').type('timer');
      cy.get('.pf-c-card__body').trigger('dragstart', {
        dataTransfer,
      });
      cy.get('[data-testid="react-flow-wrapper"]').contains('kafka-source').trigger('drop', {
        dataTransfer,
      });
      cy.get('[data-testid="toolbar-show-code-btn"]').click();
      cy.get('.code-editor')
      .contains('timer-source')
        .should('contain.text', 'timer-source', '{backspace}')
        .type('{end}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}kafka-source', {
          delay: 500,
        });
    });
  });
});
