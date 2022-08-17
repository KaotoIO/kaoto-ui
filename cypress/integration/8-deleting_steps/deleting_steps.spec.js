describe('Test for deleting steps', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
  });
  it('loads the YAML editor', () => {
    cy.viewport(2000, 1000);
    cy.get('[data-testid="toolbar-show-code-btn"]').click();
    cy.get('.code-editor').click().type('{meta}A {backspace}');
    cy.get('.pf-c-empty-state__secondary > .pf-c-button').click();
    cy.fixture('delete.txt').then((user) => {
      cy.get('.code-editor').type(user);
      cy.wait(1000);
      cy.get('[data-testid="react-flow-wrapper"]').contains('chuck-norris').click();
      cy.wait(1000);
      cy.get('.pf-c-drawer__panel-main > :nth-child(2) > .pf-c-button').click();
      cy.get('.code-editor').contains('chuck-norris-s..').should('not.exist');
      cy.get('[data-testid="react-flow-wrapper"]').contains('chunk-template..').click();
      cy.get('.pf-c-drawer__panel-main > :nth-child(2) > .pf-c-button').click();
      cy.get('[data-testid="react-flow-wrapper"]').contains('kafka-sink').click();
      cy.get(':nth-child(2) > .pf-c-button').click();
    });
  });
});
