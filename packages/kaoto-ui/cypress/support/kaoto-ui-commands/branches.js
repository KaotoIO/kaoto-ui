import 'cypress-file-upload';

Cypress.Commands.add('deleteBranch', (branchIndex) => {
    branchIndex = branchIndex ?? 0;
    cy.isomorphicGet('[data-testid="stepNode__deleteBranch-btn"]').eq(branchIndex).click();
    cy.isomorphicGet('[data-testid="confirmDeleteBranchDialog__btn"]').click();
    cy.waitVisualizationUpdate();
});

Cypress.Commands.add('addBranchChoiceExtension', (otherwise) => {
    cy.waitExtensionLoaded();
    otherwise = otherwise ?? null;
    if (otherwise === null) {
        cy.isomorphicGet('[data-testid="choice-add-when-button"]').click();
        cy.isomorphicGet('.pf-c-alert').contains(/When: \d added/);
    } else {
        cy.isomorphicGet('[data-testid="choice-add-otherwise-button"]').click();
        cy.isomorphicGet('.pf-c-alert').should('contain.text', 'Otherwise added');
    }
    cy.isomorphicGet('.pf-c-alert__action').children('button').click();
    cy.waitVisualizationUpdate();
});

Cypress.Commands.add('editBranchConditionChoiceExtension', (whenIndex, condition, type) => {
    cy.waitExtensionLoaded();
    type = type ?? 'simple';
    if (type === 'jq') {
        cy.isomorphicGet(`[data-testid="when-${whenIndex}-predicate-syntax-select"]`).should('be.visible').select('Jq')
        cy.isomorphicGet(`[data-testid="when-${whenIndex}-predicate-string-input"]`).clear().type(condition);
    } else if (type === 'simple') {
        cy.isomorphicGet(`[data-testid="when-${whenIndex}-predicate-string-input"]`).clear().type(condition);
    }
    cy.isomorphicGet('[data-testid="choice-apply-button"]').click();
    cy.isomorphicGet('.pf-c-alert').should('contain.text', 'Choice step updated');
    cy.isomorphicGet('.pf-c-alert__action').children('button').click();
    cy.waitVisualizationUpdate();
});

Cypress.Commands.add('deleteBranchChoiceExtension', (indexOrType) => {
    cy.waitExtensionLoaded();
    if (indexOrType === 'otherwise') {
        cy.isomorphicGet('[data-testid="remove-branch-otherwise-button"]').click();
    } else {
        cy.isomorphicGet(`[data-testid="remove-branch-when-${indexOrType}-button"]`).click();
    }
    cy.isomorphicGet('.pf-c-alert__action').children('button').click();
    cy.isomorphicGet('[data-testid="choice-apply-button"]').click();
    cy.isomorphicGet('.pf-c-alert').should('contain.text', 'Choice step updated');
    cy.isomorphicGet('.pf-c-alert__action').children('button').click();
    cy.waitVisualizationUpdate();
});

Cypress.Commands.add('waitExtensionLoaded', () => {
    cy.contains('Loading extension...', { timeout: 30_000 }).should('not.exist');
});
