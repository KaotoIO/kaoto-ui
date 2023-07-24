describe('Test for catalog actions', () => {
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

    it("User drags and drops an invalid step onto a nested branch step", () => {
        cy.dragAndDropFromCatalog('timer', 'digitalocean', 'start', 0, true);

        // CHECK digitalocean step is visible
        cy.isomorphicGet('[data-testid="viz-step-digitalocean"]').should('be.visible');
        // CHECK aggregation step was not created
        cy.isomorphicGet('[data-testid="viz-step-timer"]').should('not.exist');
        // CHECK alert box is visible and contains error message
        cy.isomorphicGet('[data-testid="alert-box-replace-unsuccessful"]').should('be.visible');
        cy.isomorphicGet('[data-testid="alert-box-replace-unsuccessful"]').should('contain', 'You cannot replace a middle step with a start step');
    });

    it("User replaces a placeholder step via drag & drop from the big catalog", () => {
        cy.dragAndDropFromCatalog('delay', 'digitalocean');

        // CHECK digitalocean step was replaced
        cy.isomorphicGet('[data-testid="viz-step-digitalocean"]').should('not.exist');
        // CHECK delay step was created
        cy.isomorphicGet('[data-testid="viz-step-delay"]').should('be.visible');
    });

    // Replace the digitalocean step with the delay step with the mini catalog (Delete and Prepend)
    it("User replaces a placeholder step using the mini catalog (Delete and Insert)", () => {
        // delete digitalocean step
        cy.deleteStep('digitalocean');
        cy.prependStepMiniCatalog('set-header', 'delay');

        // CHECK digitalocean step was replaced
        cy.isomorphicGet('[data-testid="viz-step-digitalocean"]').should('not.exist');
        // CHECK delay step was created
        cy.isomorphicGet('[data-testid="viz-step-delay"]').should('be.visible');
    });

});
