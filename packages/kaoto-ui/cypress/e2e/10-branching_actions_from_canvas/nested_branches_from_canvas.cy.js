describe('Test for Nested Branching actions from the canvas', () => {
    beforeEach(() => {
        cy.intercept('/v1/deployments*').as('getDeployments');
        cy.intercept('/v1/integrations/dsls').as('getDSLs');
        cy.intercept('/v1/view-definitions').as('getViewDefinitions');
        cy.intercept('POST', '/v2/integrations*').as('getIntegration');

        cy.openHomePage();
        cy.uploadFixture('EipAction.yaml');

        cy.zoomOutXTimes(3)
    });

    it('User inserts/appends a nested branch from the canvas', () => {
        cy.isomorphicGet('[data-testid="stepNode__insertStep-btn"]').eq(3).click();
        cy.isomorphicGet('[data-testid="miniCatalog__branches"]').should('have.attr', 'aria-disabled', 'true')
        cy.isomorphicGet('.pf-c-button.pf-m-plain').click();
        cy.openStepConfigurationTab('choice', true, 1);
        cy.addBranchChoiceExtension();
        cy.addBranchChoiceExtension('other');
        cy.closeStepConfigurationTab();
        cy.replaceEmptyStepMiniCatalog('activemq');
        cy.replaceEmptyStepMiniCatalog('amqp');

        // CHECK that two new nodes were created with indexes 9 and 10 and contain viz-step-slot
        cy.isomorphicGet('[data-testid="viz-step-activemq"]').should('be.visible');
        cy.isomorphicGet('[data-testid="viz-step-amqp"]').should('be.visible');
        cy.isomorphicGet('[data-testid="viz-step-choice"]').should('have.length', 2);
        cy.isomorphicGet('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.isomorphicGet('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-amqp');

        cy.syncUpCodeChanges()

        // CHECK after Sync your code button click
        cy.isomorphicGet('[data-testid="viz-step-activemq"]').should('be.visible');
        cy.isomorphicGet('[data-testid="viz-step-amqp"]').should('be.visible');
        cy.isomorphicGet('[data-testid="viz-step-choice"]').should('have.length', 2);
        cy.isomorphicGet('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.isomorphicGet('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-amqp');

        cy.isomorphicGet('[data-testid="viz-step-choice"]').eq(1).children('[data-testid="stepNode__appendStep-btn"]').should('be.disabled');
    })

    it('User deletes a branch from the canvas', () => {
        cy.openStepConfigurationTab('choice', true, 1);
        cy.addBranchChoiceExtension();
        cy.addBranchChoiceExtension('other');
        cy.closeStepConfigurationTab();

        // CHECK test setup
        cy.isomorphicGet('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.isomorphicGet('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-slot');

        cy.deleteBranch(3);

        // CHECK that the first branch was deleted and canvas is rerendered
        cy.isomorphicGet('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.isomorphicGet('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-log');

        // CHECK after Sync your code button click
        cy.isomorphicGet('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.isomorphicGet('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-log');
    });

    it('User appends a step in a nested branch from the canvas (last in the branch)', () => {
        cy.openStepConfigurationTab('choice', true, 1);
        cy.addBranchChoiceExtension();
        cy.addBranchChoiceExtension('other');
        cy.closeStepConfigurationTab();
        cy.replaceEmptyStepMiniCatalog('amqp', 0);

        // CHECK test setup
        cy.isomorphicGet('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-amqp');
        cy.isomorphicGet('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.appendStepMiniCatalog('amqp', 'activemq');

        // CHECK that there are activemq->amqp in the nested branch and second branch step is slot
        cy.isomorphicGet('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-amqp');
        cy.isomorphicGet('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.isomorphicGet('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-slot');

        // CHECK after Sync your code button click
        cy.isomorphicGet('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-amqp');
        cy.isomorphicGet('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.isomorphicGet('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-slot');
    });

    it('User prepends a step in a nested branch from the canvas (first in the branch)', () => {
        cy.openStepConfigurationTab('choice', true, 1);
        cy.addBranchChoiceExtension();
        cy.addBranchChoiceExtension('other');
        cy.closeStepConfigurationTab();
        cy.replaceEmptyStepMiniCatalog('amqp', 0);

        // CHECK test setup
        cy.isomorphicGet('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-amqp');
        cy.isomorphicGet('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.prependStepMiniCatalog('amqp', 'activemq');

        // CHECK that there are amqp->activemq in the nested branch and second branch step is slot
        cy.isomorphicGet('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.isomorphicGet('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-amqp');
        cy.isomorphicGet('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-slot');

        // CHECK after Sync your code button click
        cy.isomorphicGet('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.isomorphicGet('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-amqp');
        cy.isomorphicGet('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-slot');
    });

    it('User prepends a step to a step whose previous step contains nested branches', () => {
        cy.openStepConfigurationTab('choice', true, 1);
        cy.addBranchChoiceExtension();
        cy.addBranchChoiceExtension('other');
        cy.closeStepConfigurationTab();

        // CHECK test setup
        cy.isomorphicGet('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.isomorphicGet('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-slot');

        cy.prependStepMiniCatalog('log', 'activemq');

        // CHECK that the activemq step was prepended before filter and after all the branches ends
        cy.isomorphicGet('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.isomorphicGet('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.isomorphicGet('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.isomorphicGet('.stepNode').eq(12).should('have.attr', 'data-testid', 'viz-step-log');
        cy.isomorphicGet('[data-testid="viz-step-activemq"]').should('be.visible');

        // CHECK after Sync your code button click
        cy.isomorphicGet('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.isomorphicGet('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.isomorphicGet('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.isomorphicGet('.stepNode').eq(12).should('have.attr', 'data-testid', 'viz-step-log');
        cy.isomorphicGet('[data-testid="viz-step-activemq"]').should('be.visible');
    });
});
