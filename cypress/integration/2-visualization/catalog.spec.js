describe('step catalog', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
  });

  it('loads the step catalog', () => {
    cy.get('[data-testid="react-flow-wrapper"]').contains('ADD A STEP').click();
    cy.wait(1000);
    cy.get('[data-testid="stepCatalog"]').should('exist');
  });
});
