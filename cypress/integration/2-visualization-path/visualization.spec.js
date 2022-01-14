describe('editor flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:1337');
  });

  it('loads the visualization', () => {
    cy.get('.konvajs-content > canvas').should('exist');
  });
});
