describe.skip('step configuration', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
  });

  it('loads the configuration tab', () => {
    // need to click on a step, mock data
    cy.get('[data-testid="configurationTab"]').should('exist');
  });
});
