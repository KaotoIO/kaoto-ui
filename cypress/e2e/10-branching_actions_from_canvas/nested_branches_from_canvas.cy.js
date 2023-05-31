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
        // Blocked due to:
        //      https://github.com/KaotoIO/kaoto-ui/issues/1381
        //      https://github.com/KaotoIO/kaoto-ui/issues/1473
        // cy.insertBranch(3);
        // cy.replaceEmptyStepMiniCatalog('activemq');
        // cy.appendBranch(1);
        // cy.replaceEmptyStepMiniCatalog('amqp');

        // CHECK that two new nodes were created with indexes 9 and 10 and contain viz-step-slot
        // cy.get('[data-testid="viz-step-activemq"]').should('be.visible');
        // cy.get('[data-testid="viz-step-amqp"]').should('be.visible');
        // cy.get('[data-testid="viz-step-choice"]').should('have.length', 2);
        // cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-activemq');
        // cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-amqp');

        // cy.syncUpCodeChanges()

        // // CHECK after Sync your code button click
        // cy.get('[data-testid="viz-step-activemq"]').should('be.visible');
        // cy.get('[data-testid="viz-step-amqp"]').should('be.visible');
        // cy.get('[data-testid="viz-step-choice"]').should('have.length', 2);
        // cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-activemq');
        // cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-amqp');

        // Temporary blocker check
        cy.get('[data-testid="stepNode__insertStep-btn"]').eq(3).click();
        cy.get('[data-testid="miniCatalog__branches"]').should('have.attr', 'aria-disabled', 'true')
        cy.get('.pf-c-button.pf-m-plain').click();
        cy.openStepConfigurationTab('choice', true, 1);
        cy.addBranchChoiceExtension();
        cy.closeStepConfigurationTab();
        cy.get('[data-testid="viz-step-choice"]').eq(1).children('[data-testid="stepNode__appendStep-btn"]').should('be.disabled');
    })

    it('User deletes a branch from the canvas', () => {
        // Blocked due to:
        //      https://github.com/KaotoIO/kaoto-ui/issues/1381
        //      https://github.com/KaotoIO/kaoto-ui/issues/1473
        // cy.insertBranch(3);
        // cy.appendBranch(1);

        // Temporary workaround:
        cy.openStepConfigurationTab('choice', true, 1);
        cy.addBranchChoiceExtension();
        cy.addBranchChoiceExtension('other');
        cy.closeStepConfigurationTab();

        // CHECK test setup
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-slot');

        cy.deleteBranch(3);

        // CHECK that the first branch was deleted and canvas is rerendered
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-log');

        cy.waitAndsyncUpCodeChanges()

        // CHECK after Sync your code button click
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-log');
    });

    it('User appends a step in a nested branch from the canvas (last in the branch)', () => {
        // Blocked due to:
        //      https://github.com/KaotoIO/kaoto-ui/issues/1381
        //      https://github.com/KaotoIO/kaoto-ui/issues/1473
        // cy.insertBranch(3);
        // cy.replaceEmptyStepMiniCatalog('amqp');
        // cy.appendBranch(1);

        // Temporary workaround:
        cy.openStepConfigurationTab('choice', true, 1);
        cy.addBranchChoiceExtension();
        cy.addBranchChoiceExtension('other');
        cy.closeStepConfigurationTab();
        cy.replaceEmptyStepMiniCatalog('amqp', 0);

        // CHECK test setup
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-amqp');
        cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.appendStepMiniCatalog('amqp', 'activemq');

        // CHECK that there are activemq->amqp in the nested branch and second branch step is slot
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-amqp');
        cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.get('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-slot');

        cy.waitAndsyncUpCodeChanges()

        // CHECK after Sync your code button click
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-amqp');
        cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.get('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-slot');
    });

    it('User prepends a step in a nested branch from the canvas (first in the branch)', () => {
        // Blocked due to:
        //      https://github.com/KaotoIO/kaoto-ui/issues/1381
        //      https://github.com/KaotoIO/kaoto-ui/issues/1473
        // cy.insertBranch(3);
        // cy.replaceEmptyStepMiniCatalog('amqp');
        // cy.appendBranch(1);

        // Temporary workaround:
        cy.openStepConfigurationTab('choice', true, 1);
        cy.addBranchChoiceExtension();
        cy.addBranchChoiceExtension('other');
        cy.closeStepConfigurationTab();
        cy.replaceEmptyStepMiniCatalog('amqp', 0);

        // CHECK test setup
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-amqp');
        cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-slot');        
        cy.prependStepMiniCatalog('amqp', 'activemq');

        // CHECK that there are amqp->activemq in the nested branch and second branch step is slot
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-amqp');
        cy.get('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-slot');

        cy.waitAndsyncUpCodeChanges()

        // CHECK after Sync your code button click
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-amqp');
        cy.get('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-slot');
    });

    it('User prepends a step to a step whose previous step contains nested branches', () => {
        // Blocked due to:
        //      https://github.com/KaotoIO/kaoto-ui/issues/1381
        //      https://github.com/KaotoIO/kaoto-ui/issues/1473
        // cy.insertBranch(3);
        // cy.appendBranch(1);

        // Temporary workaround:
        cy.openStepConfigurationTab('choice', true, 1);
        cy.addBranchChoiceExtension();
        cy.addBranchChoiceExtension('other');
        cy.closeStepConfigurationTab();

        // CHECK test setup
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.prependStepMiniCatalog('log', 'activemq');

        // CHECK that the activemq step was prepended before filter and after all the branches ends
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.get('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.get('.stepNode').eq(12).should('have.attr', 'data-testid', 'viz-step-log');
        cy.get('[data-testid="viz-step-activemq"]').should('be.visible');

        cy.waitAndsyncUpCodeChanges()

        // CHECK after Sync your code button click
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.get('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.get('.stepNode').eq(12).should('have.attr', 'data-testid', 'viz-step-log');
        cy.get('[data-testid="viz-step-activemq"]').should('be.visible');
    });
});
