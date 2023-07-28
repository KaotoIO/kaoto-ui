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
    cy.isomorphicGet('[data-testid=toolbar-metadata-beans-btn]').click();
    cy.isomorphicGet('[data-testid=metadata-add-beans-btn]').eq(0).click();
    cy.isomorphicGet(`input[name="name"]`).type('test');
    cy.isomorphicGet(`input[name="type"]`).type('org.acme');
    // Click outside the "type" input, to display the value
    cy.isomorphicGet('.metadataEditorModal').click(0, 0);

    cy.isomorphicGet('[data-testid="metadata-row-0"]').as('row');
    cy.isomorphicGet('@row').find('td').eq(0).should('contain', 'test');
    cy.isomorphicGet('@row').find('td').eq(1).should('contain', 'org.acme');

    cy.isomorphicGet('[data-testid=properties-add-string-property--btn]').eq(0).click();
    cy.isomorphicGet('[data-testid=properties--placeholder-name-input]').click();
    cy.isomorphicGet('[data-testid=properties--placeholder-name-input]').type('property1');

    cy.isomorphicGet('[data-testid=properties--placeholder-value-input]').click();
    cy.isomorphicGet('[data-testid=properties--placeholder-value-input]').type('value1');

    cy.isomorphicGet('[data-testid=properties--placeholder-property-edit-confirm--btn]').click();
    cy.isomorphicGet('[data-testid=metadata-beans-save-btn]').click();
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

    cy.isomorphicGet('[data-testid=toolbar-metadata-beans-btn]').click();
    cy.isomorphicGet('[data-testid="metadata-row-0"]').click();

    cy.isomorphicGet('[data-testid="properties-add-object-property--btn"]').click();

    cy.isomorphicGet('[data-testid="properties--placeholder-name-input"]').click();
    cy.isomorphicGet('[data-testid="properties--placeholder-name-input"]').type('object');

    cy.isomorphicGet('[data-testid=properties--placeholder-property-edit-confirm--btn]').click();

    cy.isomorphicGet('[data-testid="properties-add-string-property-object-btn"]').click();
    cy.isomorphicGet('[data-testid="properties-object-placeholder-name-input"]').click();
    cy.isomorphicGet('[data-testid="properties-object-placeholder-name-input"]').type(
      'object-prop',
    );

    cy.isomorphicGet('[data-testid=properties-object-placeholder-value-input]').click();
    cy.isomorphicGet('[data-testid=properties-object-placeholder-value-input]')
      .clear()
      .type('newvalue');

    cy.isomorphicGet(
      '[data-testid=properties-object-placeholder-property-edit-confirm--btn]',
    ).click();
    cy.isomorphicGet('[data-testid=metadata-beans-save-btn]').click();

    // CHECK the bean was reflected in the code editor
    cy.checkCodeSpanLine('object:');
    cy.checkCodeSpanLine('object-prop: newvalue');
  });

  it('User edits a bean using the bean editor modal', () => {
    cy.uploadFixture('Beans.yaml');

    cy.isomorphicGet('[data-testid=toolbar-metadata-beans-btn]').click();
    cy.isomorphicGet('[data-testid="metadata-row-0"]').click();

    cy.isomorphicGet(`input[name="name"]`).clear().type('rename');
    cy.isomorphicGet(`input[name="type"]`).clear().type('com.emca');

    cy.isomorphicGet('.metadataEditorModal').click(0, 0);

    cy.isomorphicGet('[data-testid="metadata-row-0"]').as('row');
    cy.isomorphicGet('@row').find('td').eq(0).should('contain', 'rename');
    cy.isomorphicGet('@row').find('td').eq(1).should('contain', 'com.emca');

    cy.isomorphicGet('[data-testid=properties-add-string-property--btn]').eq(0).click();
    cy.isomorphicGet('[data-testid=properties--placeholder-name-input]').click();
    cy.isomorphicGet('[data-testid=properties--placeholder-name-input]').clear().type('newtest');

    cy.isomorphicGet('[data-testid=properties--placeholder-value-input]').click();
    cy.isomorphicGet('[data-testid=properties--placeholder-value-input]').clear().type('newvalue');

    cy.isomorphicGet('[data-testid=properties--placeholder-property-edit-confirm--btn]').click();
    cy.isomorphicGet('[data-testid=metadata-beans-save-btn]').click();

    // CHECK the bean was reflected in the code editor
    cy.checkCodeSpanLine('- beans:');
    cy.checkCodeSpanLine('- name: rename');
    cy.checkCodeSpanLine('type: com.emca');
    cy.checkCodeSpanLine('properties:');
    cy.checkCodeSpanLine('newtest: newvalue');
  });

  it('User deletes a bean using the bean editor modal', () => {
    cy.uploadFixture('Beans.yaml');

    cy.isomorphicGet('[data-testid=toolbar-metadata-beans-btn]').click();
    cy.isomorphicGet('[data-testid="metadata-row-0"]').click();

    cy.isomorphicGet('[data-testid=metadata-delete-0-btn]').click();
    cy.isomorphicGet('[data-testid="metadata-row-0"]').as('row');

    cy.isomorphicGet('@row').find('td').eq(0).should('contain', 'test2');
    cy.isomorphicGet('@row').find('td').eq(1).should('contain', 'org.acme');

    cy.isomorphicGet('[data-testid="metadata-row-1"]').should('not.exist');
  });

  it('User deletes bean properties using the bean editor modal', () => {
    cy.uploadFixture('Beans.yaml');

    cy.isomorphicGet('[data-testid=toolbar-metadata-beans-btn]').click();
    cy.isomorphicGet('[data-testid="metadata-row-0"]').click();

    cy.isomorphicGet('[data-testid="properties-property1-delete-property1-btn"]').click();

    cy.isomorphicGet('[data-testid=metadata-beans-save-btn]').click();

    // CHECK the bean change was reflected in the code editor
    // CURRENTLY BLOCKED BY - https://github.com/KaotoIO/kaoto-ui/issues/2168
    cy.checkCodeSpanLine('property1: value1', 0);
    cy.checkCodeSpanLine('properties: {}');
  });
});
