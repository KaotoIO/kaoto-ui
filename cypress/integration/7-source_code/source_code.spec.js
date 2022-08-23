describe('source code and drag and drop', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
  });
  it('loads the YAML editor', () => {
    cy.viewport(2000, 1000);
    const dataTransfer = new DataTransfer();
    cy.get('[data-testid="toolbar-show-code-btn"]').click();
    cy.get('.code-editor')
      .click({ timeout: 2000 })
      .type('{selectAll}{backspace}', { timeout: 2000 });
    cy.get('.pf-c-empty-state__secondary > .pf-c-button').click();
    cy.fixture('kafka-to-kafka-yaml.txt').then((sourceCode) => {
      cy.get('.code-editor')
        .click()
        .type('{selectAll}{backspace}')
        .type(sourceCode, { timeout: 1000 });
      cy.wait(2000);

      // open source code editor
      cy.get('[data-testid="toolbar-show-code-btn"]').click();

      // open catalog, search for timer step
      cy.get('[data-testid="toolbar-step-catalog-btn"]').click();
      cy.get('#stepSearch').type('timer');

      cy.get('[data-testid="catalog-step-timer-source"]').trigger('dragstart', {
        dataTransfer,
      });

      // drag timer from catalog over existing kafka step
      cy.get('[data-testid="viz-step-kafka-source"]').trigger('drop', {
        dataTransfer,
      });
      cy.get('[data-testid="toolbar-show-code-btn"]').click();
      cy.wait(2000);
      cy.get('.pf-c-code-editor__code')
        .contains('timer-source', { timeout: 1000 })
        .type(
          '{end}' +
            '{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}' +
            '{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}' +
            'kafka-source',
          { delay: 500 }
        );
    });
  });
});
