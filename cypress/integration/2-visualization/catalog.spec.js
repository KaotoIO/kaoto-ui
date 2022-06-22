describe('step catalog', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
  });

  it('loads the step catalog', () => {
    cy.get('[data-testid="openCatalogButton"]').click();
    cy.get('[data-testid="stepCatalog"]').should('exist');
  });
});
