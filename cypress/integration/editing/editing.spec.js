import 'cypress-file-upload';
describe('editing properties', () => {
  beforeEach(() => {
    cy.visit('http://localhost:1337');
  });

  it('loads the YAML editor', () => {
    cy.get('.code-editor').click();
    cy.get('button').contains('Start from scratch').click();
  
    cy.get('.code-editor').type('group: camel.apache.org\n'+
    'kind: KameletBinding\n'+
    'metadata:\n'+
      'additionalProperties: {}\n'+
      'finalizers: []\n'+
      'managedFields: []\n'+
      'name: Updated integration\n'+
      'ownerReferences: []\n'+
  'plural: kameletbindings\n'+
    'scope: Namespaced\n'+
    'served: true\n'+
    'singular: kameletbinding\n'+
    'spec:\n'+
      'source:\n'+
        'ref:\n'+
          'apiVersion: camel.apache.org/v1alpha1\n'+
          'name: timer-source\n'+
          'kind: Kamelet\n'+
      'sink:\n'+
        'ref:\n'+
          'apiVersion: camel.apache.org/v1alpha1\n'+
          'name: kafka-sink\n'+
          'kind: Kamelet\n'+
    'storage: true\n'+
    'version: v1alpha1');
    
    // cy.get('[data-testid="dndnode_2"]');
    // it('loads the visualization canvas', () => {
    //   cy.get('[data-testid="react-flow-wrapper"]').should('exist');
    
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

