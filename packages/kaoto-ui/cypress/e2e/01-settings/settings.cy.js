describe('Settings', () => {
  beforeEach(() => {
    cy.intercept('/v1/deployments*').as('getDeployments');
    cy.intercept('/v1/integrations/dsls').as('getDSLs');
    cy.intercept('/v1/view-definitions').as('getViewDefinitions');
    cy.intercept('/v2/integrations*').as('getIntegration');

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
    cy.switchIntegrationType('Integration');
    cy.replaceEmptyStepMiniCatalog('timer');
    cy.openSettingsModal();

    // test validation
    cy.get('[data-testid="settings--integration-name"]').click().clear();
    cy.get('[data-testid="settings--integration-description"]').click().clear();
    cy.get('[data-testid="settings--namespace"]').click().clear();
    cy.get('#namespace-helper').should('be.visible');
    cy.get('[data-testid="settings-modal--save"]').should('be.disabled');

    // make changes
    cy.get('[data-testid="settings--integration-name"]').click().clear().type('cherry');
    cy.get('[data-testid="settings--integration-description"]')
      .click()
      .clear()
      .type('some description');
    cy.get('[data-testid="settings--namespace"]').click().clear().type('example');

    // save changes
    cy.saveMenuModal();

    // CHECK that steps are still there and toolbar contains new name
    cy.get('[data-testid="viz-step-timer"]').should('be.visible');

    // verify that source code editor contains new values
    cy.openCodeEditor();
    cy.get('.code-editor').contains('timer');

    // reopen modal
    cy.openSettingsModal();

    // CHECK that value is changed accordingly
    cy.get('[data-testid="settings--integration-name"]').should('have.value', 'cherry');
    cy.get('[data-testid="settings--integration-description"]').should(
      'have.value',
      'some description',
    );
    cy.get('[data-testid="settings--namespace"]').should('have.value', 'example');
  });

  /** Skipped until https://github.com/KaotoIO/kaoto-ui/issues/1902 is done */
  it.skip('Insert description', () => {
    const description = 'Sample description';
    cy.get('[data-testid="settings--description"]').type(description);
    cy.saveMenuModal();
    cy.openSettingsModal();

    // CHECK that value is changed accordingly
    cy.get('[data-testid="settings--description"]').should('have.text', description);
  });
});
