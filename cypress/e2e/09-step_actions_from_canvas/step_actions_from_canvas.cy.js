describe('Test for Step actions from the canvas', () => {
    beforeEach(() => {
        let url = Cypress.config().baseUrl;
        cy.visit(url);

        cy.intercept('/v1/integrations/dsls').as('getDSLs');
        cy.intercept('/v1/view-definitions').as('getViewDefinitions');
        cy.intercept('/v1/integrations*').as('getIntegration');

        // Upload the initial state (KafkaSourceSink.yaml)
        cy.get('[data-testid="toolbar-show-code-btn"]').click();
        cy.get('[data-testid="sourceCode--clearButton"]').should('be.visible').click({ force: true });
        cy.get('.pf-c-code-editor__main').should('be.visible');
        cy.get('.pf-c-code-editor__main > input').attachFile('TimerLogCamelRoute.yaml');
        cy.get('[data-testid="sourceCode--applyButton"]').click();

        // wait until the API returns the updated visualization
        cy.wait('@getIntegration');
        cy.wait('@getDSLs');
        cy.wait('@getViewDefinitions');
    });

    it(' User inserts a step between two steps (+ button in between two nodes)', () => {
        // Click insert button between two steps
        cy.get('[data-testid="stepNode__insertStep-btn"]').click();
        // Open the miniCatalog
        cy.get('[data-testid="miniCatalog"]').should('be.visible');
        // search aggregate step
        cy.get('.pf-c-text-input-group__text-input').type('aggregate');
        // select aggregate step
        cy.get('[data-testid="miniCatalog__stepItem--aggregate"]').first().click();

        // CHECK that the step is added between two steps
        cy.get('[data-testid="viz-step-aggregate"]').should('be.visible');
        // CHECK that stepNodes are in the correct order
        cy.get('.stepNode').eq(0).should('have.attr', 'data-testid', 'viz-step-timer');
        cy.get('.stepNode').eq(1).should('have.attr', 'data-testid', 'viz-step-aggregate');
        cy.get('.stepNode').eq(2).should('have.attr', 'data-testid', 'viz-step-log');
        // CHECK that stepNodes contains of the three steps
        cy.get('.stepNode').should('have.length', 3);
    });

    it('In an integration with at least two steps, user deletes the first step, showing a placeholder step in its place (start-end)', () => {
        // Hover mouse over the first step
        cy.get('[data-testid="viz-step-timer"]').trigger('mouseover');
        // Click delete button of the first step
        cy.get('[data-testid="viz-step-timer"]').children('[data-testid="configurationTab__deleteBtn"]').click({ force: true });

        // CHECK that the step is deleted
        cy.get('[data-testid="viz-step-timer"]').should('not.exist');
        // CHECK that stepNodes are in the correct order
        cy.get('.stepNode').eq(0).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.get('.stepNode').eq(1).should('have.attr', 'data-testid', 'viz-step-log');
        // CHECK that stepNodes contains of the two steps
        cy.get('.stepNode').should('have.length', 2);
    });

    it('In an integration with at least two steps, user deletes the first step, showing a placeholder step in its place (start-action)', () => {
        // Click insert button between two steps
        cy.get('[data-testid="stepNode__insertStep-btn"]').click();
        // Open the miniCatalog
        cy.get('[data-testid="miniCatalog"]').should('be.visible');
        // search arangodb step
        cy.get('.pf-c-text-input-group__text-input').type('arangodb');
        // select arangodb step
        cy.get('[data-testid="miniCatalog__stepItem--arangodb"]').first().click();
        // Hover mouse over the first step
        cy.get('[data-testid="viz-step-timer"]').trigger('mouseover');
        // Click delete button of the first step
        cy.get('[data-testid="viz-step-timer"]').children('[data-testid="configurationTab__deleteBtn"]').click({ force: true });

        // CHECK that the step is deleted
        cy.get('[data-testid="viz-step-timer"]').should('not.exist');
        // CHECK that stepNodes are in the correct order
        cy.get('.stepNode').eq(0).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.get('.stepNode').eq(1).should('have.attr', 'data-testid', 'viz-step-arangodb');
        cy.get('.stepNode').eq(2).should('have.attr', 'data-testid', 'viz-step-log');
        // CHECK that stepNodes contains of the two steps
        cy.get('.stepNode').should('have.length', 3);
    });

    it('In an integration with at least two steps, user deletes the first step, showing a placeholder step in its place (start-action_EIP)', () => {
        // Click insert button between two steps
        cy.get('[data-testid="stepNode__insertStep-btn"]').click();
        // Open the miniCatalog
        cy.get('[data-testid="miniCatalog"]').should('be.visible');
        // search aggregate step
        cy.get('.pf-c-text-input-group__text-input').type('aggregate');
        // select aggregate step
        cy.get('[data-testid="miniCatalog__stepItem--aggregate"]').first().click();
        // Hover mouse over the first step
        cy.get('[data-testid="viz-step-timer"]').trigger('mouseover');
        // Click delete button of the first step
        cy.get('[data-testid="viz-step-timer"]').children('[data-testid="configurationTab__deleteBtn"]').click({ force: true });

        // CHECK that the step is deleted
        cy.get('[data-testid="viz-step-timer"]').should('not.exist');
        // CHECK that stepNodes are in the correct order
        cy.get('.stepNode').eq(0).should('have.attr', 'data-testid', 'viz-step-slot');
        cy.get('.stepNode').eq(1).should('have.attr', 'data-testid', 'viz-step-aggregate');
        cy.get('.stepNode').eq(2).should('have.attr', 'data-testid', 'viz-step-log');
        // CHECK that stepNodes contains of the three steps
        cy.get('.stepNode').should('have.length', 3);
    });

    it('User appends a step(+ button to the right of the node)', () => {
        // Delete the log step
        cy.get('[data-testid="viz-step-log"]').trigger('mouseover');
        cy.get('[data-testid="viz-step-log"]').children('[data-testid="configurationTab__deleteBtn"]').click({ force: true });

        // Append second step
        // Click append button on the first step
        cy.get('[data-testid="viz-step-timer"]').children('[data-testid="stepNode__appendStep-btn"]').click();
        // Open the miniCatalog
        cy.get('[data-testid="miniCatalog"]').should('be.visible');
        // search aggregate step
        cy.get('.pf-c-text-input-group__text-input').type('aggregate');
        // select aggregate step
        cy.get('[data-testid="miniCatalog__stepItem--aggregate"]').first().click();

        // Append third step
        // Click append button on the second step
        cy.get('[data-testid="viz-step-aggregate"]').children('[data-testid="stepNode__appendStep-btn"]').click();
        // Open the miniCatalog
        cy.get('[data-testid="miniCatalog"]').should('be.visible');
        // Select End steps
        cy.get('[data-testid="miniCatalog__step-end"]').click();
        // search log step
        cy.get('.pf-c-text-input-group__text-input').type('log');
        // select log step
        cy.get('[data-testid="miniCatalog__stepItem--log"]').first().click();

        // CHECK that stepNodes are in the correct order
        cy.get('.stepNode').eq(0).should('have.attr', 'data-testid', 'viz-step-timer');
        cy.get('.stepNode').eq(1).should('have.attr', 'data-testid', 'viz-step-aggregate');
        cy.get('.stepNode').eq(2).should('have.attr', 'data-testid', 'viz-step-log');
        // CHECK that stepNodes contains of the three steps
        cy.get('.stepNode').should('have.length', 3);
    });

    it('Step Detail - User configures a normal step, which updates the YAML)', () => {
        // Click on the log step
        cy.get('[data-testid="viz-step-log"]').click();
        // Click on the configuration tab
        cy.get('[data-testid="configurationTab"]').click();

        // Enable checkbox "Log mask"
        cy.get('[name="logMask"]').click();
        // CHECK that the YAML is updated logMask: 'true'
        // Get Span line with the text "logMask" and search for the text "true" and "false"
        cy.get('.code-editor').contains('logMask').parent()
            .should('contain.text', 'logMask')
            .and('contain.text', "'true'")
            .and('not.contain.text', "'false'");

        // Disable checkbox "Log mask"
        cy.get('[name="logMask"]').click();
        // CHECK that the YAML is updated logMask: 'false'
        // Get Span line with the text "logMask" and search for the text "true" and "false"
        cy.get('.code-editor').contains('logMask').parent()
            .should('contain.text', 'logMask')
            .and('contain.text', "'false'")
            .and('not.contain.text', "'true'");

        // Change the value of the "groupDelay" integer field
        cy.get('[name="groupDelay"]').clear().type('15000');
        // Get Span line with the text "groupDelay" and search for the text "15000"
        cy.get('.code-editor').contains('groupDelay').parent()
            .should('contain.text', 'groupDelay')
            .and('contain.text', "15000");
    });

    describe('Test for Step extensions', () => {
        it('User sees a step extension(http)', () => {
            // Click insert button between two steps
            cy.get('[data-testid="stepNode__insertStep-btn"]').click();
            // Open the miniCatalog
            cy.get('[data-testid="miniCatalog"]').should('be.visible');
            // search transform step
            cy.get('.pf-c-text-input-group__text-input').type('transform');
            // select transform step
            cy.get('[data-testid="miniCatalog__stepItem--transform"]').first().click();
            // Click on the transform step
            cy.get('[data-testid="viz-step-transform"]').click();
            // Click on the configuration tab
            cy.get('[data-testid="configurationTab"]').click();

            // CHECK that choice extension elements are visible
            cy.get('[data-testid="expression-syntax-select"]').should('be.visible');
            cy.get('[data-testid="expression-string-input"]').should('be.visible');
            cy.get('[data-testid="transform-apply-button"]').should('be.visible');
        });

        it('User configures a step from a step extension (set-header)', () => {
            // Click insert button between two steps
            cy.get('[data-testid="stepNode__insertStep-btn"]').click();
            // Open the miniCatalog
            cy.get('[data-testid="miniCatalog"]').should('be.visible');
            // search set-header step
            cy.get('.pf-c-text-input-group__text-input').type('set-header');
            // select set-header step
            cy.get('[data-testid="miniCatalog__stepItem--set-header"]').first().click();
            // Click on the set-header step
            cy.get('[data-testid="viz-step-set-header"]').click();
            // Click on the configuration tab
            cy.get('[data-testid="configurationTab"]').click();

            // Fill the step name
            cy.get('[data-testid="set-header-name-input"]').clear().type('test-name');
            // Select jq syntax
            cy.get('[data-testid="expression-syntax-select"]').select('jq');
            // Fill the expression
            cy.get('[data-testid="expression-string-input"]').clear().type('jq-test');
            // Click on the "Apply" button
            cy.get('[data-testid="set-header-apply-button"]').click();

            // CHECK alert message
            cy.get('.pf-c-alert').should('be.visible').and('contain.text', 'Set Header step updated');
            // CHECK that the YAML is updated
            // Get Span line with the text "set-header" and search for the text "test-name"
            cy.get('.code-editor').contains('test-name').parent()
                .should('contain.text', 'name')
                .and('contain.text', "test-name");
            // Get Span line with the text "jq" and search for the text "jq-test"
            cy.get('.code-editor').contains('jq').parent()
                .should('contain.text', 'jq')
                .and('contain.text', "jq-test");
        });

        // TODO: This test is failing due to the issue https://github.com/KaotoIO/step-extension-repository/issues/162
        it.skip('User adds and removes a branch from a step using a step extension', () => {
            // Click insert button between two steps
            cy.get('[data-testid="stepNode__insertStep-btn"]').click();
            // Open the miniCatalog
            cy.get('[data-testid="miniCatalog"]').should('be.visible');
            // search choice step
            cy.get('.pf-c-text-input-group__text-input').type('choice');
            // select choice step
            cy.get('[data-testid="miniCatalog__stepItem--choice"]').first().click();
            // Click on the choice step
            cy.get('[data-testid="viz-step-choice"]').click();
            // Click on the configuration tab
            cy.get('[data-testid="configurationTab"]').click();

            // Click on the "Add when" button, first time
            cy.get('[data-testid="choice-add-when-button"]').click();
            // Click on the "Add when" button, second time
            cy.get('[data-testid="choice-add-when-button"]').click();
            // Click on the "Add otherwise" button
            cy.get('[data-testid="choice-add-otherwise-button"]').click();

            // CHECK alert messages
            cy.get('.pf-c-alert').should('contain.text', 'When: 1 added');
            cy.get('.pf-c-alert').should('contain.text', 'When: 2 added');
            cy.get('.pf-c-alert').should('contain.text', 'Otherwise added');

            // // Close alert messages (multiple true is unstable due to rerendering)
            cy.get('.pf-c-alert__action').eq(0).children('button').click();
            cy.get('.pf-c-alert__action').eq(0).children('button').click();
            cy.get('.pf-c-alert__action').eq(0).children('button').click();

            // Change When: 1 expression type to Jq from list
            cy.get('[data-testid="when-0-predicate-syntax-select"]').select('Jq');
            // Type Jq expression in the first When: 0 expression field
            cy.get('[data-testid="when-0-predicate-string-input"]').clear().type('jq-test');
            // Type Simple expression in the second When: 1 expression field
            cy.get('[data-testid="when-1-predicate-string-input"]').clear().type('simple-test');
            // Click apply button
            cy.get('[data-testid="choice-apply-button"]').click();

            // CHECK that canvas has 3 new empty steps
            cy.get('[data-testid="viz-step-slot"]').should('be.visible').and('have.length', 3);
            // CHECK that canvas has 6 delete branch buttons
            cy.get('[data-testid="stepNode__deleteBranch-btn"]').should('be.visible').and('have.length', 6);

            // Check that the YAML is updated
            cy.get('.code-editor').contains('jq').parent()
                .should('contain.text', 'jq')
                .and('contain.text', 'jq-test')
            cy.get('.code-editor').contains('simple').parent()
                .should('contain.text', 'simple')
                .and('contain.text', 'simple-test')
            cy.get('.code-editor').should('contain.text', 'otherwise')

            // Delete the first When: 0 branch
            cy.get('[data-testid="remove-branch-when-0-button"]').click();
            // Delete the otherwise branch
            cy.get('[data-testid="remove-branch-otherwise-button"]').click();

            // // Close alert messages (multiple true is unstable due to rerendering)
            cy.get('.pf-c-alert__action').eq(0).children('button').click();
            cy.get('.pf-c-alert__action').eq(0).children('button').click();
            // Close Configuration tab
            cy.get('.pf-c-button.pf-m-plain').click();

            // CHECK that canvas has 1 empty step
            cy.get('[data-testid="viz-step-slot"]').should('have.length', 1).and('be.visible');

            // Check that the YAML is updated
            cy.get('.code-editor').should('not.contain.text', 'jq-test');
            cy.get('.code-editor').should('contain.text', 'simple-test');
            cy.get('.code-editor').should('not.contain.text', 'otherwise');
        });
    });
});
