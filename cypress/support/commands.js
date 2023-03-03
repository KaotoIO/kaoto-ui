import 'cypress-file-upload';

Cypress.Commands.add('editorAddText', (line, text) => {
  var arr = text.split('\n');
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
