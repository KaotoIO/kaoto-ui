describe('3 step integration', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
  });

  it('add the step integration', () => {
    cy.get('.stepNode').contains('ADD A STEP').click({ force: true });

    // add timer-source via drag and drop from the catalog
    const dataTransfer = new DataTransfer();
    cy.get('#stepSearch').type('timer');
    cy.get('[data-testid="miniCatalog__stepItem--timer-source"]').click();

    // verify the code editor contains the new timer source step
    cy.get('[data-testid="toolbar-show-code-btn"]').click();
    cy.get('.code-editor').should('contain.text', 'timer-source');

    // add an action from the mini catalog
    cy.get('[data-testid="stepNode__appendStep-btn"]').click();
    cy.get('#stepSearch').type('extra').wait(1000);
    cy.get('[data-testid="miniCatalog__stepItem--extract-field-action"]').click();
    cy.get('.code-editor').should('contain.text', 'extract-field-action');

    // add kafka sink from the mini catalog
    cy.get('[data-testid="stepNode__appendStep-btn"]').click();
    cy.get('[data-testid="miniCatalog"]').should('be.visible');
    cy.get('#END').click({ force: true });
    cy.get('.pf-c-text-input-group__text-input').type('kafka-sink');
    cy.get('[data-testid="miniCatalog__stepItem--kafka-sink"]').click();

    // verify the code editor contains the new kafka sink step
    cy.get('.code-editor').should('contain.text', 'kafka-sink');

    // delete middle step
    cy.get('[data-testid="viz-step-extract-field-action"]').trigger('mouseover');
    cy.get(
      '[data-testid="viz-step-extract-field-action"] > [data-testid="configurationTab__deleteBtn"]'
    ).click({ force: true });

    // open step catalog, replace timer-source with postgresql-source
    cy.get('[data-testid="toolbar-step-catalog-btn"]').click();
    cy.get('#stepSearch').click().clear();
    cy.get('.pf-l-gallery').scrollTo('0%', '75%');
    cy.get('.pf-c-card__title').contains('postgresql-source').trigger('dragstart', {
      dataTransfer,
    });
    cy.get('[data-testid="react-flow-wrapper"]').contains('timer-source').trigger('drop', {
      dataTransfer,
    });

    // verify the visualization has the correct steps (postgresql-source)
    // and configuration loads as expected
    cy.get('[data-testid="viz-step-postgresql-source"]').click();
    cy.get('[data-testid="configurationTab"]').should('be.visible');
    cy.get('[data-testid="kaoto-left-drawer"]').within(() => {
      cy.get('.pf-c-drawer__close > .pf-c-button').click();
    });
    cy.get('[data-testid="kaoto-right-drawer"]').within(() => {
      cy.get('.pf-c-drawer__close > .pf-c-button').click();
    });
    // verify inserting a step updates both the visualization and code editor,
    // and opens the mini catalog without issues
    cy.get('[data-testid="stepNode__insertStep-btn"]').click();
    cy.get('[data-testid="miniCatalog"]').should('be.visible');
    cy.get('[data-testid="miniCatalog__search--input"]').type('chunk-template-action');
    cy.get('[data-testid="miniCatalog__stepItem--chunk-template-action"]').click();

    // verify the code editor has the correct steps (postgresql-source, log, kafka-sink)
    cy.get('[data-testid="toolbar-show-code-btn"]').click();
    cy.get('.code-editor')
      .should('contain.text', 'postgresql-source')
      .and('contain.text', 'chunk-template')
      .and('contain.text', 'kafka-sink');
  });
});
