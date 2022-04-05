describe('step configuration', () => {
  beforeEach(() => {
    cy.visit('http://localhost:1337');
  });

  it('loads the configuration tab', () => {
    // need to click on a step, mock data
    cy.get('[data-testid="configurationTab"]').should('exist');
  });
});
