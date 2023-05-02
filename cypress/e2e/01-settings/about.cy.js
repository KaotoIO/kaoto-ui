describe('Settings: About', () => {
    beforeEach(() => {
        cy.intercept('/v1/integrations/dsls').as('getDSLs');
        cy.intercept('/v1/view-definitions').as('getViewDefinitions');
        cy.intercept('/v1/integrations*').as('getIntegration');

        cy.openHomePage();
        cy.openAboutModal();
    });

    it('Close and reopen about modal', () => {
        // Check that the modal is open
        cy.get('[data-testid="about-modal"').should('be.visible');

        cy.closeAboutModal();

        // Check that the modal is closed
        cy.get('[data-testid="about-modal"').should('not.exist');

        cy.openAboutModal();

        // Check that the modal is open
        cy.get('[data-testid="about-modal"').should('be.visible');
    });

    it('Check that the about modal contains the correct information', () => {
        // Check that the modal is open
        cy.get('[data-testid="about-modal"').should('be.visible');

        // Check that the Kaoto logo is visible and loaded
        cy.get('[alt="Kaoto Logo"]')
            .should('be.visible')
            .and(($img) => {
                expect($img[0].naturalWidth).to.be.greaterThan(0)
            });

        // Check the backend version

        cy.request(`${Cypress.env('KAOTO_API')}/v1/capabilities/version`).then((response) => {
            cy.get('[data-testid="about-backend-version"').should('have.text', response.body);
        });

        // Check the frontend version
        cy.readFile('package.json').then(Package => {
            cy.get('[data-testid="about-frontend-version"').should('have.text', Package.version);
        })

        // Check information Grid
        cy.get('dl > dt:first').should('have.text', 'Frontend Version')
            .next().should('have.attr', 'data-testid', 'about-frontend-version')
            .next().should('have.text', 'Backend Version')
            .next().should('have.attr', 'data-testid', 'about-backend-version');
    });
});
