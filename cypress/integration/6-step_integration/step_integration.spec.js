describe('3 step integration', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
  });
  it('add the step integration', () => {
    cy.viewport(2000, 1000);
    cy.get('.stepNode').contains('ADD A STEP').click({ force: true });
    const dataTransfer = new DataTransfer();
    cy.get('#stepSearch').type('timer');
    cy.get(':nth-child(2) > .pf-c-card > .pf-l-grid > .pf-m-7-col > .pf-c-card__body').trigger(
      'dragstart',
      {
        dataTransfer,
      }
    );
    cy.get('.stepNode').trigger('drop', {
      dataTransfer,
    });
    cy.get('[data-testid="stepCatalog"]');
    cy.get('[data-testid="toolbar-show-code-btn"]').click();
    cy.get('.code-editor').should('contain.text', 'timer-source');
    cy.get('.stepNode__Add').click();
    cy.get('#stepSearch').type('extra').wait(1000);
    cy.get('[data-ouia-component-id="OUIA-Generated-Button-tertiary-1"]').click();
    cy.get('.code-editor').should('contain.text', 'extract-field-action');
    cy.get('.stepNode__Add').click();
    cy.get('#END').click({ force: true });
    cy.get('.pf-c-text-input-group__text-input').type('kafka-sink');
    cy.get('.pf-m-9-col').click();
    cy.get('.code-editor').should('contain.text', 'kafka-sink');
    cy.get('[data-testid="react-flow-wrapper"]').contains('extract-field-..').click();

    cy.get('[data-ouia-component-id="OUIA-Generated-Button-danger-1"]').click();
    cy.get('[data-testid="toolbar-step-catalog-btn"] > .pf-c-button__icon > svg').click();
    cy.get('#stepSearch').click().clear();
    cy.get('.pf-l-gallery').scrollTo('0%', '75%');
    cy.get('.pf-c-card__title').contains('postgresql-source').trigger('dragstart', {
      dataTransfer,
    });
    cy.get('[data-testid="react-flow-wrapper"]').contains('timer-source').trigger('drop', {
      dataTransfer,
    });

    cy.get('[data-testid="react-flow-wrapper"]').contains('postgresql-sou..').click();
    cy.get('[data-testid="configurationTab"]').click();
    cy.get('.pf-c-drawer__close > .pf-c-button > svg').click({ multiple: true });
    cy.get('[data-testid="toolbar-show-code-btn"]').click();
    cy.get('.code-editor').should('contain.text', 'postgresql-source');
    cy.get('.code-editor').should('contain.text', 'kafka-sink');
  });
});
