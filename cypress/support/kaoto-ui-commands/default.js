import 'cypress-file-upload';

Cypress.Commands.add('openHomePage', () => {
    let url = Cypress.config().baseUrl;
    cy.visit(url);
    cy.wait('@getDSLs');
    cy.wait('@getViewDefinitions');
});

Cypress.Commands.add('zoomOutXTimes', (times) => {
    times = times ?? 1;
    Cypress._.times(times, () => {
        cy.get('.react-flow__controls-button.react-flow__controls-zoomout').click()
    })
});

Cypress.Commands.add('waitVisualizationUpdate', () => {
    cy.wait('@getIntegration');
    cy.wait('@getDSLs');
    cy.wait('@getViewDefinitions');
});
