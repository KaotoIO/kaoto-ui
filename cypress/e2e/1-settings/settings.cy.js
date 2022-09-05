describe('Settings', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.intercept('/v1/integrations/dsls').as('getDSLs');
    cy.intercept('/v1/view-definitions').as('getViewDefinitions');
    cy.intercept('/v1/integrations?dsl=*').as('getIntegration');
    cy.intercept('/v1/deployments*').as('getDeployments');

    cy.visit(url);
    cy.viewport(2000, 1000);

    cy.get('.pf-c-toolbar__content-section').click();
    cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click();
    cy.get('[data-testid="kaotoToolbar-kebab__settings"]').click();
  });

  // MODAL ACTIONS (e.g. opening, closing)
  it('loads the settings modal', () => {
    cy.get('[data-testid="settings-modal"]').should('be.visible');
    cy.get('[data-ouia-component-id="OUIA-Generated-Modal-small-2-ModalBoxCloseButton"]').click();

    // to test something isn't visible, we need to be able to select it
    // so, we must use 'not.exist' instead of 'not.be.visible'
    // see: https://github.com/cypress-io/cypress/issues/9348
    cy.get('[data-testid="settings-modal"]').should('not.exist');

    // reopen to test other close button
    cy.get('.pf-c-toolbar__content-section').click();
    cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click();
    cy.get('[data-testid="kaotoToolbar-kebab__settings"]').click();
    cy.get('[data-testid="settings-modal--cancel"]').click();
    cy.get('[data-testid="settings-modal"]').should('not.exist');
  });

  // FIELDS
  it('updates the fields', () => {
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
    });

    cy.wait('@getDSLs');
    cy.wait('@getViewDefinitions');

    // reopen modal
    cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click();
    cy.get('[data-testid="kaotoToolbar-kebab__settings"]').click();

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
    cy.get('[data-testid="settings-modal--save"]').click();

    // verify that steps are still there
    cy.get('[data-testid="catalog-step-timer-source"]').should('be.visible');

    // verify that toolbar contains new name
    cy.get('[data-testid="kaoto-toolbar--name"]').should('have.text', 'cherry');

    // verify that source code editor contains new values
    cy.get('[data-testid="toolbar-show-code-btn"]').click();
    cy.get('.code-editor').contains('timer-source');

    // reopen modal, verify that value is changed accordingly
    cy.wait('@getIntegration');
    cy.get('.pf-c-alert__action > .pf-c-button').click();
    cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click();
    cy.get('[data-testid="kaotoToolbar-kebab__settings"]').click();

    // field assertion
    cy.get('[data-testid="settings--integration-name"]').should('have.value', 'cherry');
    cy.get('[data-testid="settings--namespace"]').should('have.value', 'example');
  });

  // DSL ("INTEGRATION TYPE")
  // for example, if using anything other than 'kamelet' as a step, KameletBinding
  // should not be available in the DSL dropdown
  it('only shows relevant DSLs', () => {
    // test the helper
    cy.get('[data-testid="settings--integration-type-helper-btn"]').click();
    cy.get('[data-testid="settings--integration-type-helper"]').should('be.visible');

    // close modal
    cy.get('[data-testid="settings-modal--cancel"]').click();
    cy.get('[data-testid="settings-modal"]').should('not.exist');

    // add a non-Kamelet step
    cy.get('.stepNode').contains('ADD A STEP').click();
    const dataTransfer = new DataTransfer();
    cy.get('#stepSearch').type('timer');
    cy.get('[data-testid="catalog-step-timer-source"]').trigger('dragstart', {
      dataTransfer,
    });
    cy.get('.stepNode').trigger('drop', {
      dataTransfer,
    });
    cy.wait('@getDSLs');
    cy.wait('@getViewDefinitions');

    // reopen modal, make changes, save and close again
    cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click();
    cy.get('[data-testid="kaotoToolbar-kebab__settings"]').click();

    // attempt to select integration type
    cy.get('[data-testid="settings--integration-type"]').select('KameletBinding');

    // Kamelet DSL should not be available to select
    cy.get('[data-testid="settings--integration-type__Kamelet"]').should('not.exist');
  });

  // UPDATE THE DSL ("INTEGRATION TYPE")
  it('updates the DSL', () => {
    // close modal
    cy.get('[data-testid="settings-modal--cancel"]').click();
    cy.get('[data-testid="settings-modal"]').should('not.exist');

    // add a Kamelet step
    cy.get('.stepNode').contains('ADD A STEP').click();
    const dataTransfer = new DataTransfer();
    cy.get('#stepSearch').type('kamelet');
    cy.get('[data-testid="catalog-step-kamelet:source"]').trigger('dragstart', {
      dataTransfer,
    });
    cy.get('.stepNode').trigger('drop', {
      dataTransfer,
    });

    cy.wait('@getDSLs');
    cy.wait('@getViewDefinitions');

    cy.get('[data-testid="viz-step-kamelet:source"]').should('be.visible');

    // reopen modal, make changes, save and close again
    cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click();
    cy.get('[data-testid="kaotoToolbar-kebab__settings"]').click();

    // select Kamelet
    cy.get('[data-testid="settings--integration-type"]').select('Kamelet');

    cy.get('[data-testid="settings-modal--save"]').click();
    cy.get('.pf-c-alert__action > .pf-c-button').click();

    // verify that steps are still there
    cy.get('[data-testid="viz-step-kamelet:source"]').should('be.visible');

    // reopen modal, verify that value is still changed accordingly
    cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click();
    cy.get('[data-testid="kaotoToolbar-kebab__settings"]').click();

    // assert that DSL is still Kamelet
    cy.get('[data-testid="settings--integration-type"]').should('have.value', 'Kamelet');
  });
});
