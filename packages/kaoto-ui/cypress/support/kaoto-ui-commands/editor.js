import 'cypress-file-upload';

Cypress.Commands.add('uploadFixture', (fixture, open) => {
    open = open ?? true;
    if (open) {
        cy.openCodeEditor();
    }
    cy.isomorphicGet('[data-testid="sourceCode--clearButton"]').should('be.visible').click({ force: true });
    cy.isomorphicGet('.pf-c-code-editor__main').should('be.visible');
    cy.isomorphicGet('.pf-c-code-editor__main > input').attachFile(fixture);
    cy.syncUpCodeChanges();
});

Cypress.Commands.add('openCodeEditor', () => {
    cy.isomorphicGet('[data-testid="toolbar-show-code-btn"]').click();
    cy.isomorphicGet('[data-testid="toolbar-show-code-btn"]').trigger('mouseleave');
    cy.wait('@getIntegration');
});

Cypress.Commands.add('editorAddText', (line, text) => {
    text.split('\n').forEach((lineToWrite, i) => {
        cy.isomorphicGet('.code-editor')
            .click()
            .type('{pageUp}{pageUp}' + '{downArrow}'.repeat(line + i) + '{enter}{upArrow}' + lineToWrite, {
                delay: 1,
            });
    });
});

Cypress.Commands.add('editorDeleteLine', (line, repeatCount) => {
    repeatCount = repeatCount ?? 1;
    // Open the Go to Line dialog
    cy.isomorphicGet('.code-editor')
        .click()
        .type(
            '{ctrl}' +
            '{g}',
            { delay: 1 },
        );

    // Type the line number to delete
    cy.isomorphicGet('input[aria-describedby="quickInput_message"][aria-controls="quickInput_list"]')
        .click()
        .type(
            `${line + 1}` +
            '{enter}',
            { delay: 1 },
        );

    // Delete the line as many times as specified
    for (let i = 0; i < repeatCount; i++) {
        cy.focused()
            .type(
                '{ctrl}{shift}{k}',
                { delay: 1 },
            );
        }
});

Cypress.Commands.add('editorClickUndoXTimes', (times) => {
    times = times ?? 1;
    Array.from({ length: times }).forEach(() => {
        return cy.isomorphicGet('[data-testid="sourceCode--undoButton"]').click();
    });
});

Cypress.Commands.add('syncUpCodeChanges', () => {
    cy.isomorphicGet('[data-testid="sourceCode--applyButton"]').click();
    cy.isomorphicGet('[data-testid="sourceCode--applyButton"]').trigger('mouseleave');
    //Request flows jsons based on the route yaml in the code editor
    cy.wait('@getIntegration');
    cy.wait('@getViewDefinitions');
    //Request route yaml based on the flow jsons
    cy.wait('@getIntegration');
});

Cypress.Commands.add('checkCodeSpanLine', (spanText, linesCount) => {
    linesCount = linesCount ?? 1;
    cy.isomorphicGet('.code-editor')
        .within (() => {
            cy.get('span:only-child').contains(spanText)
            .should("have.length", linesCount)
        }
    )
});
