describe('Settings: Appearance', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
    cy.get('.pf-c-toolbar__content-section').click();
    cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click();
    cy.get('[data-testid="kaotoToolbar-kebab__appearance"]').click();
  });

  it('Close and reopen appearance modal', () => {
    // close
    cy.get('#pf-modal-part-3 > .pf-c-button').click();

    // reopen
    cy.get('.pf-c-toolbar__content-section').click();
    cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click();
    cy.get('[data-testid="kaotoToolbar-kebab__appearance"]').click();
    cy.get('[data-testid="appearance-modal"').should('be.visible');
  });

  it('enables dark mode in Kaoto', () => {
    cy.get('[data-testid="appearance--theme-switch"]').click({ force: true });
    cy.get('.pf-theme-dark').should('exist');
    cy.get('html').should('have.class', 'pf-theme-dark').and('have.css', 'color-scheme', 'dark');

    cy.get('[data-testid="appearance--theme-switch"]').click({ force: true });
    cy.get('.pf-theme-dark').should('not.exist');
    cy.get('html')
      .should('not.have.class', 'pf-theme-dark')
      .and('not.have.css', 'color-scheme', 'dark');
  });

  it('enables light mode in code editor', () => {
    cy.get('[data-testid="appearance--theme-editor-switch"]').click({ force: true });
    cy.get('#pf-modal-part-3 > .pf-c-button').click();

    cy.get('[data-testid="toolbar-show-code-btn"]').click();
    cy.get('.monaco-scrollable-element').should('not.have.class', 'vs-dark');

    cy.get('.pf-c-toolbar__content-section').click();
    cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click();
    cy.get('[data-testid="kaotoToolbar-kebab__appearance"]').click();
    cy.get('[data-testid="appearance--theme-editor-switch"]').click({ force: true });
    cy.get('#pf-modal-part-3 > .pf-c-button').click();
    cy.get('.monaco-scrollable-element').should('have.class', 'vs-dark');
  });
});
