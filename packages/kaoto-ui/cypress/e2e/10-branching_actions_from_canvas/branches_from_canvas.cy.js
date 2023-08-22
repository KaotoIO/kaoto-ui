describe('Test for Branching actions from the canvas', () => {
    beforeEach(() => {
        cy.intercept('/v1/deployments*').as('getDeployments');
        cy.intercept('/v1/integrations/dsls').as('getDSLs');
        cy.intercept('/v1/view-definitions').as('getViewDefinitions');
        cy.intercept('POST', '/v2/integrations*').as('getIntegration');

        cy.openHomePage();
        cy.uploadFixture('EipAction.yaml');

        cy.zoomOutXTimes(3)
    });

    it(' User appends a branch from the canvas', () => {

        cy.isomorphicGet('[data-testid="viz-step-choice"]').eq(0).children('[data-testid="stepNode__appendStep-btn"]').should('be.disabled');

        cy.openStepConfigurationTab('choice', true, 0);
        cy.addBranchChoiceExtension();
        cy.closeStepConfigurationTab();

        // CHECK that new node with empty slot was created
        cy.isomorphicGet('[data-testid="viz-step-choice"]').should('have.length', 2);
        // 1 slot for the aggregate step and another one recently created
        cy.isomorphicGet('[data-testid="viz-step-slot"]').should('have.length', 2);
        cy.isomorphicGet('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-slot');

        // CHECK after Sync your code button click
        cy.isomorphicGet('[data-testid="viz-step-choice"]').should('have.length', 2);
        // 1 slot for the aggregate step and another one recently created
        cy.isomorphicGet('[data-testid="viz-step-slot"]').should('have.length', 2);
        cy.isomorphicGet('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-slot');
    });

    it('User deletes a branch from the canvas', () => {
        cy.deleteBranch(1);

        // CHECK that the branch was deleted and the node with index 11 contains the viz-step-kamelet:sink
        cy.isomorphicGet('[data-testid="viz-step-marshal"]').should('not.exist');
        cy.isomorphicGet('.stepNode').eq(12).should('have.attr', 'data-testid', 'viz-step-kamelet:sink');
        cy.isomorphicGet('.code-editor').should('not.contain.text', '{{?bar}}')

        cy.syncUpCodeChanges()

        // CHECK after Sync your code button click
        cy.isomorphicGet('[data-testid="viz-step-marshal"]').should('not.exist');
        cy.isomorphicGet('.stepNode').eq(12).should('have.attr', 'data-testid', 'viz-step-kamelet:sink');
        cy.isomorphicGet('.code-editor').should('not.contain.text', '{{?bar}}')
    });

    it('User inserts a branch from the canvas', () => {
        cy.insertStepMiniCatalog('choice', 0);

        // CHECK new choice step added
        cy.isomorphicGet('.stepNode').eq(1).should('have.attr', 'data-testid', 'viz-step-choice');
        cy.openStepConfigurationTab('choice', true, 0);
        cy.addBranchChoiceExtension();
        cy.closeStepConfigurationTab();

        // CHECK that new node with empty slot was created
        cy.isomorphicGet('[data-testid="viz-step-choice"]').should('have.length', 3);
        // 1 slot for the aggregate step and another one recently created
        cy.isomorphicGet('[data-testid="viz-step-slot"]').should('have.length', 2);
        cy.isomorphicGet('.stepNode').eq(2).should('have.attr', 'data-testid', 'viz-step-slot');

        cy.syncUpCodeChanges()

        // CHECK after Sync your code button click
        // 1 slot for the aggregate step and another one recently created
        cy.isomorphicGet('[data-testid="viz-step-slot"]').should('have.length', 2);
        cy.isomorphicGet('.stepNode').eq(2).should('have.attr', 'data-testid', 'viz-step-slot');

        // CHECK that the choice add button is disabled
        cy.isomorphicGet('[data-testid="viz-step-choice"]').eq(0).children('[data-testid="stepNode__appendStep-btn"]').should('be.disabled');
});

    it('User appends a step in a branch from the canvas (last in the branch)', () => {
        cy.appendStepMiniCatalog('set-header', 'activemq');

        // CHECK that the activemq step was inserted between digitalocean and set-header steps
        cy.isomorphicGet('.stepNode').eq(4).should('have.attr', 'data-testid', 'viz-step-digitalocean');
        cy.isomorphicGet('.stepNode').eq(5).should('have.attr', 'data-testid', 'viz-step-set-header');
        cy.isomorphicGet('.stepNode').eq(6).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.isomorphicGet('[data-testid="viz-step-activemq"]').should('be.visible');

        cy.syncUpCodeChanges()

        // CHECK after Sync your code button click
        cy.isomorphicGet('.stepNode').eq(4).should('have.attr', 'data-testid', 'viz-step-digitalocean');
        cy.isomorphicGet('.stepNode').eq(5).should('have.attr', 'data-testid', 'viz-step-set-header');
        cy.isomorphicGet('.stepNode').eq(6).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.isomorphicGet('[data-testid="viz-step-activemq"]').should('be.visible');
    });

    it('User prepends a step in a branch from the canvas (first in the branch)', () => {
        cy.prependStepMiniCatalog('digitalocean', 'activemq');

        // CHECK that the activemq step was inserted between digitalocean and set-header steps
        cy.isomorphicGet('.stepNode').eq(4).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.isomorphicGet('.stepNode').eq(5).should('have.attr', 'data-testid', 'viz-step-digitalocean');
        cy.isomorphicGet('.stepNode').eq(6).should('have.attr', 'data-testid', 'viz-step-set-header');
        cy.isomorphicGet('[data-testid="viz-step-activemq"]').should('be.visible');

        cy.syncUpCodeChanges()

        // CHECK after Sync your code button click
        cy.isomorphicGet('.stepNode').eq(4).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.isomorphicGet('.stepNode').eq(5).should('have.attr', 'data-testid', 'viz-step-digitalocean');
        cy.isomorphicGet('.stepNode').eq(6).should('have.attr', 'data-testid', 'viz-step-set-header');
        cy.isomorphicGet('[data-testid="viz-step-activemq"]').should('be.visible');
    });

    it('User prepends a step to a step whose previous step contains branches', () => {
        cy.prependStepMiniCatalog('filter', 'activemq');

        // CHECK that the activemq step was prepended before filter and after all the branches ends
        cy.isomorphicGet('.stepNode').eq(5).should('have.attr', 'data-testid', 'viz-step-set-header');
        cy.isomorphicGet('.stepNode').eq(7).should('have.attr', 'data-testid', 'viz-step-marshal');
        cy.isomorphicGet('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-log');
        cy.isomorphicGet('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-aggregate');
        cy.isomorphicGet('.stepNode').eq(12).should('have.attr', 'data-testid', 'viz-step-slot'); // aggregate slot for steps property
        cy.isomorphicGet('.stepNode').eq(13).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.isomorphicGet('.stepNode').eq(14).should('have.attr', 'data-testid', 'viz-step-filter');
        cy.isomorphicGet('[data-testid="viz-step-activemq"]').should('be.visible');

        cy.syncUpCodeChanges()

        // CHECK after Sync your code button click
        cy.isomorphicGet('.stepNode').eq(5).should('have.attr', 'data-testid', 'viz-step-set-header');
        cy.isomorphicGet('.stepNode').eq(7).should('have.attr', 'data-testid', 'viz-step-marshal');
        cy.isomorphicGet('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-log');
        cy.isomorphicGet('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-aggregate');
        cy.isomorphicGet('.stepNode').eq(12).should('have.attr', 'data-testid', 'viz-step-slot'); // aggregate slot for steps property
        cy.isomorphicGet('.stepNode').eq(13).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.isomorphicGet('.stepNode').eq(14).should('have.attr', 'data-testid', 'viz-step-filter');
        cy.isomorphicGet('[data-testid="viz-step-activemq"]').should('be.visible');
    });
});
