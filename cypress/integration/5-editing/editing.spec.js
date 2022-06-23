describe('editing properties', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
        cy.visit(url);
  });

  it('loads the YAML editor', () => {
    cy.get('.code-editor').click();
    cy.get('button').contains('Start from scratch').click();

    cy.fixture('source.txt')
      .then((user) => {
        cy.get('.code-editor').type(user);
      })
      .then(() => {
        cy.get('[data-testid="react-flow-wrapper"]').contains('timer-source').click();
        cy.get('[data-testid="configurationTab"] ').click();
        cy.get('input[name="period"]').type("3000");
        cy.get('.code-editor').should('contain.text', 'period');
        cy.get('.pf-c-drawer__close > .pf-c-button').click()

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
        cy.get('[data-ouia-component-id="OUIA-Generated-Button-plain-7"]').click();

        cy.get('.code-editor')
          .contains('period')
          .should('have.text', 'period')
          .type('{end}{shift+alt}{leftArrow}{backspace}2', { delay: 500 })
          .wait(1000);
          cy.get('[data-testid="react-flow-wrapper"]').contains('timer-source').click();
        cy.get('[data-testid="configurationTab"] ').click();
      });
  });
});
