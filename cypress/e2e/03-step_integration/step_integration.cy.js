describe('3 step integration', () => {
  beforeEach(() => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
  });

  it('add the step integration', () => {
    cy.get('.stepNode').contains('ADD A STEP').click({ force: true });

    // add timer via drag and drop from the catalog
    const dataTransfer = new DataTransfer();
    cy.get('#stepSearch').type('timer');
    cy.get('[data-testid="miniCatalog__stepItem--timer"]').click();

    // verify the code editor contains the new timer step
    cy.get('[data-testid="toolbar-show-code-btn"]').click();
    cy.get('.code-editor').should('contain.text', 'timer');

    // add an action from the mini catalog
    cy.get('[data-testid="stepNode__appendStep-btn"]').click();
    cy.get('#stepSearch').type('aggre').wait(1000);
    cy.get('[data-testid="miniCatalog__stepItem--aggregate"]').click();
    cy.get('.code-editor').should('contain.text', 'aggregate');

    // add kafka from the mini catalog
    cy.get('[data-testid="stepNode__appendStep-btn"]').click();
    cy.get('[data-testid="miniCatalog"]').should('be.visible');
    cy.get('#END').click({ force: true });
    cy.get('.pf-c-text-input-group__text-input').type('kafka');
    cy.get('[data-testid="miniCatalog__stepItem--kafka"]').click();

    // verify the code editor contains the new kafka step
    cy.get('.code-editor').should('contain.text', 'kafka');

    // delete middle step
    cy.get('[data-testid="viz-step-aggregate"]').trigger('mouseover');
    cy.get(
      '[data-testid="viz-step-aggregate"] > [data-testid="configurationTab__deleteBtn"]'
    ).click({ force: true });

    // open step catalog, replace timer with debezium-postgres
    cy.get('[data-testid="toolbar-step-catalog-btn"]').click();
    cy.get('#stepSearch').click().clear();
    cy.get('.pf-l-gallery').scrollTo('0%', '75%');
    cy.get('.pf-c-card__title').contains('debezium-postgres').trigger('dragstart', {
      dataTransfer,
    });
    cy.get('[data-testid="react-flow-wrapper"]').contains('timer').trigger('drop', {
      dataTransfer,
    });

    // verify the visualization has the correct steps (debezium-postgres)
    // and configuration loads as expected
    cy.get('[data-testid="viz-step-debezium-postgres"]').click();
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
    cy.get('[data-testid="miniCatalog__search--input"]').type('chunk');
    cy.get('[data-testid="miniCatalog__stepItem--chunk"]').click();

    // verify the code editor has the correct steps (debezium-postgres, chunk, kafka)
    cy.get('[data-testid="toolbar-show-code-btn"]').click();
    cy.get('.code-editor')
      .should('contain.text', 'debezium-postgres')
      .and('contain.text', 'chunk')
      .and('contain.text', 'kafka');
  });
});
