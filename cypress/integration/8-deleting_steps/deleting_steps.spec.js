describe('Test for deleting steps', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
    cy.viewport(2000, 1000);
  });

  it('loads the YAML editor', () => {
    // show the code editor
    cy.get('[data-testid="toolbar-show-code-btn"]').click();

    // erase default yaml
    // add a clear button
    cy.get('.code-editor')
      .click({ timeout: 2000 })
      .wait(1000)
      .type('{selectAll}{backspace}', { timeout: 2000 });

    // having no code should load the empty state
    cy.get('.pf-c-empty-state__secondary > .pf-c-button').click();

    // load new yaml from fixture, into source code editor
    cy.fixture('delete.txt').then((yaml) => {
      // erase default yaml again
      // reason: syncing with visualization sometimes causes yaml to regenerate
      cy.get('.code-editor').click().type('{selectAll}{backspace}').type(yaml);

      // wait (necessary for ci and running tests with decreased resources)
      cy.wait(1000);

      cy.get('[data-testid="react-flow-wrapper"]').contains('chuck-norris').click();

      // wait (necessary for ci and running tests with decreased resources)
      cy.wait(1000);
      cy.get('.pf-c-drawer__panel-main > :nth-child(2) > .pf-c-button').click();
      cy.get('.code-editor').contains('chuck-norris').should('not.exist');
      cy.get('[data-testid="react-flow-wrapper"]').contains('chunk-template').click();
      cy.get('.pf-c-drawer__panel-main > :nth-child(2) > .pf-c-button').click();
      cy.get('[data-testid="react-flow-wrapper"]').contains('kafka-sink').click();
      cy.get(':nth-child(2) > .pf-c-button').click();
    });
  });

  it('', () => {});
});
