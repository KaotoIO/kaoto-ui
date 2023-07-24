import 'cypress-file-upload';

Cypress.Commands.add('isomorphicGet', (selector) => {
  const isIframeEnabled = Cypress.env('IFRAME_ENABLED');
  cy.log(`isIframeEnabled: ${isIframeEnabled}`);

  if (isIframeEnabled) {
    return (
      cy
        .get('iframe[src="envelope-kaoto-editor.html"]', { log: false })
        .its('0.contentDocument', { log: false })
        // wraps "body" DOM element to allow
        // chaining more Cypress commands, like ".find(...)"
        // https://on.cypress.io/wrap
        // .then((body) => cy.wrap(body, { log: false }))
        .find(selector, { log: false })
    );
  }

  return cy.get(selector);
});

Cypress.Commands.add('openHomePage', () => {
  let url = Cypress.config().baseUrl;
  cy.visit(url);
  cy.waitOpenHomePage();
});

Cypress.Commands.add('zoomOutXTimes', (times) => {
  times = times ?? 1;
  Array.from({ length: times }).forEach(() => {
    cy.isomorphicGet('.react-flow__controls-button.react-flow__controls-zoomout').click();
  });
});

Cypress.Commands.add('waitVisualizationUpdate', () => {
  cy.isomorphicGet('body').then((body) => {
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
  cy.isomorphicGet('[data-testid="kaoto-left-drawer"]').within(() => {
    cy.get('.pf-c-drawer__close > .pf-c-button').click();
  });
  cy.isomorphicGet('[data-testid="kaoto-left-drawer"]').should('be.hidden');
});

Cypress.Commands.add('openMenuDropDown', () => {
  cy.isomorphicGet('.pf-c-toolbar__content-section').click();
  cy.isomorphicGet('[data-testid="toolbar-kebab-dropdown-btn"]').click();
});

Cypress.Commands.add('openAboutModal', () => {
  cy.openMenuDropDown();
  cy.isomorphicGet('[data-testid="kaotoToolbar-kebab__about"]').click();
});

Cypress.Commands.add('openAppearanceModal', () => {
  cy.openMenuDropDown();
  cy.isomorphicGet('[data-testid="kaotoToolbar-kebab__appearance"]').click();
});

Cypress.Commands.add('openSettingsModal', () => {
  cy.openMenuDropDown();
  cy.isomorphicGet('[data-testid="kaotoToolbar-kebab__settings"]').click();
});

Cypress.Commands.add('closeAppearanceModal', () => {
  cy.isomorphicGet(
    '[data-ouia-component-id="appearance-modal"] > button[aria-label="Close"]',
  ).click();
});

Cypress.Commands.add('closeAboutModal', () => {
  cy.isomorphicGet('.pf-c-button.pf-m-plain').click();
});

Cypress.Commands.add('closeMenuModal', () => {
  cy.isomorphicGet(
    '[data-ouia-component-id="settings-modal"] > button[aria-label="Close"]',
  ).click();
});

Cypress.Commands.add('cancelMenuModal', () => {
  cy.isomorphicGet('[data-testid="settings-modal--cancel"]').click();
});

Cypress.Commands.add('saveMenuModal', (integrationChanged) => {
  integrationChanged = integrationChanged ?? false;
  cy.isomorphicGet('[data-testid="settings-modal--save"]').click();
  cy.isomorphicGet('.pf-c-alert').should(
    'contain.text',
    'Configuration settings saved successfully.',
  );
  cy.isomorphicGet('.pf-c-alert__action').children('button').click();
  cy.wait('@getIntegration');
  if (integrationChanged) {
    cy.waitVisualizationUpdate();
    cy.wait('@getDSLs');
  }
});

Cypress.Commands.add('switchAppearanceTheme', (object) => {
  object = object ?? '';
  if (object === 'editor') {
    cy.isomorphicGet('[data-testid="appearance--theme-editor-switch"]').click({ force: true });
  } else {
    cy.isomorphicGet('[data-testid="appearance--theme-ui-switch"]').click({ force: true });
  }
});

/**
 * Select from integration type dropdown
 * Possible values are - Integration, Camel Route, Kamelet, KameletBinding
 */
Cypress.Commands.add('switchIntegrationType', (type) => {
  cy.isomorphicGet('[data-testid="dsl-list-dropdown"]').click({ force: true });

  cy.isomorphicGet('.pf-c-menu__item-text')
    .contains(type)
    .then((element) => {
      cy.wrap(element).click();
    });
  cy.isomorphicGet('[data-testid="confirmation-modal-confirm"]').click({ force: true });
  cy.wait('@getViewDefinitions');
});

Cypress.Commands.add('createNewRoute', () => {
  cy.isomorphicGet('[data-testid="dsl-list-btn"]').click({ force: true });
  cy.wait('@getViewDefinitions');
});

Cypress.Commands.add('disableRouteVisibility', (index) => {
  cy.toggleFlowsList();
  cy.isomorphicGet('svg[data-testid^="toggle-btn-route"]').each(($element) => {
    const attributeValue = $element.attr('data-testid');
    if (attributeValue.endsWith('visible')) {
      cy.wrap($element).click();
    }
  });
  cy.closeFlowsListIfVisible();
});

Cypress.Commands.add('allignAllRoutesVisibility', (switchvisibility) => {
  cy.toggleFlowsList();
  cy.isomorphicGet('[data-testid=flows-list-table]').then((body) => {
    if (body.find(`svg[data-testid$="${switchvisibility}"]`).length > 0) {
      cy.isomorphicGet(`svg[data-testid$="${switchvisibility}"]`).then(($element) => {
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
  cy.isomorphicGet('button[data-testid^="toggle-btn-route"]').then((buttons) => {
    cy.wrap(buttons[index]).click();
  });
  cy.closeFlowsListIfVisible();
});

Cypress.Commands.add('deleteRoute', (index) => {
  cy.toggleFlowsList();
  cy.isomorphicGet('button[data-testid^="delete-btn-route"]').then((buttons) => {
    cy.wrap(buttons[index]).click();
  });
  cy.closeFlowsListIfVisible();
});

Cypress.Commands.add('closeFlowsListIfVisible', () => {
  cy.isomorphicGet('body').then((body) => {
    if (body.find('[data-testid="flows-list-table"]').length > 0) {
      cy.isomorphicGet('[data-testid="flows-list-table"]').then(($element) => {
        if ($element.length > 0) {
          cy.toggleFlowsList();
        }
      });
    }
  });
});

Cypress.Commands.add('toggleFlowsList', () => {
  cy.isomorphicGet('[data-testid="flows-list-dropdown"]').click({ force: true });
});
