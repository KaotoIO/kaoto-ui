describe('Test for deleting steps', () => {
    beforeEach(() => {
        cy.visit('http://localhost:1337');
    });
    it('loads the YAML editor', () => {
        cy.get('.code-editor').click();
        cy.get('button').contains('Start from scratch').click();
        cy.fixture('deleting.txt')
            .then((user) => {
                cy.get('.code-editor').type(user);
                cy.wait(1000)
                cy.get('.stepNode').contains('chuck-norris-s..').click()
                cy.wait(1000)
                cy.get('[data-ouia-component-id="OUIA-Generated-Button-danger-1"]').click()
                cy.get('.code-editor').contains('chuck-norris-s..').should('not.exist');
                cy.get('.stepNode').contains('chunk-template..').click()
                cy.get('[data-ouia-component-id="OUIA-Generated-Button-danger-5"]').click()
                cy.get('.stepNode').contains('kafka-sink').click()
                cy.get('[data-ouia-component-id="OUIA-Generated-Button-danger-9"]').click()
            });
    })
});
