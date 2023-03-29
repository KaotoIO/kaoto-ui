describe('Settings', () => {
  beforeEach(() => {
    cy.intercept('/v1/integrations/dsls').as('getDSLs');
    cy.intercept('/v1/view-definitions').as('getViewDefinitions');
    cy.intercept('/v1/integrations*').as('getIntegration');

    cy.openHomePage();

    cy.openSettingsModal();
  });

  it('Open/Close/Cancel settings menu', () => {
    cy.closeMenuModal();

    // CHECK settings modal is closed with close button
    cy.get('[data-testid="settings-modal"]').should('not.exist');

    cy.openSettingsModal();

    // CHECK settings modal is open
    cy.get('[data-testid="settings-modal"]').should('be.visible');

    cy.cancelMenuModal();

    // CHECK settings modal is closed with cancel button
    cy.get('[data-testid="settings-modal"]').should('not.exist');
  });

  it('Updates the fields', () => {
    cy.cancelMenuModal();
    cy.replaceEmptyStepMiniCatalog('timer');
    cy.openSettingsModal();

    // test validation
    cy.get('[data-testid="settings--integration-name"]').click().clear();
    cy.get('#integration-name-helper').should('be.visible');
    cy.get('[data-testid="settings--namespace"]').click().clear();
    cy.get('#namespace-helper').should('be.visible');
    cy.get('[data-testid="settings-modal--save"]').should('be.disabled');

    // make changes
    cy.get('[data-testid="settings--integration-name"]').click().clear().type('cherry');
    cy.get('[data-testid="settings--namespace"]').click().clear().type('example');

    // save changes
    cy.saveMenuModal();

    // CHECK that steps are still there and toolbar contains new name
    cy.get('[data-testid="viz-step-timer"]').should('be.visible');
    cy.get('[data-testid="kaoto-toolbar--name"]').should('have.text', 'cherry');

    // verify that source code editor contains new values
    cy.openCodeEditor();
    cy.get('.code-editor').contains('timer');

    // reopen modal
    cy.openSettingsModal();

    // CHECK that value is changed accordingly
    cy.get('[data-testid="settings--integration-name"]').should('have.value', 'cherry');
    cy.get('[data-testid="settings--namespace"]').should('have.value', 'example');
  });

  it('Settings helper and close', () => {
    // test the helper
    cy.get('[data-testid="settings--integration-type-helper-btn"]').click();
    cy.get('[data-testid="settings--integration-type-helper"]').should('be.visible');
    cy.get('[data-testid="settings--integration-type-helper-btn"]').click();
    cy.get('[data-testid="settings-modal--cancel"]').click();
    cy.get('[data-testid="settings-modal"]').should('not.exist');
  });

  it('Insert description', () => {
    const description = 'Sample description';
    cy.get('[data-testid="settings--description"]').type(description);
    cy.saveMenuModal();
    cy.openSettingsModal();

    // CHECK that value is changed accordingly
    cy.get('[data-testid="settings--description"]').should('have.text', description);
  });

  it('Only shows relevant DSLs', () => {
    cy.get('[data-testid="settings--integration-type"]')
      .select('Integration')
      .should('have.value', 'Integration');
    cy.saveMenuModal(true);
    cy.replaceEmptyStepMiniCatalog('timer');
    cy.openSettingsModal();

    // CHECK that KameletBinding DSL should not be available to select
    cy.get('[data-testid="settings--integration-type__KameletBinding"]').should('not.exist');
  });

  it('updates the DSL', () => {
    // close modal
    cy.get('[data-testid="settings--integration-type"]')
      .select('Integration')
      .should('have.value', 'Integration');
    cy.saveMenuModal(true);

    cy.replaceEmptyStepMiniCatalog('kamelet');

    // reopen modal, make changes, save and close again
    cy.openSettingsModal();

    // select Kamelet
    cy.get('[data-testid="settings--integration-type"]')
      .select('Kamelet')
      .should('have.value', 'Kamelet');

    cy.saveMenuModal(true);

    // CHECK that steps are still there
    cy.get('[data-testid="viz-step-kamelet"]').should('be.visible');

    // reopen modal, 
    cy.openSettingsModal();

    // CHECK that value is still Kamelet
    cy.get('[data-testid="settings--integration-type"]').should('have.value', 'Kamelet');
  });
});
