import 'cypress-file-upload';
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






    // cy.get('[data-testid='pf-c-code-editor__main']');

    // cy.get('#Start from scratch');
    // cy.readFile('/home/miram/kaoto-ui/cypress/fixtures/upload.yaml');

    //     const YAML = require('yamljs')

// cy.readFile('/home/miram/kaoto-ui/cypress/fixtures/upload.yaml').then((str) => {
  // parse the string into object literal
//   const english = YAML.parse(str)

//   cy.get('.code-editor')
    
//     .each(($el, i) => {
//       englishTitle = english.sidebar[i]

//       expect($el.text()).to.eq(englishTitle)
//     })
// })

   // cy.get('[data-testid="dndnode_2"]');
    // it('loads the visualization canvas', () => {
    //   cy.get('[data-testid="react-flow-wrapper"]').should('exist');

