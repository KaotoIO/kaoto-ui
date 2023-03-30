import 'cypress-file-upload';

Cypress.Commands.add('uploadFixture', (fixture, open) => {
    open = open ?? true;
    if (open) {
        cy.openCodeEditor();
    }
    cy.get('[data-testid="sourceCode--clearButton"]').should('be.visible').click({ force: true });
    cy.get('.pf-c-code-editor__main').should('be.visible');
    cy.get('.pf-c-code-editor__main > input').attachFile(fixture);
    cy.syncUpCodeChanges();
    cy.waitVisualizationUpdate();
});

Cypress.Commands.add('openCodeEditor', () => {
    cy.get('[data-testid="toolbar-show-code-btn"]').click();
    cy.get('[data-testid="toolbar-show-code-btn"]').trigger('mouseleave');
    cy.wait('@getIntegration');
});

Cypress.Commands.add('editorAddText', (line, text) => {
    const arr = text.split('\n');
    Array.from({ length: arr.length }).map((_, i) => {
        cy.get('.code-editor')
            .click()
            .type('{pageUp}{pageUp}' + '{downArrow}'.repeat(line + i) + '{enter}{upArrow}' + arr[i], {
                delay: 1,
            });
    });
});

Cypress.Commands.add('editorDeleteLine', (line, repeatCount) => {
    repeatCount = repeatCount ?? 1;
    cy.get('.code-editor')
        .click()
        .type(
            '{pageUp}' +
            '{downArrow}'.repeat(line) +
            '{shift}' +
            '{downArrow}'.repeat(repeatCount) +
            '{backspace}',
            { delay: 1 }
        );
});

Cypress.Commands.add('editorClickUndoXTimes', (times) => {
    times = times ?? 1;
    Array.from({ length: times }).map((_, i) => {
        return cy.get('[data-testid="sourceCode--undoButton"]').click();
    });
});

Cypress.Commands.add('syncUpCodeChanges', () => {
    cy.get('[data-testid="sourceCode--applyButton"]').click();
    cy.waitVisualizationUpdate();
    cy.wait('@getIntegration');
});

Cypress.Commands.add('checkCodeSpanLine', (firstSpan, secondSpan) => {
    cy.get('.code-editor').contains(firstSpan).parent()
        .should('contain.text', firstSpan)
        .and('contain.text', secondSpan)
});
