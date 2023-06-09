describe('Test for Multi route actions from the canvas', () => {
  beforeEach(() => {
    cy.intercept('/v1/deployments*').as('getDeployments');
    cy.intercept('/v1/steps/id/*').as('getStepDetails');
    cy.intercept('/v1/integrations/dsls').as('getDSLs');
    cy.intercept('/v1/view-definitions').as('getViewDefinitions');
    cy.intercept('POST', '/v2/integrations*').as('getIntegration');

    cy.openHomePage();
    cy.zoomOutXTimes(3);
  });

  it('User changes route type in the canvas', () => {
    cy.switchIntegrationType('Integration');
    cy.get('.pf-c-chip__text').contains('Integration');
    cy.switchIntegrationType('Camel Route');
    cy.get('.pf-c-chip__text').contains('Camel Route');
    cy.switchIntegrationType('Kamelet');
    cy.get('.pf-c-chip__text').contains('Kamelet');
    cy.switchIntegrationType('KameletBinding');
    cy.get('.pf-c-chip__text').contains('KameletBinding');
  });

  it('User shows and hides a route', () => {
    cy.switchIntegrationType('Integration');
    cy.createNewRoute();
    cy.createNewRoute();

    cy.get('[data-testid="flows-list-route-count"]').should("have.text", "1/3");

    cy.toggleRouteVisibility(0);
    cy.toggleRouteVisibility(1);

    cy.get('[data-testid="flows-list-route-count"]').should("have.text", "3/3");
    cy.get('[data-testid^="rf__node-node_0"]').should('have.length', 3);

    cy.toggleRouteVisibility(0);
    cy.toggleRouteVisibility(1);
    cy.toggleRouteVisibility(2);

    cy.get('[data-testid="flows-list-route-count"]').should("have.text", "0/3");
    cy.get('[data-testid^="rf__node-node_0"]').should('have.length', 0);
  });

  it('User deletes routes in the canvas till there are no routes', () => {
    cy.switchIntegrationType('Integration');
    cy.createNewRoute();
    cy.createNewRoute();
    cy.showAllRoutes();

    cy.get('[data-testid="flows-list-route-count"]').should("have.text", "3/3");

    cy.deleteRoute(0);
    cy.deleteRoute(0);
    cy.deleteRoute(0);
    cy.get('[data-testid^="rf__node-node_0"]').should('have.length', 0);
    cy.get('[data-testid="flows-list-empty-state"]').should('have.length', 1);
    cy.get('[data-testid="flows-list-route-count"]').should("have.text", "0/0");

    cy.get('[data-testid="flows-list-empty-state"]').within(() => {
      cy.get('h4.pf-c-title').should('have.text', "There's no routes to show");
    });
  });

  it('User creates multiple routes in canvas', () => {
    cy.switchIntegrationType('Integration');
    cy.createNewRoute();
    cy.createNewRoute();

    cy.hideAllRoutes();
    cy.get('[data-testid^="rf__node-node_0"]').should('have.length', 0);
    cy.toggleRouteVisibility(0);

    cy.replaceEmptyStepMiniCatalog('timer');
    cy.appendStepMiniCatalog('timer', 'log');
    cy.hideAllRoutes();

    cy.toggleRouteVisibility(1);
    cy.replaceEmptyStepMiniCatalog('timer');
    cy.appendStepMiniCatalog('timer', 'log');
    cy.hideAllRoutes();

    cy.toggleRouteVisibility(2);
    cy.replaceEmptyStepMiniCatalog('timer');
    cy.appendStepMiniCatalog('timer', 'log');

    cy.showAllRoutes();
    cy.get('[data-testid="viz-step-timer"]').should('have.length', 3);
    cy.get('[data-testid="viz-step-log"]').should('have.length', 3);
    cy.get('[data-testid^="rf__node-node_0"]').should('have.length', 3);
  });
});
