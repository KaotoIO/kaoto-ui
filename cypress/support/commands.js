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

Cypress.Commands.add('replaceEmptyStepMiniCatalog', (step, stepIndex) => {
  stepIndex = stepIndex ?? 0;
  cy.get('[data-testid="viz-step-slot"]').eq(stepIndex).click();
  cy.selectStepMiniCatalog(step);
});

Cypress.Commands.add('appendStepMiniCatalog', (step, appendedStep, stage, stepIndex) => {
  stepIndex = stepIndex ?? 0;
  cy.get(`[data-testid="viz-step-${step}"]`).eq(stepIndex).children('[data-testid="stepNode__appendStep-btn"]').click();
  cy.selectStepMiniCatalog(appendedStep, stage);
});

Cypress.Commands.add('insertStepMiniCatalog', (step, insertIndex) => {
  insertIndex = insertIndex ?? 0;
  cy.get('[data-testid="stepNode__insertStep-btn"]').eq(insertIndex).click();
  cy.selectStepMiniCatalog(step);
});

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
  cy.get(`[data-testid="viz-step-${step}"]`).eq(stepIndex).click();
  cy.get('[data-testid="configurationTab"]').click();
});

Cypress.Commands.add('closeStepConfigurationTab', () => {
  cy.get('.pf-c-button.pf-m-plain').click();
});

Cypress.Commands.add('checkCodeSpanLine', (firstSpan, secondSpan) => {
  cy.get('.code-editor').contains(firstSpan).parent()
    .should('contain.text', firstSpan)
    .and('contain.text', secondSpan)
});

Cypress.Commands.add('interactWithInputObject', (inputName, value) => {
  if (value != null) {
    cy.get(`input[name="${inputName}"]`).clear().type(value);
  } else {
    cy.get(`input[name="${inputName}"]`).click();
  }
});

Cypress.Commands.add('dragAndDropFromCatalog', (source, target, targetIndex) => {
  targetIndex = targetIndex ?? 0;
  const dataTransfer = new DataTransfer();
  cy.get('[data-testid="toolbar-step-catalog-btn"]').click();
  cy.get('[data-testid="catalog-step-actions"]').click();
  cy.get('#stepSearch').type(`${source}`);
  cy.get(`[data-testid="catalog-step-${source}"]`).trigger('dragstart', {
    dataTransfer,
  });
  cy.get(`[data-testid="viz-step-${target}"]`).eq(targetIndex).trigger('drop', {
    dataTransfer,
  });
});

// Blocked due to: https://github.com/KaotoIO/kaoto-ui/issues/1381
// Cypress.Commands.add('insertBranch', (insertIndex) => {
//   insertIndex = insertIndex ?? 0;
//   cy.get('[data-testid="stepNode__insertStep-btn"]').eq(insertIndex).click();
//   cy.get('[data-testid="miniCatalog__branches"]').click();
//   cy.get('[data-testid="addBranch__button"]').click();
//   cy.waitVisualizationUpdate();
// });

// Cypress.Commands.add('appendBranch', (choiceIndex) => {
//   choiceIndex = choiceIndex ?? 0;
//   cy.get('[data-testid="viz-step-choice"]').eq(choiceIndex).children('[data-testid="stepNode__appendStep-btn"]').click();
//   cy.get('[data-testid="miniCatalog__branches"]').click();
//   cy.get('[data-testid="addBranch__button"]').click();
//   cy.waitVisualizationUpdate();
// });

Cypress.Commands.add('addBranchChoiceExtension', (otherwise) => {
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

Cypress.Commands.add('editBranchCondition', (whenIndex, condition, type) => {
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
