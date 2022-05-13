
describe('editing properties', () => {
  beforeEach(() => {
    cy.visit('http://localhost:1337');
  });

  it('loads the YAML editor', () => {
    cy.get('.code-editor').click();
    cy.get('button').contains('Start from scratch').click();
     
    cy.fixture('editor.txt').then((user) => {
      cy.get('.code-editor').type(user)
      cy.get('[data-id="dndnode_2"]').click();
      cy.get('[data-testid="configurationTab"]').click();
      cy.get('[data-testid="json-schema-configurator"]').click();
      cy.get('input[name="topic"]').type('Hello');
      cy.get('input[name="bootstrapServers"]').type('anything');
      cy.get('input[name="securityProtocol"]').type('anything');
      cy.get('input[name="saslMechanism"]').type('anything');
      cy.get('input[name="user"]').type('anything');  
      cy.get('input[name="password"]').type('anything');       
    
    }) ;
  });

});








    

