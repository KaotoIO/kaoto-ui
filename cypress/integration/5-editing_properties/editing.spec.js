describe('editing properties', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
  });

  it('loads the YAML editor', () => {
    cy.viewport(2000, 1000);
    cy.get('[data-testid="toolbar-show-code-btn"]').click();
    cy.get('.code-editor').click().type('{meta}A {backspace}');
    cy.get('.pf-c-empty-state__secondary > .pf-c-button').click();

    cy.fixture('source.txt')
      .then((user) => {
        cy.get('.code-editor').type(user);
      })
      .then(() => {
        cy.get('[data-testid="react-flow-wrapper"]').contains('timer-source').click();
        cy.wait(1000);
        cy.get('[data-testid="configurationTab"]').click();
        cy.get('input[name="period"]').type('3000');
        cy.get('.code-editor').should('contain.text', 'period');
        cy.get('.pf-c-drawer__close > .pf-c-button').click();

        cy.get('[data-testid="react-flow-wrapper"]').contains('kafka-sink').click();
        cy.get('[data-testid="configurationTab"]').click();
        cy.get('[data-testid="json-schema-configurator"]').click();
      })
      .then(() => {
        cy.get('input[name="topic"]').type('topicname');
        cy.get('.code-editor').should('contain.text', 'topicname');
        cy.get('input[name="bootstrapServers"]').type('bootstrap');
        cy.get('.code-editor').should('contain.text', 'bootstrap');
        cy.get('input[name="securityProtocol"]').type('security');
        cy.get('.code-editor').should('contain.text', 'security');
        cy.get('input[name="saslMechanism"]').type('sasl');
        cy.get('.code-editor').should('contain.text', 'sasl');
        cy.get('input[name="user"]').type('user');
        cy.get('.code-editor').should('contain.text', 'user');
        cy.get('input[name="password"]').type('password');
        cy.get('.code-editor').should('contain.text', 'password');
        cy.get('.pf-c-drawer__close > .pf-c-button > svg').click();
        cy.get('.code-editor')
          .contains('period')
          .type(
            '{end}{leftArrow}{backspace}{backspace}{leftArrow}99',
            { delay: 500 },
            { force: true }
          )
          .wait(1000);
        cy.get('[data-testid="react-flow-wrapper"]').contains('timer-source').click();
        cy.get('[data-testid="configurationTab"] ').click();
      });
  });
});
