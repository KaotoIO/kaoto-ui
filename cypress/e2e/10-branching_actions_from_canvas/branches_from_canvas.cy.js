describe('Test for Branching actions from the canvas', () => {
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

    it(' User appends a branch from the canvas', () => {
        // Add additional branch with Append button
        cy.get('[data-testid="viz-step-choice"]').first().children('[data-testid="stepNode__appendStep-btn"]').click();
        // Click on the add branch menu item
        cy.get('[data-testid="miniCatalog__branches"]').click();
        // Click on the add branch button to add first branch
        cy.get('[data-testid="addBranch__button"]').click();

        // Zoom out to see the whole scheme, 3x
        cy.get('.react-flow__controls-button.react-flow__controls-zoomout').click().click().click();

        // CHECK that new node with empty slot was created
        cy.get('[data-testid="viz-step-choice"]').should('have.length', 2);
        cy.get('[data-testid="viz-step-slot"]').should('have.length', 1);
        cy.get('.stepNode').eq(12).should('have.attr', 'data-testid', 'viz-step-slot');

        // Blocked due to: https://github.com/KaotoIO/kaoto-ui/issues/1381
        // // wait until the API returns the updated visualization
        // cy.wait('@getViewDefinitions')

        // // Click Sync you code button to verify that generated code is equal to canvas
        // cy.get('[data-testid="sourceCode--applyButton"]').click();

        // // wait until the API returns the updated visualization
        // cy.wait('@getViewDefinitions')

        // // CHECK after Sync your code button click
        // cy.get('[data-testid="viz-step-choice"]').should('have.length', 2);
        // cy.get('[data-testid="viz-step-slot"]').should('have.length', 1);
        // cy.get('.stepNode').eq(12).should('have.attr', 'data-testid', 'viz-step-slot');
    });

    it('User deletes a branch from the canvas', () => {
        // Delete the first branch with digitalocean step
        cy.get('[data-testid="stepNode__deleteBranch-btn"]').eq(0).click();
        // Confirm the deletion
        cy.get('[data-testid="confirmDeleteBranchDialog__btn"]').click();

        // Zoom out to see the whole scheme, 3x
        cy.get('.react-flow__controls-button.react-flow__controls-zoomout').click().click().click();

        // CHECK that the branch was deleted and the node with index 11 contains the viz-step-kamelet:sink
        cy.get('[data-testid="viz-step-digitalocean"]').should('not.exist');
        cy.get('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-kamelet:sink');

        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')

        // Click Sync you code button to verify that generated code is equal to canvas
        cy.get('[data-testid="sourceCode--applyButton"]').click();

        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')

        // CHECK after Sync your code button click
        cy.get('[data-testid="viz-step-digitalocean"]').should('not.exist');
        cy.get('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-kamelet:sink');
    });

    it('User inserts a branch from the canvas', () => {
        // Insert additional choice step to show insert Button
        cy.get('[data-testid="stepNode__insertStep-btn"]').first().click();
        // Open the miniCatalog
        cy.get('[data-testid="miniCatalog"]').should('be.visible');
        // Search activemq step
        cy.get('.pf-c-text-input-group__text-input').type('choice');
        // Select activemq step
        cy.get('[data-testid="miniCatalog__stepItem--choice"]').first().click();

        // CHECK new choice step added
        cy.get('.stepNode').eq(1).should('have.attr', 'data-testid', 'viz-step-choice');

        // Insert branch after additional choice step
        cy.get('[data-testid="stepNode__insertStep-btn"]').eq(1).click();
        // Open the miniCatalog
        cy.get('[data-testid="miniCatalog"]').should('be.visible');
        // Click on the add branch menu item
        cy.get('[data-testid="miniCatalog__branches"]').click();
        // Click on the add branch button to add first branch
        cy.get('[data-testid="addBranch__button"]').click();

        // Zoom out to see the whole scheme, 3x
        cy.get('.react-flow__controls-button.react-flow__controls-zoomout').click().click().click();

        // CHECK that new node with empty slot was created
        cy.get('[data-testid="viz-step-choice"]').should('have.length', 3);
        cy.get('[data-testid="viz-step-slot"]').should('have.length', 1);
        cy.get('.stepNode').eq(2).should('have.attr', 'data-testid', 'viz-step-slot');

        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')

        // Click Sync you code button to verify that generated code is equal to canvas
        cy.get('[data-testid="sourceCode--applyButton"]').click();

        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')

        // CHECK after Sync your code button click
        cy.get('[data-testid="viz-step-choice"]').should('have.length', 3);
        cy.get('[data-testid="viz-step-slot"]').should('have.length', 1);
        cy.get('.stepNode').eq(2).should('have.attr', 'data-testid', 'viz-step-slot');
    });

    it('User appends a step in a branch from the canvas (last in the branch)', () => {
        // Click append button after set-header step
        cy.get('[data-testid="stepNode__appendStep-btn"]').eq(2).click();
        // Open the miniCatalog
        cy.get('[data-testid="miniCatalog"]').should('be.visible');
        // Search activemq step
        cy.get('.pf-c-text-input-group__text-input').type('activemq');
        // Select activemq step
        cy.get('[data-testid="miniCatalog__stepItem--activemq"]').first().click();

        // Zoom out to see the whole scheme, 3x
        cy.get('.react-flow__controls-button.react-flow__controls-zoomout').click().click().click();

        // CHECK that the activemq step was inserted between digitalocean and set-header steps
        cy.get('.stepNode').eq(4).should('have.attr', 'data-testid', 'viz-step-digitalocean');
        cy.get('.stepNode').eq(5).should('have.attr', 'data-testid', 'viz-step-set-header');
        cy.get('.stepNode').eq(6).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.get('[data-testid="viz-step-activemq"]').should('be.visible');

        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')

        // Click Sync you code button to verify that generated code is equal to canvas
        cy.get('[data-testid="sourceCode--applyButton"]').click();

        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')

        // CHECK after Sync your code button click
        cy.get('.stepNode').eq(4).should('have.attr', 'data-testid', 'viz-step-digitalocean');
        cy.get('.stepNode').eq(5).should('have.attr', 'data-testid', 'viz-step-set-header');
        cy.get('.stepNode').eq(6).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.get('[data-testid="viz-step-activemq"]').should('be.visible');
    });

    it('User prepends a step in a branch from the canvas (first in the branch)', () => {
        // Click prepend button before set-header step
        cy.get('[data-testid="stepNode__prependStep-btn"]').eq(2).click();
        // Open the miniCatalog
        cy.get('[data-testid="miniCatalog"]').should('be.visible');
        // Search activemq step
        cy.get('.pf-c-text-input-group__text-input').type('activemq');
        // Select activemq step
        cy.get('[data-testid="miniCatalog__stepItem--activemq"]').first().click();

        // Zoom out to see the whole scheme, 3x
        cy.get('.react-flow__controls-button.react-flow__controls-zoomout').click().click().click();

        // CHECK that the activemq step was inserted between digitalocean and set-header steps
        cy.get('.stepNode').eq(4).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.get('.stepNode').eq(5).should('have.attr', 'data-testid', 'viz-step-digitalocean');
        cy.get('.stepNode').eq(6).should('have.attr', 'data-testid', 'viz-step-set-header');
        cy.get('[data-testid="viz-step-activemq"]').should('be.visible');

        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')

        // Click Sync you code button to verify that generated code is equal to canvas
        cy.get('[data-testid="sourceCode--applyButton"]').click();

        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')

        // CHECK after Sync your code button click
        cy.get('.stepNode').eq(4).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.get('.stepNode').eq(5).should('have.attr', 'data-testid', 'viz-step-digitalocean');
        cy.get('.stepNode').eq(6).should('have.attr', 'data-testid', 'viz-step-set-header');
        cy.get('[data-testid="viz-step-activemq"]').should('be.visible');
    });

    it('User prepends a step to a step whose previous step contains branches', () => {
        // Click prepend button before filter step
        cy.get('[data-testid="stepNode__prependStep-btn"]').last().click();
        // Open the miniCatalog
        cy.get('[data-testid="miniCatalog"]').should('be.visible');
        // Search activemq step
        cy.get('.pf-c-text-input-group__text-input').type('activemq');
        // Select activemq step
        cy.get('[data-testid="miniCatalog__stepItem--activemq"]').first().click();

        // Zoom out to see the whole scheme, 3x
        cy.get('.react-flow__controls-button.react-flow__controls-zoomout').click().click().click();

        // CHECK that the activemq step was prepended before filter and after all the branches ends
        cy.get('.stepNode').eq(5).should('have.attr', 'data-testid', 'viz-step-set-header');
        cy.get('.stepNode').eq(7).should('have.attr', 'data-testid', 'viz-step-marshal');
        cy.get('.stepNode').eq(9).should('have.attr', 'data-testid', 'viz-step-log');
        cy.get('.stepNode').eq(11).should('have.attr', 'data-testid', 'viz-step-aggregate');
        cy.get('.stepNode').eq(12).should('have.attr', 'data-testid', 'viz-step-activemq');
        cy.get('.stepNode').eq(13).should('have.attr', 'data-testid', 'viz-step-filter');
        cy.get('[data-testid="viz-step-activemq"]').should('be.visible');

        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')

        // Click Sync you code button to verify that generated code is equal to canvas
        cy.get('[data-testid="sourceCode--applyButton"]').click();

        // wait until the API returns the updated visualization
        cy.wait('@getViewDefinitions')

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
