describe('Test for Step extensions', () => {
    beforeEach(() => {
        cy.intercept('/v1/integrations/dsls').as('getDSLs');
        cy.intercept('/v1/view-definitions').as('getViewDefinitions');
        cy.intercept('/v1/integrations*').as('getIntegration');

        cy.openHomePage();
        cy.uploadFixture('TimerLogCamelRoute.yaml');

        cy.zoomOutXTimes(3)
    });

    it('User sees a step extension(transform)', () => {
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

    it('User adds and removes a branch from a step using a step extension', () => {
        cy.insertStepMiniCatalog('choice');
        cy.openStepConfigurationTab('choice');


        cy.addBranchChoiceExtension();
        cy.addBranchChoiceExtension();
        cy.addBranchChoiceExtension('otherwise');

        cy.editBranchConditionChoiceExtension(0, 'jq-test', 'jq');
        cy.editBranchConditionChoiceExtension(1, 'simple-test', 'simple');

        // Check that the YAML is updated
        cy.checkCodeSpanLine("jq", "jq-test");
        cy.checkCodeSpanLine("simple", "simple-test");
        cy.get('.code-editor').should('contain.text', 'otherwise')

        cy.deleteBranchChoiceExtension(0);
        cy.deleteBranchChoiceExtension('otherwise');

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
