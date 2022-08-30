describe('Settings: Appearance', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
    cy.get('.pf-c-toolbar__content-section').click();
    cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click();
    cy.get('[data-testid="kaotoToolbar-kebab__appearance"]').click();
  });

  it('loads the appearance modal', () => {
    cy.get('[data-testid="appearance-modal"').should('be.visible');
  });

  it('enables dark mode', () => {
    cy.get('[data-testid="appearance--theme-switch"]').click({ force: true });
    cy.get('.pf-theme-dark').should('exist');
  });

  it('disables dark mode', () => {
    cy.get('[data-testid="appearance--theme-switch"]').dblclick({ force: true });
    cy.get('.pf-theme-dark').should('not.exist');
  });
});
