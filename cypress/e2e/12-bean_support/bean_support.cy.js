describe('Test for Bean support', () => {
  beforeEach(() => {
    cy.intercept('/v1/deployments*').as('getDeployments');
    cy.intercept('/v1/steps/id/*').as('getStepDetails');
    cy.intercept('/v1/integrations/dsls').as('getDSLs');
    cy.intercept('/v1/view-definitions').as('getViewDefinitions');
    cy.intercept('POST', '/v2/integrations*').as('getIntegration');

    cy.openHomePage();
    cy.zoomOutXTimes(3);
  });

  it('User creates a new bean using the bean editor modal', () => {
    cy.get('[data-testid=toolbar-metadata-beans-btn]').click();
    cy.get('[data-testid=metadata-add-beans-btn]').eq(0).click();
    cy.get(`input[name="name"]`).type('test');
    cy.get(`input[name="type"]`).type('org.acme');
    // Click outside the "type" input, to display the value
    cy.get('.metadataEditorModal').click(0, 0);

    cy.get('[data-testid="metadata-row-0"]').as('row');
    cy.get('@row').find('td').eq(0).should('contain', 'test');
    cy.get('@row').find('td').eq(1).should('contain', 'org.acme');

    cy.get('[data-testid=properties-add-string-property--btn]').eq(0).click();
    cy.get('[data-testid=properties--placeholder-name-input]').click();
    cy.get('[data-testid=properties--placeholder-name-input]').type('property1');

    // Click outside the "name" input, to display the "value" input
    cy.get('.metadataEditorModal').click(0, 0);
    cy.get('[data-testid=properties-property1-value-input]').click();
    cy.get('[data-testid=properties-property1-value-input]').type('value1');

    cy.get('[data-ouia-component-id="OUIA-Generated-Modal-large-2-ModalBoxCloseButton"]').click();
    cy.openCodeEditor();

    // CHECK the bean was reflected in the code editor
    cy.checkCodeSpanLine('- beans:');
    cy.checkCodeSpanLine('- name: test');
    cy.checkCodeSpanLine('type: org.acme');
    cy.checkCodeSpanLine('properties:');
    cy.checkCodeSpanLine('property1: value1');
  });

  it('User inserts new object property using the bean editor modal', () => {
    cy.uploadFixture('Beans.yaml');

    cy.get('[data-testid=toolbar-metadata-beans-btn]').click();
    cy.get('[data-testid="metadata-row-0"]').click();

    cy.get('[data-testid="properties-add-object-property--btn"]').click();

    cy.get('[data-testid="properties--placeholder-name-input"]').click();
    cy.get('[data-testid="properties--placeholder-name-input"]').type('object');

    // Click outside the "name" input, to display the object property handling options
    cy.get('.metadataEditorModal').click(0, 0);

    cy.get('[data-testid="properties-add-string-property-object-btn"]').click();
    cy.get('[data-testid="properties-object-placeholder-name-input"]').click();
    cy.get('[data-testid="properties-object-placeholder-name-input"]').type('object-prop');

    // Click outside the "name" input, to display the object property value input
    cy.get('.metadataEditorModal').click(0, 0);

    cy.get('[data-testid=properties-object-object-prop-value-input]').click();
    cy.get('[data-testid=properties-object-object-prop-value-input]').clear().type('newvalue');

    cy.get('[data-ouia-component-id="OUIA-Generated-Modal-large-2-ModalBoxCloseButton"]').click();

    // CHECK the bean was reflected in the code editor
    cy.checkCodeSpanLine('object:');
    cy.checkCodeSpanLine('object-prop: newvalue');
  });

  it.skip('User edits a bean using the bean editor modal', () => {
    cy.uploadFixture('Beans.yaml');

    cy.get('[data-testid=toolbar-metadata-beans-btn]').click();
    cy.get('[data-testid="metadata-row-0"]').click();

    cy.get(`input[name="name"]`).clear().type('rename');
    cy.get(`input[name="type"]`).clear().type('com.emca');

    cy.get('.metadataEditorModal').click(0, 0);

    cy.get('[data-testid="metadata-row-0"]').as('row');
    cy.get('@row').find('td').eq(0).should('contain', 'rename');
    cy.get('@row').find('td').eq(1).should('contain', 'com.emca');

    cy.get('[data-testid=properties-add-string-property--btn]').eq(0).click();
    cy.get('[data-testid=properties-property1-name-input]').click();
    cy.get('[data-testid=properties-property1-name-input]').clear().type('newtest');

    // Click outside the "name" input, to display the "value" input
    cy.get('.metadataEditorModal').click(0, 0);
    cy.get('[data-testid=properties-newtest-value-input]').click();
    cy.get('[data-testid=properties-newtest-value-input]').clear().type('newvalue');

    // CURRENTLY BLOCKED BY - https://github.com/KaotoIO/kaoto-ui/issues/2168
    cy.get('[data-ouia-component-id="OUIA-Generated-Modal-large-2-ModalBoxCloseButton"]').click();

    // CHECK the bean was reflected in the code editor
    cy.checkCodeSpanLine('- beans:');
    cy.checkCodeSpanLine('- name: rename');
    cy.checkCodeSpanLine('type: com.emca');
    cy.checkCodeSpanLine('properties:');
    cy.checkCodeSpanLine('newtest: newvalue');
  });

  it('User deletes a bean using the bean editor modal', () => {
    cy.uploadFixture('Beans.yaml');

    cy.get('[data-testid=toolbar-metadata-beans-btn]').click();
    cy.get('[data-testid="metadata-row-0"]').click();

    cy.get('[data-testid=metadata-delete-0-btn]').click();
    cy.get('[data-testid="metadata-row-0"]').as('row');

    cy.get('@row').find('td').eq(0).should('contain', 'test2');
    cy.get('@row').find('td').eq(1).should('contain', 'org.acme');

    cy.get('[data-testid="metadata-row-1"]').should('not.exist');
  });

  it.skip('User deletes bean properties using the bean editor modal', () => {
    cy.uploadFixture('Beans.yaml');

    cy.get('[data-testid=toolbar-metadata-beans-btn]').click();
    cy.get('[data-testid="metadata-row-0"]').click();

    cy.get('[data-testid="properties-delete-property-property1-btn"]').click();

    cy.get('[data-ouia-component-id="OUIA-Generated-Modal-large-2-ModalBoxCloseButton"]').click();

    // CHECK the bean change was reflected in the code editor
    // CURRENTLY BLOCKED BY - https://github.com/KaotoIO/kaoto-ui/issues/2168
    cy.checkCodeSpanLine('property1: value1', 0);
    cy.checkCodeSpanLine('properties: {}');
  });
});
