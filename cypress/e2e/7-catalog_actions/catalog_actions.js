describe('Test for catalog actions', () => {

    beforeEach(() => {
        let url = Cypress.config().baseUrl;
        cy.visit(url);

        // Upload the initial state (EipAction.yaml)
        cy.get('[data-testid="toolbar-show-code-btn"]').click();
        cy.get('[data-testid="sourceCode--clearButton"]').should('be.visible').click({ force: true });
        cy.get('.pf-c-code-editor__main').should('be.visible');
        cy.get('.pf-c-code-editor__main > input').attachFile('EipAction.yaml');
        cy.get('[data-testid="sourceCode--applyButton"]').click();
    });

    // Try replace the digitalocean step with the timer-source step
    it("User drags and drops an invalid step onto a nested branch step", () => {
        const dataTransfer = new DataTransfer();
        // open catalog
        cy.get('[data-testid="toolbar-step-catalog-btn"]').click();
        // select timer-source step
        cy.get('#stepSearch').type('timer-source');
        // drag timer-source step from catalog
        cy.get('[data-testid="catalog-step-timer-source"]').trigger('dragstart', {
            dataTransfer,
        });
        // drop aggregate step from catalog over nested digitalocean step
        cy.get('[data-testid="viz-step-digitalocean"]').trigger('drop', {
            dataTransfer,
        });

        // CHECK digitalocean step is visible
        cy.get('[data-testid="viz-step-digitalocean"]').should('be.visible');
        // CHECK aggregation step was not created
        cy.get('[data-testid="viz-step-timer-source"]').should('not.exist');
        // CHECK alert box is visible and contains error message
        cy.get('[data-testid="alert-box-replace-unsuccessful"]').should('be.visible');
        cy.get('[data-testid="alert-box-replace-unsuccessful"]').should('contain', 'You cannot replace a middle step with a start step.');
    });

    // Replace the digitalocean step with the delay step with the big catalog
    it("User replaces a placeholder step via drag & drop from the big catalog", () => {
        const dataTransfer = new DataTransfer();
        // open catalog
        cy.get('[data-testid="toolbar-step-catalog-btn"]').click();
        // select actions category
        cy.get('[data-testid="catalog-step-actions"]').click();
        // select delay step
        cy.get('#stepSearch').type('delay');
        // drag delay step from catalog
        cy.get('[data-testid="catalog-step-delay"]').trigger('dragstart', {
            dataTransfer,
        });
        // drop aggregate step from catalog over nested digitalocean step
        cy.get('[data-testid="viz-step-digitalocean"]').trigger('drop', {
            dataTransfer,
        });

        // CHECK digitalocean step was replaced
        cy.get('[data-testid="viz-step-digitalocean"]').should('not.exist');
        // CHECK delay step was created
        cy.get('[data-testid="viz-step-delay"]').should('be.visible');
    });

    // Replace the digitalocean step with the delay step with the mini catalog (Delete and Insert)
    it("User replaces a placeholder step using the mini catalog (Delete and Insert)", () => {
        // delete digitalocean step
        cy.get('[data-testid="viz-step-digitalocean"]').trigger('mouseover');
        cy.get(
            '[data-testid="viz-step-digitalocean"] > [data-testid="configurationTab__deleteBtn"]'
        ).click({ force: true });
        // prepend step before set-header step
        cy.get(
            '[data-testid="viz-step-set-header"] > [data-testid="stepNode__prependStep-btn"]'
        ).click();
        cy.get('[data-testid="miniCatalog"]').should('be.visible');
        // search delay step
        cy.get('.pf-c-text-input-group__text-input').type('delay');
        // select delay step
        cy.get('[data-testid="miniCatalog__stepItem--delay"]').click();

        // CHECK digitalocean step was replaced
        cy.get('[data-testid="viz-step-digitalocean"]').should('not.exist');
        // CHECK delay step was created
        cy.get('[data-testid="viz-step-delay"]').should('be.visible');
    });

});
