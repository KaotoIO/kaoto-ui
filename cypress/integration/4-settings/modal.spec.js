describe('Settings', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
  });

  it('settings cog button is visible', () => {
    cy.get('.pf-c-toolbar__content-section').click();
    cy.get('#pf-dropdown-toggle-id-3').click();
  });

  it('loads the settings modal', () => {
    cy.get('[data-testid="settings-modal"]').should('exist');
  });
});
