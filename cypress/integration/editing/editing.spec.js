describe('editing properties', () => {
  beforeEach(() => {
    cy.visit('http://localhost:1337');
  });

  it('loads the YAML editor', () => {
    cy.get('.code-editor').click();
    cy.get('button').contains('Start from scratch').click();
     
    cy.fixture('editor.txt')
    .then((user) => {
      cy.get('.code-editor').type(user);
    })
    .then(() => {
      cy.get('[data-id="dndnode_2"]', {timeout:50000}).click();
      cy.get('[data-testid="configurationTab"]').click();
      cy.get('[data-testid="json-schema-configurator"]').click();
    })
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
    });
  });
