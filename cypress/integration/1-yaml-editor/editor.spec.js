describe('YAML editor', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
  });

  it('loads the YAML editor', () => {
    cy.get('.code-editor').should('exist');
  });
});
