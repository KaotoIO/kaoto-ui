describe.skip('step catalog', () => {
  beforeEach(() => {
    cy.visit('http://localhost:1337');
  });

  it('loads the step catalog', () => {
    cy.get('[data-testid="openCatalogButton"]').click();
    cy.get('[data-testid="stepCatalog"]').should('exist');
  });
});
