describe('visualization', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
  });

  it('loads the visualization canvas', () => {
    cy.get('[data-testid="react-flow-wrapper"]').should('exist');
  });
});
