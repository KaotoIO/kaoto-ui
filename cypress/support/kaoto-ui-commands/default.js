import 'cypress-file-upload';

Cypress.Commands.add('openHomePage', () => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
    cy.waitOpenHomePage();
});

Cypress.Commands.add('zoomOutXTimes', (times) => {
    times = times ?? 1;
    Array.from({ length: times }).forEach(() => {
        cy.get('.react-flow__controls-button.react-flow__controls-zoomout').click()
    });
});

Cypress.Commands.add('waitVisualizationUpdate', () => {
    cy.get('body').then((body) => {
        if (body.find('.code-editor').length > 0) {
            cy.wait('@getIntegration');
        }
        cy.wait('@getDSLs');
        cy.wait('@getViewDefinitions');
    });
});

Cypress.Commands.add('waitOpenHomePage', () => {
    cy.wait('@getDSLs');
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

Cypress.Commands.add('openAppearanceModal', () => {
    cy.openMenuDropDown();
    cy.get('[data-testid="kaotoToolbar-kebab__appearance"]').click();
});

Cypress.Commands.add('openSettingsModal', () => {
    cy.openMenuDropDown();
    cy.get('[data-testid="kaotoToolbar-kebab__settings"]').click();
});

Cypress.Commands.add('closeAppearanceModal', () => {
    cy.get('#pf-modal-part-3 > .pf-c-button').click();
});

Cypress.Commands.add('closeMenuModal', () => {
    cy.get('[data-ouia-component-id="OUIA-Generated-Modal-small-2-ModalBoxCloseButton"]').click();
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
