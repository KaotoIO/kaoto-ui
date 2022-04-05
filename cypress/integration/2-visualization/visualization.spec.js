describe('visualization', () => {
  beforeEach(() => {
    cy.visit('http://localhost:1337');
  });

  it('loads the visualization canvas', () => {
    cy.get('[data-testid="react-flow-wrapper"]').should('exist');
  });
});
