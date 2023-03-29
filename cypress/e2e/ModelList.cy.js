/* eslint-disable cypress/no-unnecessary-waiting */
Cypress.Commands.add('login', () => {
    cy.visit('http://localhost:8000/login')
    cy.get('#email').type("tetianka@gmail.com");
    cy.get('#password').type("1234");

    cy.get('#login').click();
});

beforeEach(() => {
    cy.login();
    cy.visit('http://localhost:8000/management/models');
});

describe('ModelList', () => {

    it('should show a list of models', () => {
        cy.contains('test 1').should('be.visible');
        cy.contains('test 2').should('be.visible');
        cy.contains('test 3').should('be.visible');
    });

    it('should filter a list of models', () => {
        cy.get('#filter').clear().type('3');

        cy.wait(500).contains('test 3').should('be.visible');
        cy.contains('test 1').should('not.exist');
        cy.contains('test 2').should('not.exist');
    });

    it('should open form for model editing with correct data', () => {
        cy.contains('td', 'test 1').parent('tr').children('td').find('button[aria-label="Edit"]').click();

        cy.get('#name').should('have.value', 'test 1');
        cy.get('#description').should('have.value', 'test 1');
        cy.get('.MuiChip-label').should('have.text', 'Tag 1');

        cy.contains('Model Profile').find('button[aria-label="close"]').click();
    });

    it('should correctly filled all fields during creating new model', () => {
        cy.contains('New').click();
        cy.get('#name').type("test 5");
        cy.get('#description').type("Description");
        cy.get('#tags').type("Tag 5").get('li[data-option-index="0"]').click();

        cy.get('#name').should('have.value', 'test 5');
        cy.get('#description').should('have.value', 'Description');
        cy.get('.MuiChip-label').should('have.text', 'Tag 5');

        cy.contains('Model Profile').find('button[aria-label="close"]').click();
    });

    it('should show error when fields are empty', () => {
        cy.contains('New').click();

        cy.contains('Save changes').click();

        cy.contains("The form isn't filled correct").should('be.visible');
        cy.contains("At least one tag should be added!").should('be.visible');
        cy.contains("This field cannot be empty!").should('be.visible');

        cy.contains('Model Profile').find('button[aria-label="close"]').click();
    });

    it('should correctly add new model', () => {
        cy.contains('New').click();
        cy.get('#name').type("TestName");
        cy.get('#description').type("TestDescription");
        cy.get('#tags').type("Tag 5").get('li[data-option-index="0"]').click();
        cy.get('#file').selectFile('./cypress/mocks/test.dwg');
        cy.contains('Save changes').click();

        cy.contains('TestName').should('be.visible');
    });

    it('should correctly update user', () => {
        cy.contains('TestName').parent('tr').children('td').find('button[aria-label="Edit"]').click();
        cy.get('#name').clear().type("TestNameUpdated");
        cy.get('#description').clear().type("TestDescriptionUpdated");
        cy.get('#tags').type("Tag 5").get('li[data-option-index="0"]').click();
        cy.contains('Save changes').click();

        cy.contains('TestNameUpdated').should('be.visible');
        cy.get('#name').should('have.value', 'TestNameUpdated');
        cy.get('#description').should('have.value', 'TestDescriptionUpdated');
    });

    it('should correctly delete user', () => {
        cy.contains('td', 'TestNameUpdated').parent('tr').children('td').find('button[aria-label="Delete"]').click();

        cy.get('button').contains('Delete').click();
        cy.contains('TestNameUpdated').should('not.exist');
    });

});

afterEach(() => {
    cy.get('#logout').click();
});