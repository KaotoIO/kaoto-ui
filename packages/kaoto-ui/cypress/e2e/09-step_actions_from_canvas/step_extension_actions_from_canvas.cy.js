describe('Test for Step extensions', () => {
    beforeEach(() => {
        cy.intercept('/v1/deployments*').as('getDeployments');
        cy.intercept('/v1/integrations/dsls').as('getDSLs');
        cy.intercept('/v1/view-definitions').as('getViewDefinitions');
        cy.intercept('/v2/integrations*').as('getIntegration');

        cy.openHomePage();
        cy.uploadFixture('TimerLogCamelRoute.yaml');

        cy.zoomOutXTimes(3)
    });

    it('User sees a step extension(transform)', () => {
        cy.insertStepMiniCatalog('transform');
        cy.openStepConfigurationTab('transform', true);
        cy.waitExtensionLoaded();

        // CHECK that transform extension elements are visible
        cy.isomorphicGet('[data-testid="expression-syntax-select"]').should('be.visible');
        cy.isomorphicGet('[data-testid="expression-string-input"]').should('be.visible');
        cy.isomorphicGet('[data-testid="transform-apply-button"]').should('be.visible');
    });

    it('User configures a step from a step extension (set-header)', () => {
        cy.insertStepMiniCatalog('set-header');
        cy.openStepConfigurationTab('set-header', true);
        cy.waitExtensionLoaded();

        // Fill the step name
        cy.isomorphicGet('[data-testid="set-header-name-input"]').as('headerNameInput');
        cy.isomorphicGet('@headerNameInput').clear();
        cy.isomorphicGet('@headerNameInput').type('test-name');

        // Select jq syntax
        cy.isomorphicGet('[data-testid="expression-syntax-select"]').select('jq');
        // Fill the expression
        cy.isomorphicGet('[data-testid="expression-string-input"]').as('expressionInput');
        cy.isomorphicGet('@expressionInput').clear();
        cy.isomorphicGet('@expressionInput').type('jq-test');

        // Click on the "Apply" button
        cy.isomorphicGet('[data-testid="set-header-apply-button"]').click();

        // CHECK alert message
        cy.isomorphicGet('.pf-c-alert').should('be.visible').and('contain.text', 'Set Header step updated');
        // CHECK that the YAML is updated
        cy.checkCodeSpanLine('name: test-name');
        cy.checkCodeSpanLine('jq: jq-test');
    });

    it('User adds and removes a branch from a step using a step extension', () => {
        cy.insertStepMiniCatalog('choice');
        cy.openStepConfigurationTab('choice', true);
        cy.waitExtensionLoaded();

        cy.addBranchChoiceExtension();
        cy.addBranchChoiceExtension();
        cy.addBranchChoiceExtension('otherwise');

        cy.editBranchConditionChoiceExtension(0, 'jq-test', 'jq');
        cy.editBranchConditionChoiceExtension(1, 'simple-test', 'simple');

        // Check that the YAML is updated
        cy.checkCodeSpanLine("jq: jq-test");
        cy.checkCodeSpanLine("simple: simple-test");
        cy.isomorphicGet('.code-editor').should('contain.text', 'otherwise')

        cy.deleteBranchChoiceExtension(0);
        cy.deleteBranchChoiceExtension('otherwise');

        // Close Configuration tab
        cy.isomorphicGet('.pf-c-button.pf-m-plain').click();

        // CHECK that canvas has 1 empty step
        cy.isomorphicGet('[data-testid="viz-step-slot"]').should('have.length', 1).and('be.visible');

        // Check that the YAML is updated
        cy.isomorphicGet('.code-editor').should('not.contain.text', 'jq-test');
        cy.isomorphicGet('.code-editor').should('contain.text', 'simple-test');
        cy.isomorphicGet('.code-editor').should('not.contain.text', 'otherwise');
    });
});
