describe.skip('Settings', () => {
  beforeEach(() => {
    cy.visit('http://localhost:1337');
  });

  it('settings cog button is visible', () => {
    cy.get('[data-testid="settingsButton"]').should('be.visible');
  });

  it('loads the settings modal', () => {
    cy.get('[data-testid="settings-modal"]').should('exist');
  });
});
