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

Cypress.Commands.add('openHomePage', () => {
  let url = Cypress.config().baseUrl;
  cy.visit(url);
});

Cypress.Commands.add('uploadInitialState', (fixture) => {
  cy.get('[data-testid="toolbar-show-code-btn"]').click();
  cy.get('[data-testid="sourceCode--clearButton"]').should('be.visible').click({ force: true });
  cy.get('.pf-c-code-editor__main').should('be.visible');
  cy.get('.pf-c-code-editor__main > input').attachFile(fixture);
  cy.syncUpCodeChanges();
});

Cypress.Commands.add('deleteStep', (step, stepIndex) => {
  stepIndex = stepIndex ?? 0;
  cy.get(`[data-testid="viz-step-${step}"]`).eq(stepIndex).trigger('mouseover').children('[data-testid="configurationTab__deleteBtn"]').click({ force: true });
  cy.waitVisualizationUpdate();
});

Cypress.Commands.add('waitVisualizationUpdate', () => {
  cy.wait('@getIntegration');
  cy.wait('@getDSLs');
  cy.wait('@getViewDefinitions');
});

Cypress.Commands.add('appendStepMiniCatalog', (step, appendedStep, stage, stepIndex) => {
  stepIndex = stepIndex ?? 0;
  cy.get(`[data-testid="viz-step-${step}"]`).eq(stepIndex).children('[data-testid="stepNode__appendStep-btn"]').click();
  cy.selectStepMiniCatalog(appendedStep, stage);
})

Cypress.Commands.add('insertStepMiniCatalog', (step, insertIndex) => {
  insertIndex = insertIndex ?? 0;
  cy.get('[data-testid="stepNode__insertStep-btn"]').eq(insertIndex).click();
  cy.selectStepMiniCatalog(step);
})

Cypress.Commands.add('selectStepMiniCatalog', (step, stage) => {
  if (stage != null) { cy.get(`[data-testid="miniCatalog__step-${stage}"]`).click(); }
  cy.get('[data-testid="miniCatalog"]').should('be.visible');
  cy.get('.pf-c-text-input-group__text-input').type(step);
  cy.get(`[data-testid="miniCatalog__stepItem--${step}"]`).first().click();
  cy.waitVisualizationUpdate();
});

Cypress.Commands.add('syncUpCodeChanges', () => {
  cy.get('[data-testid="sourceCode--applyButton"]').click();
  cy.waitVisualizationUpdate();
});

Cypress.Commands.add('openStepConfigurationTab', (step, stepIndex) => {
  stepIndex = stepIndex ?? 0;
  cy.get(`[data-testid="viz-step-${step}"]`).eq(0).click();
  cy.get('[data-testid="configurationTab"]').click();
});

Cypress.Commands.add('checkCodeSpanLine', (firstSpan, secondSpan) => {
  cy.get('.code-editor').contains(firstSpan).parent()
    .should('contain.text', firstSpan)
    .and('contain.text', secondSpan)
});
