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
});

Cypress.Commands.add('openCodeEditor', () => {
    cy.get('[data-testid="toolbar-show-code-btn"]').click();
    cy.get('[data-testid="toolbar-show-code-btn"]').trigger('mouseleave');
    cy.wait('@getIntegration');
});

Cypress.Commands.add('editorAddText', (line, text) => {
    const arr = text.split('\n');
    Array.from({ length: arr.length }).forEach((_, i) => {
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
    Array.from({ length: times }).forEach(() => {
        return cy.get('[data-testid="sourceCode--undoButton"]').click();
    });
});

Cypress.Commands.add('syncUpCodeChanges', () => {
    cy.get('[data-testid="sourceCode--applyButton"]').click();
    cy.get('[data-testid="sourceCode--applyButton"]').trigger('mouseleave');
    cy.wait('@getIntegration');
    cy.wait('@getViewDefinitions');
});

Cypress.Commands.add('checkCodeSpanLine', (spanText, linesCount) => {
    linesCount = linesCount ?? 1;
    cy.get('.code-editor')
        .within (() => {
            cy.get('span:only-child').contains(spanText)
            .should("have.length", linesCount)
        }
    )
});
