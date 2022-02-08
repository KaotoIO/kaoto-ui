describe.skip('visualization', () => {
  beforeEach(() => {
    cy.visit('http://localhost:1337');
  });

  it('loads the visualization canvas', () => {
    cy.get('.konvajs-content > canvas').should('exist');
  });
});
