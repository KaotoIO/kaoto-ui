describe('User completes normal actions on steps in a branch', () => {
    beforeEach(() => {
        cy.intercept('/v1/deployments*').as('getDeployments');
        cy.intercept('/v1/steps/id/*').as('getStepDetails');
        cy.intercept('/v1/integrations/dsls').as('getDSLs');
        cy.intercept('/v1/view-definitions').as('getViewDefinitions');
        cy.intercept('/v2/integrations*').as('getIntegration');

        cy.openHomePage();
        cy.uploadFixture('EipAction.yaml');

        cy.zoomOutXTimes(3)
    });

    it('User configures a step in a branch', () => {
        cy.openStepConfigurationTab('digitalocean');

        cy.interactWithConfigInputObject('lazyStartProducer');
        cy.interactWithConfigInputObject('oAuthToken', 'token');

        // CHECK that the step yaml is updated
        cy.checkCodeSpanLine('lazyStartProducer: true');
        cy.checkCodeSpanLine('oAuthToken: token');
    });

    it(' User deletes a step in a branch', () => {
        cy.deleteStep('digitalocean');
        cy.syncUpCodeChanges();

        // CHECK that digitalocean step is deleted
        cy.get('[data-testid="viz-step-digitalocean"]').should('not.exist');
    });

    it('User replaces a step in a branch', () => {
        cy.dragAndDropFromCatalog('amqp', 'digitalocean');

        // CHECK digitalocean step was replaced with amqp
        cy.get('[data-testid="viz-step-digitalocean"]').should('not.exist');
        cy.get('[data-testid="viz-step-amqp"]').should('have.length', 1).and('be.visible');
    });
});
