describe('Kaoto Location configurable', () => {
  it('Kaoto Location configurable', () => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
  });
});
