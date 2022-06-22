describe('Test for deleting steps', () => {
    beforeEach(() => {
        let url = Cypress.config().baseUrl;
        cy.visit(url);
    });
    it('loads the YAML editor', () => {
        cy.get('.code-editor').click();
        cy.get('button').contains('Start from scratch').click();
        cy.fixture('delete.txt')
            .then((user) => {
                cy.get('.code-editor').type(user);
                cy.wait(1000)
                cy.get('[data-testid="react-flow-wrapper"]').contains('chuck-norris').click();
                cy.wait(1000)
                cy.get('[data-ouia-component-id="OUIA-Generated-Button-danger-1"]').click()
                cy.get('.code-editor').contains('chuck-norris-s..').should('not.exist');
                cy.get('[data-testid="react-flow-wrapper"]').contains('chunk-template..').click()
                cy.get('[data-ouia-component-id="OUIA-Generated-Button-danger-5"]').click()
                cy.get('[data-testid="react-flow-wrapper"]').contains('kafka-sink').click()
                cy.get('[data-ouia-component-id="OUIA-Generated-Button-danger-9"]').click()
            });
    })
});
