describe('Settings', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.intercept('/v1/integrations/dsls').as('getDSLs');
    cy.intercept('/v1/view-definitions').as('getViewDefinitions');
    cy.intercept('/v1/integrations?dsl=*').as('getIntegration');
    cy.intercept('/v1/deployments*').as('getDeployments');

    cy.visit(url);

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
    cy.get('#stepSearch').type('timer');
    cy.get('[data-testid="miniCatalog__stepItem--timer-source"]').click();

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
    cy.get('[data-testid="settings--integration-name"]')
      .click()
      .clear({ timeout: 6000 })
      .type('cherry', { delay: 500 });
    cy.get('[data-testid="settings--namespace"]')
      .click()
      .clear({ timeout: 6000 })
      .type('example', { delay: 500 });

    // save changes
    cy.get('[data-testid="settings-modal--save"]').click();

    // verify that steps are still there
    cy.get('[data-testid="viz-step-timer-source"]').should('be.visible');

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

  it('Settings helper and close', () => {
    // test the helper
    cy.get('[data-testid="settings--integration-type-helper-btn"]').click();
    cy.get('[data-testid="settings--integration-type-helper"]').should('be.visible');
    cy.get('[data-testid="settings--integration-type-helper-btn"]').click();
    // close modal
    cy.get('[data-testid="settings-modal--cancel"]').click();
    cy.get('[data-testid="settings-modal"]').should('not.exist');
  });

  it('Insert description', () => {
    const description = 'Sample description';
    cy.get('[data-testid="settings--description"]').type(description);
    cy.get('[data-testid="settings-modal--save"]').click();

    cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click();
    cy.get('[data-testid="kaotoToolbar-kebab__settings"]').click();
    cy.get('[data-testid="settings--description"]').should('have.text', description);
  });

  // DSL ("INTEGRATION TYPE")
  // for example, if using anything other than 'kamelet' as a step, KameletBinding
  // should not be available in the DSL dropdown
  it('only shows relevant DSLs', () => {
    cy.get('[data-testid="settings--integration-type"]')
      .select('Integration')
      .should('have.value', 'Integration');
    cy.get('[data-testid="settings-modal--save"]').click();
    cy.get('[data-testid="settings-modal"]').should('not.exist');

    // add a non-Kamelet step
    cy.get('.stepNode').contains('ADD A STEP').click({ force: true });
    cy.get('#stepSearch').type('timer');
    cy.get('[data-testid="miniCatalog__stepItem--timer"]').click();

    cy.wait('@getDSLs');
    cy.wait('@getViewDefinitions');

    // reopen modal, make changes, save and close again
    cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click();
    cy.get('[data-testid="kaotoToolbar-kebab__settings"]').click();

    // KameletBinding DSL should not be available to select
    cy.get('[data-testid="settings--integration-type__KameletBinding"]').should('not.exist');
  });

  // UPDATE THE DSL ("INTEGRATION TYPE")
  it('updates the DSL', () => {
    // close modal
    cy.get('[data-testid="settings--integration-type"]')
      .select('Integration')
      .should('have.value', 'Integration');
    cy.get('[data-testid="settings-modal--save"]').click();
    cy.get('[data-testid="settings-modal"]').should('not.exist');

    // add a Kamelet step
    cy.get('.stepNode').contains('ADD A STEP').click({ force: true });
    cy.get('#stepSearch').type('kamelet');
    cy.get('[data-testid="miniCatalog__stepItem--kamelet"]').click();

    cy.wait('@getDSLs');
    cy.wait('@getViewDefinitions');

    cy.get('[data-testid="viz-step-kamelet"]').should('be.visible');

    // reopen modal, make changes, save and close again
    cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click();
    cy.get('[data-testid="kaotoToolbar-kebab__settings"]').click();

    // select Kamelet
    cy.get('[data-testid="settings--integration-type"]')
      .select('Kamelet')
      .should('have.value', 'Kamelet');

    cy.get('[data-testid="settings-modal--save"]').click();
    cy.get('.pf-c-alert__action > .pf-c-button').click();

    // verify that steps are still there
    cy.get('[data-testid="viz-step-kamelet"]').should('be.visible');

    // reopen modal, verify that value is still changed accordingly
    cy.get('[data-testid="toolbar-kebab-dropdown-btn"]').click();
    cy.get('[data-testid="kaotoToolbar-kebab__settings"]').click();

    // assert that DSL is still Kamelet
    cy.get('[data-testid="settings--integration-type"]').should('have.value', 'Kamelet');
  });
});
