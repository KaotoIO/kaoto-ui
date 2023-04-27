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

  it('Enables dark mode in Kaoto', () => {
    cy.switchAppearanceTheme().should(() => {
      expect(localStorage.getItem('KAOTO_UI_THEME_IS_LIGHT')).to.eq('false');
    });

    // Check that theme is dark
    cy.get('.pf-theme-dark').should('exist');
    cy.get('html').should('have.class', 'pf-theme-dark').and('have.css', 'color-scheme', 'dark');

    // Reload Page and check that theme is still dark
    cy.openHomePage().should(() => {
      expect(localStorage.getItem('KAOTO_UI_THEME_IS_LIGHT')).to.eq('false');
    });
    cy.get('.pf-theme-dark').should('exist');
    cy.get('html').should('have.class', 'pf-theme-dark').and('have.css', 'color-scheme', 'dark');

    cy.openAppearanceModal();
    cy.switchAppearanceTheme().should(() => {
      expect(localStorage.getItem('KAOTO_UI_THEME_IS_LIGHT')).to.eq('true');
    });

    // Check that theme is not dark
    cy.get('.pf-theme-dark').should('not.exist');
    cy.get('html').should('not.have.class', 'pf-theme-dark').and('not.have.css', 'color-scheme', 'dark');

    // Reload Page and check that theme is still not dark
    cy.openHomePage().should(() => {
      expect(localStorage.getItem('KAOTO_UI_THEME_IS_LIGHT')).to.eq('true');
    });;
    cy.get('.pf-theme-dark').should('not.exist');
    cy.get('html').should('not.have.class', 'pf-theme-dark').and('not.have.css', 'color-scheme', 'dark');
  });

  it('Enables light mode in code editor', () => {
    cy.switchAppearanceTheme('editor').should(() => {
      expect(localStorage.getItem('KAOTO_EDITOR_THEME_IS_LIGHT')).to.eq('true');
    });
    cy.closeAppearanceModal();

    // Check that theme is not dark
    cy.openCodeEditor();
    cy.get('.monaco-scrollable-element').should('not.have.class', 'vs-dark');

    // Reload Page and check that theme is still not dark
    cy.openHomePage().should(() => {
      expect(localStorage.getItem('KAOTO_EDITOR_THEME_IS_LIGHT')).to.eq('true');
    });
    cy.openCodeEditor();
    cy.get('.monaco-scrollable-element').should('not.have.class', 'vs-dark');

    cy.openAppearanceModal();
    cy.switchAppearanceTheme('editor')
    cy.closeAppearanceModal();

    // Check that theme is dark
    cy.get('.monaco-scrollable-element').should('have.class', 'vs-dark');

    // Reload Page and check that theme is still dark
    cy.openHomePage().should(() => {
      expect(localStorage.getItem('KAOTO_EDITOR_THEME_IS_LIGHT')).to.eq('false');
    });
    cy.openCodeEditor();
    cy.get('.monaco-scrollable-element').should('have.class', 'vs-dark');
  });
});
