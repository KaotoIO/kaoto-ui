import 'cypress-file-upload';

Cypress.Commands.add('deleteBranch', (branchIndex) => {
    branchIndex = branchIndex ?? 0;
    cy.get('[data-testid="stepNode__deleteBranch-btn"]').eq(branchIndex).click();
    cy.get('[data-testid="confirmDeleteBranchDialog__btn"]').click();
    cy.waitVisualizationUpdate();
});

Cypress.Commands.add('addBranchChoiceExtension', (otherwise) => {
    cy.waitExtensionLoaded();
    otherwise = otherwise ?? null;
    if (otherwise === null) {
        cy.get('[data-testid="choice-add-when-button"]').click();
        cy.get('.pf-c-alert').contains(/When: \d added/);
    } else {
        cy.get('[data-testid="choice-add-otherwise-button"]').click();
        cy.get('.pf-c-alert').should('contain.text', 'Otherwise added');
    }
    cy.get('.pf-c-alert__action').children('button').click();
    cy.waitVisualizationUpdate();
});

Cypress.Commands.add('editBranchConditionChoiceExtension', (whenIndex, condition, type) => {
    cy.waitExtensionLoaded();
    type = type ?? 'simple';
    if (type === 'jq') {
        cy.get(`[data-testid="when-${whenIndex}-predicate-syntax-select"]`).should('be.visible').select('Jq')
        cy.get(`[data-testid="when-${whenIndex}-predicate-string-input"]`).clear().type(condition);
    } else if (type === 'simple') {
        cy.get(`[data-testid="when-${whenIndex}-predicate-string-input"]`).clear().type(condition);
    }
    cy.get('[data-testid="choice-apply-button"]').click();
    cy.get('.pf-c-alert').should('contain.text', 'Choice step updated');
    cy.get('.pf-c-alert__action').children('button').click();
    cy.waitVisualizationUpdate();
});

Cypress.Commands.add('deleteBranchChoiceExtension', (indexOrType) => {
    cy.waitExtensionLoaded();
    if (indexOrType === 'otherwise') {
        cy.get('[data-testid="remove-branch-otherwise-button"]').click();
    } else {
        cy.get(`[data-testid="remove-branch-when-${indexOrType}-button"]`).click();
    }
    cy.get('.pf-c-alert__action').children('button').click();
    cy.get('[data-testid="choice-apply-button"]').click();
    cy.get('.pf-c-alert').should('contain.text', 'Choice step updated');
    cy.get('.pf-c-alert__action').children('button').click();
    cy.waitVisualizationUpdate();
});

Cypress.Commands.add('waitExtensionLoaded', () => {
    cy.contains('Loading extension...', { timeout: 30_000 }).should('not.exist');
});
