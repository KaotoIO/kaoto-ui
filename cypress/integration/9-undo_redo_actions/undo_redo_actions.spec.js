describe('Test for undo/redo actions on code-editor', () => {
    beforeEach(() => {
        cy.visit('http://localhost:1337');
    });

    it('loads the YAML editor', () => {
        const dataTransfer = new DataTransfer();
        cy.get('.code-editor').click();
        cy.get('button').contains('Start from scratch').click();
        cy.fixture('undo_redo.txt')
            .then((user) => {
                cy.get('.code-editor').type(user);
                cy.wait(2000)
                cy.get('.code-editor')
                    .contains('kafka-source')
                    .should('have.text', 'kafka-source', '{backspace}')
                    .type('{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}timer-', { delay: 500 });
                    cy.get('[aria-label="Undo change"] > svg').click()
                    cy.get('[aria-label="Undo change"] > svg').click()
                    cy.get('[data-testid="react-flow-wrapper"]').contains('kafka-source')
                    cy.get('[aria-label="Redo change"] > svg').click()
                    cy.get('[aria-label="Redo change"] > svg').click()
                    cy.get('[data-testid="react-flow-wrapper"]').contains('timer-source')
                })           
            })
    })
