describe('Location configurable of BaseUrl', () => {
    it('Location configurable of Baseurl', () => {
        let url = Cypress.config().baseUrl; 
        cy.visit(url); 
    });
});
