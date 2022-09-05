describe('Settings', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
  });

  it('settings cog button is visible', () => {
    cy.get('.pf-c-toolbar__content-section').click();
    cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click();
  });

  it('loads the settings modal', () => {
    cy.get('[data-testid="settings-modal"]').should('exist');
  });
});
