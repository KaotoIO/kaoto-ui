describe('Test for Branching actions from the canvas', () => {
    beforeEach(() => {
        cy.intercept('/v1/deployments*').as('getDeployments');
        cy.intercept('/v1/integrations/dsls').as('getDSLs');
        cy.intercept('/v1/view-definitions').as('getViewDefinitions');
        cy.intercept('/v2/integrations*').as('getIntegration');

        cy.openHomePage();
        cy.uploadFixture('EipAction.yaml');

        cy.zoomOutXTimes(3)
    });

    it(' User appends a branch from the canvas', () => {
        // Blocked due to:
        //      https://github.com/KaotoIO/kaoto-ui/issues/1381
        //      https://github.com/KaotoIO/kaoto-ui/issues/1473
        // cy.appendBranch(0);

        // Temporary Blocker check
        cy.get('[data-testid="viz-step-choice"]').eq(0).children('[data-testid="stepNode__appendStep-btn"]').should('be.disabled');

        // Temporary solution with Choice extension
        cy.openStepConfigurationTab('choice', true, 0);
        cy.addBranchChoiceExtension();
        cy.closeStepConfigurationTab();

        // CHECK that new node with empty slot was created
        cy.get('[data-testid="viz-step-choice"]').should('have.length', 2);
        cy.get('[data-testid="viz-step-slot"]').should('have.length', 1);
        cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-slot');

        cy.syncUpCodeChanges()

        // CHECK after Sync your code button click
        cy.get('[data-testid="viz-step-choice"]').should('have.length', 2);
        cy.get('[data-testid="viz-step-slot"]').should('have.length', 1);
        cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-slot');
    });

    it('User deletes a branch from the canvas', () => {
        cy.deleteBranch(1);

        // CHECK that the branch was deleted and the node with index 11 contains the viz-step-kamelet:sink
        cy.get('[data-testid="viz-step-marshal"]').should('not.exist');
        cy.get('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-kamelet:sink');
        cy.get('.code-editor').should('not.contain.text', '{{?bar}}')

        cy.syncUpCodeChanges()

        // CHECK after Sync your code button click
        cy.get('[data-testid="viz-step-marshal"]').should('not.exist');
        cy.get('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-kamelet:sink');
        cy.get('.code-editor').should('not.contain.text', '{{?bar}}')
    });

    it('User inserts a branch from the canvas', () => {
        cy.insertStepMiniCatalog('choice', 0);

        // CHECK new choice step added
        cy.get('.stepNode').eq(1).should('have.attr', 'data-testid', 'viz-step-choice');
        // Blocked due to:
        //      https://github.com/KaotoIO/kaoto-ui/issues/1381
        //      https://github.com/KaotoIO/kaoto-ui/issues/1473
        // cy.insertBranch(1);

        // // CHECK that new node with empty slot was created
        // cy.get('[data-testid="viz-step-choice"]').should('have.length', 3);
        // cy.get('[data-testid="viz-step-slot"]').should('have.length', 1);
        // cy.get('.stepNode').eq(2).should('have.attr', 'data-testid', 'viz-step-slot');

        // cy.syncUpCodeChanges()

        // // CHECK after Sync your code button click
        // cy.get('[data-testid="viz-step-choice"]').should('have.length', 3);
        // cy.get('[data-testid="viz-step-slot"]').should('have.length', 1);
        // cy.get('.stepNode').eq(2).should('have.attr', 'data-testid', 'viz-step-slot');

        // Temporary Blocker check
        cy.get('[data-testid="stepNode__insertStep-btn"]').eq(1).click();
        cy.get('[data-testid="miniCatalog__branches"]').should('have.attr', 'aria-disabled', 'true')
    });

    it('User appends a step in a branch from the canvas (last in the branch)', () => {
        cy.appendStepMiniCatalog('set-header', 'activemq');

        // CHECK that the activemq step was inserted between digitalocean and set-header steps
        cy.get('.stepNode').eq(4).should('have.attr', 'data-testid', 'viz-step-digitalocean');
        cy.get('.stepNode').eq(5).should('have.attr', 'data-testid', 'viz-step-set-header');
        cy.get('.stepNode').eq(6).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.get('[data-testid="viz-step-activemq"]').should('be.visible');

        cy.syncUpCodeChanges()

        // CHECK after Sync your code button click
        cy.get('.stepNode').eq(4).should('have.attr', 'data-testid', 'viz-step-digitalocean');
        cy.get('.stepNode').eq(5).should('have.attr', 'data-testid', 'viz-step-set-header');
        cy.get('.stepNode').eq(6).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.get('[data-testid="viz-step-activemq"]').should('be.visible');
    });

    it('User prepends a step in a branch from the canvas (first in the branch)', () => {
        cy.prependStepMiniCatalog('digitalocean', 'activemq');

        // CHECK that the activemq step was inserted between digitalocean and set-header steps
        cy.get('.stepNode').eq(4).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.get('.stepNode').eq(5).should('have.attr', 'data-testid', 'viz-step-digitalocean');
        cy.get('.stepNode').eq(6).should('have.attr', 'data-testid', 'viz-step-set-header');
        cy.get('[data-testid="viz-step-activemq"]').should('be.visible');

        cy.syncUpCodeChanges()

        // CHECK after Sync your code button click
        cy.get('.stepNode').eq(4).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.get('.stepNode').eq(5).should('have.attr', 'data-testid', 'viz-step-digitalocean');
        cy.get('.stepNode').eq(6).should('have.attr', 'data-testid', 'viz-step-set-header');
        cy.get('[data-testid="viz-step-activemq"]').should('be.visible');
    });

    it('User prepends a step to a step whose previous step contains branches', () => {
        cy.prependStepMiniCatalog('filter', 'activemq');

        // CHECK that the activemq step was prepended before filter and after all the branches ends
        cy.get('.stepNode').eq(5).should('have.attr', 'data-testid', 'viz-step-set-header');
        cy.get('.stepNode').eq(7).should('have.attr', 'data-testid', 'viz-step-marshal');
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-log');
        cy.get('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-aggregate');
        cy.get('.stepNode').eq(12).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.get('.stepNode').eq(13).should('have.attr', 'data-testid', 'viz-step-filter');
        cy.get('[data-testid="viz-step-activemq"]').should('be.visible');

        cy.syncUpCodeChanges()

        // CHECK after Sync your code button click
        cy.get('.stepNode').eq(5).should('have.attr', 'data-testid', 'viz-step-set-header');
        cy.get('.stepNode').eq(7).should('have.attr', 'data-testid', 'viz-step-marshal');
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-log');
        cy.get('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-aggregate');
        cy.get('.stepNode').eq(12).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.get('.stepNode').eq(13).should('have.attr', 'data-testid', 'viz-step-filter');
        cy.get('[data-testid="viz-step-activemq"]').should('be.visible');
    });
});
