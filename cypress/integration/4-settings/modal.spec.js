describe('Settings', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
  });

  it('settings cog button is visible', () => {
    cy.get('[data-testid="settingsButton"]').should('be.visible');
  });

  it('loads the settings modal', () => {
    cy.get('[data-testid="settings-modal"]').should('exist');
  });
});
