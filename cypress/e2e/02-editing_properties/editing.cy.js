describe('editing properties', () => {
  beforeEach(() => {
    cy.intercept('/v1/integrations/dsls').as('getDSLs');
    cy.intercept('/v1/view-definitions').as('getViewDefinitions');
    cy.intercept('/v1/integrations*').as('getIntegration');

    cy.openHomePage();
  });

  it('loads the YAML editor', () => {
    cy.uploadFixture('TimerKafka.yaml');

    // Configure timer - source step
    cy.openStepConfigurationTab('timer-source');
    cy.interactWithConfigInputObject('period', '3000');
    cy.checkCodeSpanLine('period: \'3000\'');
    cy.closeStepConfigurationTab();

    // Configure kafka-sink step
    cy.openStepConfigurationTab('kafka-sink');
    cy.interactWithConfigInputObject('topic', 'topicname');
    cy.interactWithConfigInputObject('bootstrapServers', 'bootstrap');
    cy.interactWithConfigInputObject('securityProtocol', 'security');
    cy.interactWithConfigInputObject('saslMechanism', 'sasl');
    cy.interactWithConfigInputObject('user', 'user');
    cy.interactWithConfigInputObject('password', 'password');

    // CHECK they are reflected in the code editor
    cy.checkCodeSpanLine('topic: topicname');
    cy.checkCodeSpanLine('bootstrapServers: bootstrap');
    cy.checkCodeSpanLine('securityProtocol: security');
    cy.checkCodeSpanLine('saslMechanism: sasl');
    cy.checkCodeSpanLine('user: user');
    cy.checkCodeSpanLine('password: password');

    cy.closeStepConfigurationTab();

    // CHECK that previous change is still there
    cy.checkCodeSpanLine('period: \'3000\'');
  });
});
