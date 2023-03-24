import 'cypress-file-upload';

Cypress.Commands.add('uploadInitialState', (fixture) => {
    cy.get('[data-testid="toolbar-show-code-btn"]').click();
    cy.wait('@getIntegration');
    cy.get('[data-testid="sourceCode--clearButton"]').should('be.visible').click({ force: true });
    cy.get('.pf-c-code-editor__main').should('be.visible');
    cy.get('.pf-c-code-editor__main > input').attachFile(fixture);
    cy.syncUpCodeChanges();
    cy.waitVisualizationUpdate();
});

Cypress.Commands.add('editorAddText', (line, text) => {
    const arr = text.split('\n');
    Cypress._.times(arr.length, (i) => {
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
