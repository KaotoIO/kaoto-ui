describe('Test for deleting steps', () => {
    beforeEach(() => {
        let url = Cypress.config().baseUrl;
        cy.visit(url);
    });
    it('loads the YAML editor', () => {
        cy.get('[data-testid="toolbar-show-code-btn"]').click(); 
        cy.get('.code-editor').click();
        cy.get('button').contains('Start from scratch').click();
        cy.fixture('delete.txt')
            .then((user) => {
                cy.get('.code-editor').type(user);
                cy.wait(1000)
                cy.get('[data-testid="react-flow-wrapper"]').contains('chuck-norris').click();
                cy.wait(1000)
                cy.get(':nth-child(2) > .pf-c-button').click()
                cy.get('.code-editor').contains('chuck-norris-s..').should('not.exist');
                cy.get('[data-testid="react-flow-wrapper"]').contains('chunk-template..').click()
                cy.get(':nth-child(2) > .pf-c-button').click()
                cy.get('[data-testid="react-flow-wrapper"]').contains('kafka-sink').click()
                cy.get(':nth-child(2) > .pf-c-button').click()
            });
    })
});
