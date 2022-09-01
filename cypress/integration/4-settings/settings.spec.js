describe('Settings', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
    cy.get('.pf-c-toolbar__content-section').click();
    cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click();
    cy.get('[data-testid="kaotoToolbar-kebab__settings"]').click();

    // TODO: drop a kamelet step here to test with
  });

  /**
   * TESTS MODAL ACTIONS (e.g. opening, closing)
   */
  it('loads the settings modal', () => {
    cy.get('[data-testid="settings-modal"]').should('be.visible');
  });

  it('closes the settings modal', () => {
    cy.get('[data-ouia-component-id="OUIA-Generated-Modal-small-2-ModalBoxCloseButton"]').click();

    // to test something isn't visible, we need to be able to select it
    // so, we must use 'not.exist' instead of 'not.be.visible'
    // see: https://github.com/cypress-io/cypress/issues/9348
    cy.get('[data-testid="settings-modal"]').should('not.exist');
  });

  it('cancels the settings modal', () => {
    cy.get('[data-testid="settings-modal--cancel"]').click();
    cy.get('[data-testid="settings-modal"]').should('not.exist');
  });

  /**
   * NAME
   */
  it('validates the integration name', () => {
    cy.get('[data-testid="settings--integration-name"]').click().clear();
    // validation appears
    cy.get('#integration-name-helper').should('be.visible');

    // user shouldn't be able to save without having an integration name
    cy.get('[data-testid="settings-modal--save"]').should('be.disabled');
  });

  it.skip('updates the integration name', () => {
    // close modal
    cy.get('[data-testid="settings-modal--cancel"]').click();
    cy.get('[data-testid="settings-modal"]').should('not.exist');

    // add a step
    cy.get('.stepNode').contains('ADD A STEP').click({ force: true });
    const dataTransfer = new DataTransfer();
    cy.get('#stepSearch').type('timer');
    cy.get('[data-testid="catalog-step-timer-source"]').trigger('dragstart', {
      dataTransfer,
    });
    cy.get('.stepNode').trigger('drop', {
      dataTransfer,
      force: true,
    });

    // reopen modal, make changes
    cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click({ force: true });
    cy.get('[data-testid="kaotoToolbar-kebab__settings"]').click();
    cy.get('[data-testid="settings--integration-name"]').click().clear().type('cherry');
    cy.get('[data-testid="settings-modal--save"]').click();

    // TODO: verify that steps are still there
    // TODO: verify that toolbar contains new name
    // TODO: verify that source code editor contains new name

    // TODO: verify that modal still contains new name
    // reopen modal, verify that value is changed accordingly
    cy.get('.pf-c-toolbar__content-section').click();
    cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click({ force: true });
    cy.get('[data-testid="kaotoToolbar-kebab__settings"]').click({ force: true });
  });

  /**
   * DESCRIPTION
   */
  it('updates the description', () => {
    // save and close modal
    cy.get('[data-testid="settings-modal--save"]').click();
    // verify that steps are still there
    // reopen modal, verify that value is changed accordingly
  });

  it('shows a helper for integration type', () => {
    cy.get('[data-testid="settings--integration-type-helper-btn"]').click();
    cy.get('[data-testid="settings--integration-type-helper"]').should('be.visible');
  });

  /**
   * NAMESPACE
   */
  it.skip('updates the namespace', () => {
    // TODO: test validation
    // save new namespace
    cy.get('[data-testid="settings--namespace"]').click().clear().type('example');
    cy.get('[data-testid="settings-modal--save"]').click();

    // reopen modal, verify that namespace is still "example"
    cy.get('.pf-c-alert__action > .pf-c-button').click();
    cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click({ force: true });
    cy.get('[data-testid="kaotoToolbar-kebab__settings"]').click({ force: true });

    // TODO: field assertion
    // cy.get('[data-testid="settings--namespace"]');
  });

  /**
   * DSL ("INTEGRATION TYPE")
   */
  it.skip('only shows relevant DSLs', () => {
    // for example, if using anything other than 'kamelet' as a step, KameletBinding
    // should not be available in the DSL dropdown
    // close modal
    cy.get('[data-testid="settings-modal--cancel"]').click();
    cy.get('[data-testid="settings-modal"]').should('not.exist');

    // add a non-Kamelet step
    cy.get('.stepNode').contains('ADD A STEP').click({ force: true });
    const dataTransfer = new DataTransfer();
    cy.get('#stepSearch').type('timer');
    cy.get('[data-testid="catalog-step-timer-source"]').trigger('dragstart', {
      dataTransfer,
    });
    cy.get('.stepNode').trigger('drop', {
      dataTransfer,
      force: true,
    });

    // reopen modal, make changes, save and close again
    cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click({ force: true });
    // cy.get('[data-testid="kaotoToolbar-kebab__settings"]').click();

    // TODO: attempt to select integration type
    // cy.select('[data-testid="settings--integration-type"]');

    // Kamelet DSL should not be available to select
    // cy.get('[data-testid="settings--integration-type__Kamelet"]').should('not.exist');
  });

  it.skip('updates the DSL', () => {
    // close modal
    cy.get('[data-testid="settings-modal--cancel"]').click();
    cy.get('[data-testid="settings-modal"]').should('not.exist');

    // add a Kamelet step
    cy.get('.stepNode').contains('ADD A STEP').click({ force: true });
    const dataTransfer = new DataTransfer();
    cy.get('#stepSearch').type('kamelet');
    cy.get('[data-testid="catalog-step-kamelet:source"]').trigger('dragstart', {
      dataTransfer,
    });
    cy.get('.stepNode').trigger('drop', {
      dataTransfer,
      force: true,
    });

    // reopen modal, make changes, save and close again
    cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click();
    cy.get('[data-testid="kaotoToolbar-kebab__settings"]').click();

    cy.get('[data-testid="settings--integration-type"]').click();

    // TODO: select Kamelet
    // cy.get('[data-testid="settings--integration-type__Kamelet"]').select();

    cy.get('[data-testid="settings-modal--save"]').click();
    cy.get('.pf-c-alert__action > .pf-c-button').click();

    // TODO: verify that steps are still there

    // reopen modal, verify that value is still changed accordingly
    cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click();
    cy.get('[data-testid="kaotoToolbar-kebab__settings"]').click();

    // TODO: assertion that DSL is still Kamelet
    // cy.get('[data-testid="settings--integration-type"]');
  });
});
