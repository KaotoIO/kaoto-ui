describe('Settings: Appearance', () => {
  beforeEach(() => {
    cy.intercept('/v1/integrations/dsls').as('getDSLs');
    cy.intercept('/v1/view-definitions').as('getViewDefinitions');
    cy.intercept('/v1/integrations*').as('getIntegration');

    cy.openHomePage();
    cy.openAppearanceModal();
  });

  it('Close and reopen appearance modal', () => {
    cy.closeAppearanceModal();
    cy.openAppearanceModal();

    // Check that the modal is open
    cy.get('[data-testid="appearance-modal"').should('be.visible');
  });

  it('enables dark mode in Kaoto', () => {
    cy.switchAppearanceTheme()

    // Check that theme is dark
    cy.get('.pf-theme-dark').should('exist');
    cy.get('html').should('have.class', 'pf-theme-dark').and('have.css', 'color-scheme', 'dark');

    cy.switchAppearanceTheme()

    // Check that theme is not dark
    cy.get('.pf-theme-dark').should('not.exist');
    cy.get('html')
      .should('not.have.class', 'pf-theme-dark')
      .and('not.have.css', 'color-scheme', 'dark');
  });

  it('enables light mode in code editor', () => {
    cy.switchAppearanceTheme('editor')
    cy.closeAppearanceModal();
    cy.openCodeEditor();

    // Check that theme is not dark
    cy.get('.monaco-scrollable-element').should('not.have.class', 'vs-dark');

    cy.openAppearanceModal();
    cy.switchAppearanceTheme('editor')
    cy.closeAppearanceModal();

    // Check that theme is dark
    cy.get('.monaco-scrollable-element').should('have.class', 'vs-dark');
  });
});
