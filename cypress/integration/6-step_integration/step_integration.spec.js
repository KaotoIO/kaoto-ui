import '@4tw/cypress-drag-drop';

describe('3 step integration', () => {
    beforeEach(() => {
        cy.visit('http://localhost:1337');
    });

    it('add the step integration', () => {
        const dataTransfer = new DataTransfer();
        cy.get('[data-testid="openCatalogButton"]').click();
        cy.get('#stepSearch').type('timer')
        cy.get('.pf-c-card__body').trigger('dragstart', {
            dataTransfer
        });
        cy.get('.stepNode').trigger('drop', {
            dataTransfer
        });
        cy.get('[data-testid="stepCatalog"]');
        cy.get('.pf-c-drawer__close').click();
        cy.get('.code-editor').should('contain.text', 'timer-source');

        cy.get('.stepNode__Add').click();
        cy.get('#stepSearch').type('extra').wait(1000);
        cy.get('[data-ouia-component-id="OUIA-Generated-Button-tertiary-1"]').click();
        cy.get('.code-editor').should('contain.text', 'extract-field-action');

        cy.get('[data-ouia-component-id="OUIA-Generated-Button-plain-12"]').click();
        cy.get('#stepSearch').type('kafka-sink');
        cy.get('[data-testid="miniCatalog"] > .pf-c-button').click();
        cy.get('.code-editor').should('contain.text', 'kafka-sink');

        cy.get('[ data-id="dndnode_11" ]').click();
        cy.get('[data-ouia-component-id="OUIA-Generated-Button-danger-1"]').click();
        cy.get('[data-testid="openCatalogButton"]').click();
        cy.get('#stepSearch').click().clear();
        cy.get('.pf-l-gallery').scrollTo('0%', '75%');
        cy.get('[data-ouia-component-id="OUIA-Generated-Card-112"]').trigger('dragstart', {
            dataTransfer
        });
        cy.get('[data-id="dndnode_13"]').trigger('drop', {
            dataTransfer
        });

        cy.get('.pf-c-drawer__close > .pf-c-button').click();
        cy.get('[data-id="dndnode_17"]').click();
        cy.get('[data-testid="configurationTab"]').click();
        cy.get('.pf-c-drawer__close > .pf-c-button').click();
        cy.get('.code-editor').should('contain.text', 'postgresql-source');
        cy.get('.code-editor').should('contain.text', 'kafka-sink');
    });
});
