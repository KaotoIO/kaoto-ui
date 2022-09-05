describe.skip('step extensions', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
  });

  it('loads the step extension', () => {
    // click on a step, need mock data
    cy.get('[data-testid="stepExtensionTab"]').click();
    cy.get('[data-testid="stepExtension"]').should('exist');
  });
});
