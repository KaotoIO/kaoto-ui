describe('step configuration', () => {
  beforeEach(() => {
    cy.visit('http://localhost:1337');
  });

  it('loads the configuration tab', () => {
    cy.get('[data-testid]="configuration-tab"').should('exist');
  });
});
