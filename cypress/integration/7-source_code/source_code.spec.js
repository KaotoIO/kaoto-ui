describe('source code and drag and drop', () => {
    beforeEach(() => {
        cy.visit('http://localhost:1337');
    });
    it('loads the YAML editor', () => {
        const dataTransfer = new DataTransfer();
        cy.get('.code-editor').click();
        cy.get('button').contains('Start from scratch').click();
        cy.fixture('editor.txt')
            .then((user) => {
                cy.get('.code-editor').type(user);
                cy.wait(2000)
                cy.get('[data-testid="openCatalogButton"] > svg').click();
                cy.get('#stepSearch').type('timer')
                cy.get('.pf-c-card__body').trigger('dragstart', {
                    dataTransfer
                });
                cy.get('[data-id="dndnode_1"]').trigger('drop', {
                    dataTransfer
                });
                cy.get('.pf-c-drawer__close > .pf-c-button').click();
                cy.get('.code-editor')
                    .contains('timer-source')
                    .should('have.text', 'timer-source', '{backspace}')
                    .type('{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}kafka-', { delay: 500 });
            })
    })
})
