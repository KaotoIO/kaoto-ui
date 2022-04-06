describe.skip('step extensions', () => {
  beforeEach(() => {
    cy.visit('http://localhost:1337');
  });

  it('loads the step extension', () => {
    // click on a step, need mock data
    cy.get('[data-testid="stepExtensionTab"]').click();
    cy.get('[data-testid="stepExtension"]').should('exist');
  });
});
