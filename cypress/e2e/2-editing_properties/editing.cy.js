describe('editing properties', () => {
  before(() => {
    let url = Cypress.config().baseUrl;

    cy.intercept('/v1/integrations/dsls').as('getDSLs');
    cy.intercept('/v1/view-definitions').as('getViewDefinitions');
    cy.intercept('/v1/integrations*').as('getIntegration');
    cy.intercept('/v1/deployments*').as('getDeployments');

    cy.visit(url);
    cy.viewport(2000, 1000);
  });

  it('loads the YAML editor', () => {
    // LOAD FIXTURE
    // attaches the file as an input, NOT drag-and-drop, as that will
    // create a dropzone overlay that then prevents you from typing
    cy.get('[data-testid="toolbar-show-code-btn"]').click();
    cy.get('.pf-c-code-editor__main > input').attachFile('TimerKafka.yaml');

    // trigger the visualization to update
    cy.get('.code-editor').click().type('{end}{enter}');

    // wait until the API returns the updated visualization
    cy.wait('@getIntegration');
    cy.wait('@getDSLs');
    cy.wait('@getViewDefinitions');

    // verify the visualization & code editor both contain the
    // new step (timer-source)
    cy.get('[data-testid="react-flow-wrapper"]').contains('timer-source').click();
    cy.get('[data-testid="configurationTab"]').click();
    cy.get('input[name="period"]').type('3000');

    cy.get('.code-editor').should('contain.text', 'period');
    cy.get('.pf-c-drawer__close > .pf-c-button').click();

    // verify the visualization contains kafka-sink
    cy.get('[data-testid="react-flow-wrapper"]').contains('kafka-sink').click();
    cy.get('[data-testid="configurationTab"]').click();
    cy.get('[data-testid="json-schema-configurator"]').click();

    // update properties
    cy.get('input[name="topic"]').clear().type('topicname');
    cy.get('input[name="bootstrapServers"]').clear().type('bootstrap');
    cy.get('input[name="securityProtocol"]').clear().type('security');
    cy.get('input[name="saslMechanism"]').clear().type('sasl');
    cy.get('input[name="user"]').clear().type('user');
    cy.get('input[name="password"]').clear().type('password');

    // verify they are reflected in the code editor
    cy.get('.code-editor')
      .should('contain.text', 'topicname')
      .and('contain.text', 'bootstrap')
      .and('contain.text', 'security')
      .and('contain.text', 'sasl')
      .and('contain.text', 'user')
      .and('contain.text', 'password');

    cy.get('.pf-c-drawer__close > .pf-c-button > svg').click();

    cy.get('.code-editor').contains('period');
  });
});
