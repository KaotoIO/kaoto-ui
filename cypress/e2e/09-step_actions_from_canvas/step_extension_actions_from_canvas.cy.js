describe('Test for Step extensions', () => {
    beforeEach(() => {
        cy.intercept('/v1/integrations/dsls').as('getDSLs');
        cy.intercept('/v1/view-definitions').as('getViewDefinitions');
        cy.intercept('/v1/integrations*').as('getIntegration');

        cy.openHomePage();
        cy.uploadInitialState('TimerLogCamelRoute.yaml');
    });

    it('User sees a step extension(http)', () => {
        cy.insertStepMiniCatalog('transform');
        cy.openStepConfigurationTab('transform');

        // CHECK that choice extension elements are visible
        cy.get('[data-testid="expression-syntax-select"]').should('be.visible');
        cy.get('[data-testid="expression-string-input"]').should('be.visible');
        cy.get('[data-testid="transform-apply-button"]').should('be.visible');
    });

    it('User configures a step from a step extension (set-header)', () => {
        cy.insertStepMiniCatalog('set-header');
        cy.openStepConfigurationTab('set-header');

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
        cy.checkCodeSpanLine('test-name', "name");
        cy.checkCodeSpanLine('jq', "jq-test");
    });

    // TODO: This test is failing due to the issue https://github.com/KaotoIO/step-extension-repository/issues/162
    it.skip('User adds and removes a branch from a step using a step extension', () => {
        cy.insertStepMiniCatalog('choice');
        cy.openStepConfigurationTab('choice');

        // Click on the "Add when" button, first time
        cy.get('[data-testid="choice-add-when-button"]').click();
        // CHECK alert message
        cy.get('.pf-c-alert').should('contain.text', 'When: 1 added');
        // // Close alert message
        cy.get('.pf-c-alert__action').children('button').click();

        // Click on the "Add when" button, second time
        cy.get('[data-testid="choice-add-when-button"]').click();
        // CHECK alert message
        cy.get('.pf-c-alert').should('contain.text', 'When: 2 added');
        // // Close alert message
        cy.get('.pf-c-alert__action').children('button').click();

        // Click on the "Add otherwise" button
        cy.get('[data-testid="choice-add-otherwise-button"]').click();
        // CHECK alert message
        cy.get('.pf-c-alert').should('contain.text', 'Otherwise added');
        // // Close alert message
        cy.get('.pf-c-alert__action').eq(0).children('button').click();

        // Change When: 0 expression type to Jq from list
        cy.get('[data-testid="when-0-predicate-syntax-select"]').should('be.visible').select('Jq')
        // Type Jq expression in the first When: 0 expression field
        cy.get('[data-testid="when-0-predicate-string-input"]').clear().type('jq-test');
        // Type Simple expression in the second When: 1 expression field
        cy.get('[data-testid="when-1-predicate-string-input"]').clear().type('simple-test');
        // Click apply button
        cy.get('[data-testid="choice-apply-button"]').click();

        // CHECK that canvas has 3 new empty steps
        cy.get('[data-testid="viz-step-slot"]').should('be.visible').and('have.length', 3);
        // CHECK that canvas has 3 delete branch buttons
        cy.get('[data-testid="stepNode__deleteBranch-btn"]').should('be.visible').and('have.length', 3);

        // Check that the YAML is updated
        cy.checkCodeSpanLine("jq", "jq-test");
        cy.checkCodeSpanLine("simple", "simple-test");
        cy.get('.code-editor').should('contain.text', 'otherwise')

        // Delete the first When: 0 branch
        cy.get('[data-testid="remove-branch-when-0-button"]').click();
        cy.get('.pf-c-alert__action').children('button').click();

        // Delete the otherwise branch
        cy.get('[data-testid="remove-branch-otherwise-button"]').click();
        cy.get('.pf-c-alert__action').children('button').click();

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
