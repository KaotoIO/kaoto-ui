describe('Test for Nested Branching actions from the canvas', () => {
    beforeEach(() => {
        let url = Cypress.config().baseUrl;
        cy.visit(url);

        cy.intercept('/v1/view-definitions').as('getViewDefinitions');

        // Upload the initial state (TimerLogCamelRoute.yaml)
        cy.get('[data-testid="toolbar-show-code-btn"]').click();
        cy.get('[data-testid="sourceCode--clearButton"]').should('be.visible').click({ force: true });
        cy.get('.pf-c-code-editor__main').should('be.visible');
        cy.get('.pf-c-code-editor__main > input').attachFile('EipAction.yaml');
        cy.get('[data-testid="sourceCode--applyButton"]').click();

        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')
    });

    it('User inserts/appends a nested branch from the canvas', () => {
        // Add first branch with insert button
        cy.get('[data-testid="stepNode__insertStep-btn"]').eq(3).click();
        // Click on the add branch menu item
        cy.get('[data-testid="miniCatalog__branches"]').click();
        // Click on the add branch button to add first branch
        cy.get('[data-testid="addBranch__button"]').click();
        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')
        // Click on empty slot
        cy.get('[data-testid="viz-step-slot"]').click();
        // Open the miniCatalog
        cy.get('[data-testid="miniCatalog"]').should('be.visible');
        // search activemq step
        cy.get('.pf-c-text-input-group__text-input').type('activemq');
        // select activemq step
        cy.get('[data-testid="miniCatalog__stepItem--activemq"]').first().click();
        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')

        // Add second branch with append button
        cy.get('[data-testid="viz-step-choice"]').last().children('[data-testid="stepNode__appendStep-btn"]').click();
        // Click on the add branch menu item
        cy.get('[data-testid="miniCatalog__branches"]').click();
        // Click on the add branch button to add second branch
        cy.get('[data-testid="addBranch__button"]').click();
        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')
        // Click on empty slot
        cy.get('[data-testid="viz-step-slot"]').click();
        // Open the miniCatalog
        cy.get('[data-testid="miniCatalog"]').should('be.visible');
        // search amqp step
        cy.get('.pf-c-text-input-group__text-input').type('amqp');
        // select amqp step
        cy.get('[data-testid="miniCatalog__stepItem--amqp"]').first().click();
        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')

        // Zoom out to see the whole scheme
        cy.get('.react-flow__controls-button.react-flow__controls-zoomout').click().click().click();

        // CHECK that two new nodes were created with indexes 9 and 10 and contain viz-step-slot
        cy.get('[data-testid="viz-step-activemq"]').should('be.visible');
        cy.get('[data-testid="viz-step-amqp"]').should('be.visible');
        cy.get('[data-testid="viz-step-choice"]').should('have.length', 2);
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-amqp');

        // Blocked due to: https://github.com/KaotoIO/kaoto-ui/issues/1381
        // // Click Sync you code button to verify that generated code is equal to canvas
        // cy.get('[data-testid="sourceCode--applyButton"]').click();
        // // wait until the API returns the updated visualization
        // cy.wait('@getViewDefinitions')

        // // CHECK after Sync your code button click
        // cy.get('[data-testid="viz-step-activemq"]').should('be.visible');
        // cy.get('[data-testid="viz-step-amqp"]').should('be.visible');
        // cy.get('[data-testid="viz-step-choice"]').should('have.length', 2);
        // cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-activemq');
        // cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-amqp');
    })

    it('User deletes a branch from the canvas', () => {
        // Add first branch with insert button
        cy.get('[data-testid="stepNode__insertStep-btn"]').eq(3).click();
        // Click on the add branch menu item
        cy.get('[data-testid="miniCatalog__branches"]').click();
        // Click on the add branch button to add first branch
        cy.get('[data-testid="addBranch__button"]').click();
        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')
        // Add second branch with append button
        cy.get('[data-testid="viz-step-choice"]').last().children('[data-testid="stepNode__appendStep-btn"]').click();
        // Click on the add branch menu item
        cy.get('[data-testid="miniCatalog__branches"]').click();
        // Click on the add branch button to add second branch
        cy.get('[data-testid="addBranch__button"]').click();
        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')

        // Zoom out to see the whole scheme
        cy.get('.react-flow__controls-button.react-flow__controls-zoomout').click().click().click();

        // CHECK test setup
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-slot');

        // Delete the first branch step with node index 9
        cy.get('[data-testid="stepNode__deleteBranch-btn"]').eq(3).click();
        // Confirm the deletion
        cy.get('[data-testid="confirmDeleteBranchDialog__btn"]').click();
        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')

        // CHECK that the first branch was deleted and canvas is rerendered
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-log');

        // Click Sync you code button to verify that generated code is equal to canvas
        cy.get('[data-testid="sourceCode--applyButton"]').click();
        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')

        // CHECK after Sync your code button click
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-log');
    });

    it('User appends a step in a nested branch from the canvas (last in the branch)', () => {
        // Add first branch with insert button
        cy.get('[data-testid="stepNode__insertStep-btn"]').eq(3).click();
        // Click on the add branch menu item
        cy.get('[data-testid="miniCatalog__branches"]').click();
        // Click on the add branch button to add first branch
        cy.get('[data-testid="addBranch__button"]').click();
        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')
        // Click on empty slot
        cy.get('[data-testid="viz-step-slot"]').click();
        // Open the miniCatalog
        cy.get('[data-testid="miniCatalog"]').should('be.visible');
        // search activemq step
        cy.get('.pf-c-text-input-group__text-input').type('activemq');
        // select activemq step
        cy.get('[data-testid="miniCatalog__stepItem--activemq"]').first().click();
        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')
        // Add second branch with append button
        cy.get('[data-testid="viz-step-choice"]').last().children('[data-testid="stepNode__appendStep-btn"]').click();
        // Click on the add branch menu item
        cy.get('[data-testid="miniCatalog__branches"]').click();
        // Click on the add branch button to add second branch
        cy.get('[data-testid="addBranch__button"]').click();
        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')

        // Zoom out to see the whole scheme
        cy.get('.react-flow__controls-button.react-flow__controls-zoomout').click().click().click();

        // CHECK test setup
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-slot');

        // Click append button after set-header step
        cy.get('[data-testid="stepNode__appendStep-btn"]').eq(5).click();
        // Open the miniCatalog
        cy.get('[data-testid="miniCatalog"]').should('be.visible');
        // Search amqp step
        cy.get('.pf-c-text-input-group__text-input').type('amqp');
        // Select amqp step
        cy.get('[data-testid="miniCatalog__stepItem--amqp"]').first().click();
        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')

        // Zoom out to see the whole scheme, 3x
        cy.get('.react-flow__controls-button.react-flow__controls-zoomout').click().click().click();

        // CHECK that there are activemq->amqp in the nested branch and second branch step is slot
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-amqp');
        cy.get('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-slot');

        // Blocked due to: https://github.com/KaotoIO/kaoto-ui/issues/1381
        // // Click Sync you code button to verify that generated code is equal to canvas
        // cy.get('[data-testid="sourceCode--applyButton"]').click();
        // // wait until the API returns the updated visualization
        // cy.wait('@getViewDefinitions')

        // // CHECK after Sync your code button click
        // cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-activemq');
        // cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-amqp');
        // cy.get('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-slot');
    });

    it('User prepends a step in a nested branch from the canvas (first in the branch)', () => {
        // Add first branch with insert button
        cy.get('[data-testid="stepNode__insertStep-btn"]').eq(3).click();
        // Click on the add branch menu item
        cy.get('[data-testid="miniCatalog__branches"]').click();
        // Click on the add branch button to add first branch
        cy.get('[data-testid="addBranch__button"]').click();
        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')
        // Click on empty slot
        cy.get('[data-testid="viz-step-slot"]').click();
        // Open the miniCatalog
        cy.get('[data-testid="miniCatalog"]').should('be.visible');
        // search activemq step
        cy.get('.pf-c-text-input-group__text-input').type('activemq');
        // select activemq step
        cy.get('[data-testid="miniCatalog__stepItem--activemq"]').first().click();
        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')
        // Add second branch with append button
        cy.get('[data-testid="viz-step-choice"]').last().children('[data-testid="stepNode__appendStep-btn"]').click();
        // Click on the add branch menu item
        cy.get('[data-testid="miniCatalog__branches"]').click();
        // Click on the add branch button to add second branch
        cy.get('[data-testid="addBranch__button"]').click();
        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')

        // Zoom out to see the whole scheme
        cy.get('.react-flow__controls-button.react-flow__controls-zoomout').click().click().click();

        // CHECK test setup
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-slot');

        // Click append button after set-header step
        cy.get('[data-testid="stepNode__prependStep-btn"]').eq(5).click();
        // Open the miniCatalog
        cy.get('[data-testid="miniCatalog"]').should('be.visible');
        // Search amqp step
        cy.get('.pf-c-text-input-group__text-input').type('amqp');
        // Select amqp step
        cy.get('[data-testid="miniCatalog__stepItem--amqp"]').first().click();
        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')

        // Zoom out to see the whole scheme, 3x
        cy.get('.react-flow__controls-button.react-flow__controls-zoomout').click().click().click();

        // CHECK that there are amqp->activemq in the nested branch and second branch step is slot
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-amqp');
        cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.get('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-slot');

        // Blocked due to: https://github.com/KaotoIO/kaoto-ui/issues/1381
        // // Click Sync you code button to verify that generated code is equal to canvas
        // cy.get('[data-testid="sourceCode--applyButton"]').click();
        // // wait until the API returns the updated visualization
        // cy.wait('@getViewDefinitions')

        // // CHECK after Sync your code button click
        // cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-amqp');
        // cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-activemq');
        // cy.get('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-slot');
    });

    it('User prepends a step to a step whose previous step contains nested branches', () => {
        // Add first branch with insert button
        cy.get('[data-testid="stepNode__insertStep-btn"]').eq(3).click();
        // Click on the add branch menu item
        cy.get('[data-testid="miniCatalog__branches"]').click();
        // Click on the add branch button to add first branch
        cy.get('[data-testid="addBranch__button"]').click();
        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')
        // Add second branch with append button
        cy.get('[data-testid="viz-step-choice"]').last().children('[data-testid="stepNode__appendStep-btn"]').click();
        // Click on the add branch menu item
        cy.get('[data-testid="miniCatalog__branches"]').click();
        // Click on the add branch button to add second branch
        cy.get('[data-testid="addBranch__button"]').click();
        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')

        // Click prepend button before log step
        cy.get('[data-testid="stepNode__prependStep-btn"]').eq(5).click();
        // Open the miniCatalog
        cy.get('[data-testid="miniCatalog"]').should('be.visible');
        // Search activemq step
        cy.get('.pf-c-text-input-group__text-input').type('activemq');
        // Select activemq step
        cy.get('[data-testid="miniCatalog__stepItem--activemq"]').first().click();
        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')

        // Zoom out to see the whole scheme, 3x
        cy.get('.react-flow__controls-button.react-flow__controls-zoomout').click().click().click();

        // CHECK that the activemq step was prepended before filter and after all the branches ends
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.get('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.get('.stepNode').eq(12).should('have.attr', 'data-testid', 'viz-step-log');
        cy.get('[data-testid="viz-step-activemq"]').should('be.visible');

        // Blocked due to: https://github.com/KaotoIO/kaoto-ui/issues/1381
        // // Click Sync you code button to verify that generated code is equal to canvas
        // cy.get('[data-testid="sourceCode--applyButton"]').click();
        // // wait until the API returns the updated visualization
        // cy.wait('@getViewDefinitions')

        // // CHECK after Sync your code button click
        // cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-slot');
        // cy.get('.stepNode').eq(10).should('have.attr', 'data-testid', 'viz-step-slot');
        // cy.get('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-activemq');
        // cy.get('.stepNode').eq(12).should('have.attr', 'data-testid', 'viz-step-log');
        // cy.get('[data-testid="viz-step-activemq"]').should('be.visible');
    });
});
