describe.skip('YAML editor', () => {
  beforeEach(() => {
    cy.visit('http://localhost:1337');
  });

  it('loads the YAML editor', () => {
    cy.get('.code-editor').should('exist');
  });
});
