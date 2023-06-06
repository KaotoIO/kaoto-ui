import 'cypress-file-upload';

Cypress.Commands.add('openHomePage', () => {
  let url = Cypress.config().baseUrl;
  cy.visit(url);
  cy.waitOpenHomePage();
});

Cypress.Commands.add('zoomOutXTimes', (times) => {
  times = times ?? 1;
  Array.from({ length: times }).forEach(() => {
    cy.get('.react-flow__controls-button.react-flow__controls-zoomout').click();
  });
});

Cypress.Commands.add('waitVisualizationUpdate', () => {
  cy.get('body').then((body) => {
    /**
     * If the code editor is visible, it means that we would need
     * to wait for the getIntegration call, otherwise, the operation
     * is synchronous
     */
    if (body.find('.code-editor').length > 0) {
      cy.wait('@getIntegration');
    }
  });
});

Cypress.Commands.add('waitOpenHomePage', () => {
  cy.wait('@getDeployments');
  cy.wait('@getViewDefinitions');
});

Cypress.Commands.add('closeCatalogOrCodeEditor', () => {
  cy.get('[data-testid="kaoto-left-drawer"]').within(() => {
    cy.get('.pf-c-drawer__close > .pf-c-button').click();
  });
});

Cypress.Commands.add('openMenuDropDown', () => {
  cy.get('.pf-c-toolbar__content-section').click();
  cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click();
});

Cypress.Commands.add('openAboutModal', () => {
  cy.openMenuDropDown();
  cy.get('[data-testid="kaotoToolbar-kebab__about"]').click();
});

Cypress.Commands.add('openAppearanceModal', () => {
  cy.openMenuDropDown();
  cy.get('[data-testid="kaotoToolbar-kebab__appearance"]').click();
});

Cypress.Commands.add('openSettingsModal', () => {
  cy.openMenuDropDown();
  cy.get('[data-testid="kaotoToolbar-kebab__settings"]').click();
});

Cypress.Commands.add('closeAppearanceModal', () => {
  cy.get('[data-ouia-component-id="appearance-modal"] > button[aria-label="Close"]').click();
});

Cypress.Commands.add('closeAboutModal', () => {
  cy.get('.pf-c-button.pf-m-plain').click();
});

Cypress.Commands.add('closeMenuModal', () => {
  cy.get('[data-ouia-component-id="settings-modal"] > button[aria-label="Close"]').click();
});

Cypress.Commands.add('cancelMenuModal', () => {
  cy.get('[data-testid="settings-modal--cancel"]').click();
});

Cypress.Commands.add('saveMenuModal', (integrationChanged) => {
  integrationChanged = integrationChanged ?? false;
  cy.get('[data-testid="settings-modal--save"]').click();
  cy.get('.pf-c-alert').should('contain.text', 'Configuration settings saved successfully.');
  cy.get('.pf-c-alert__action').children('button').click();
  cy.wait('@getIntegration');
  if (integrationChanged) {
    cy.waitVisualizationUpdate();
    cy.wait('@getDSLs');
  }
});

Cypress.Commands.add('switchAppearanceTheme', (object) => {
  object = object ?? '';
  if (object === 'editor') {
    cy.get('[data-testid="appearance--theme-editor-switch"]').click({ force: true });
  } else {
    cy.get('[data-testid="appearance--theme-ui-switch"]').click({ force: true });
  }
});

/**
 * Select from integration type dropdown
 * Possible values are - Integration, Camel Route, Kamelet, KameletBinding
 */
Cypress.Commands.add('switchIntegrationType', (type) => {
  cy.get('[data-testid="dsl-list-dropdown"]').click({ force: true });

  cy.get('.pf-c-menu__item-text')
    .contains(type)
    .then((element) => {
      cy.wrap(element).click();
    });
    cy.get('[data-testid="confirmation-modal-confirm"]').click({ force: true });
  cy.wait('@getViewDefinitions');
});

Cypress.Commands.add('createNewRoute', () => {
  cy.get('[data-testid="dsl-list-btn"]').click({ force: true });
  cy.wait('@getViewDefinitions');
});

Cypress.Commands.add('disableRouteVisibility', (index) => {
  cy.toggleFlowsList();
  cy.get('svg[data-testid^="toggle-btn-route"]').each(($element) => {
    const attributeValue = $element.attr('data-testid');
    if (attributeValue.endsWith('visible')) {
      cy.wrap($element).click();
    }
  });
  cy.closeFlowsListIfVisible();
});

Cypress.Commands.add('allignAllRoutesVisibility', (switchvisibility) => {
  cy.toggleFlowsList();
  cy.get('[data-testid=flows-list-table]').then((body) => {
    if (body.find(`svg[data-testid$="${switchvisibility}"]`).length > 0) {
      cy.get(`svg[data-testid$="${switchvisibility}"]`).then(($element) => {
        if ($element.attr('data-testid').endsWith(`${switchvisibility}`)) {
          cy.wrap($element[0]).click();
          cy.closeFlowsListIfVisible();
          cy.allignAllRoutesVisibility(switchvisibility);
        }
      });
    }
  });
  cy.closeFlowsListIfVisible();
});

Cypress.Commands.add('hideAllRoutes', () => {
  cy.allignAllRoutesVisibility('visible');
});

Cypress.Commands.add('showAllRoutes', () => {
  cy.allignAllRoutesVisibility('hidden');
});

Cypress.Commands.add('toggleRouteVisibility', (index) => {
  cy.toggleFlowsList();
  cy.get('button[data-testid^="toggle-btn-route"]').then((buttons) => {
    cy.wrap(buttons[index]).click();
  });
  cy.closeFlowsListIfVisible();
});

Cypress.Commands.add('deleteRoute', (index) => {
  cy.toggleFlowsList();
  cy.get('button[data-testid^="delete-btn-route"]').then((buttons) => {
    cy.wrap(buttons[index]).click();
  });
  cy.closeFlowsListIfVisible();
});

Cypress.Commands.add('closeFlowsListIfVisible', () => {
  cy.get('body').then((body) => {
    if (body.find('[data-testid="flows-list-table"]').length > 0) {
      cy.get('[data-testid="flows-list-table"]').then(($element) => {
        if ($element.length > 0) {
          cy.toggleFlowsList();
        }
      });
    }
  });
});

Cypress.Commands.add('toggleFlowsList', () => {
  cy.get('[data-testid="flows-list-dropdown"]').click({ force: true });
});
