describe('YAML editor', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
  });

  it('loads the YAML editor', () => {
    cy.get('[data-testid="toolbar-show-code-btn"]').click();
    cy.get('[data-testid="toolbar-show-code-btn"]').should('exist');
  });
});
