/* eslint-disable cypress/no-unnecessary-waiting */
import path from 'path';
beforeEach(() => {
    cy.visit('http://localhost:8000/models');
});

describe('ModelList', () => {

    it('should show a list of models', () => {
        cy.contains('test 1').should('be.visible');
        cy.contains('test 2').should('be.visible');
        cy.contains('test 3').should('be.visible');
    });

    it('should filter a list of models by tags', () => {
        cy.get('#tags').clear().type('Tag 3').get('li[data-option-index="0"]').click();

        cy.contains('test 3').should('be.visible');
        cy.contains('test 1').should('not.exist');
        cy.contains('test 2').should('not.exist');
    });

    it('should filter a list of models', () => {
        cy.get('#filter').clear().type('3');

        cy.contains('test 3').should('be.visible');
        cy.contains('test 1').should('not.exist');
        cy.contains('test 2').should('not.exist');
    });

    it('should show model history', () => {
        cy.contains('test 4').parent('tr').children('td').find('button[aria-label="expand row"]').click();

        cy.contains('test 4').should('be.visible');
        cy.contains('Tanya Shchur').should('be.visible');
        cy.contains('30.03.2023 18:49').should('be.visible');
    });

    it('should download file', () => {
        cy.contains('test 1').parent('tr').children('td').find('button[aria-label="Download"]').click();

        const currentFolder = __dirname;
        cy.readFile(path.join(currentFolder, "../cypress/downloads/test 1.png"));
    });

    it('should show current model in history for newly created models', () => {
        cy.visit('http://localhost:8000/login');

        cy.get('#email').type("tetianka@gmail.com");
        cy.get('#password').type("1234");

        cy.get('#login').click();

        cy.visit('http://localhost:8000/management/models');

        cy.contains('New').click();

        cy.get('#name').type("TestName");
        cy.get('#description').type("TestDescription");
        cy.get('#tags').type("Tag 5").get('li[data-option-index="0"]').click();
        cy.get('#file').selectFile('./cypress/mocks/test.png');
        cy.contains('Save changes').click();

        cy.contains('TestName').should('be.visible');

        const newDate = new Date();
        const year = newDate.getFullYear();
        const day = ("0" + newDate.getDate()).slice(-2)
        const month = ("0" + (newDate.getMonth() + 1)).slice(-2)
        const hour = ("0" + newDate.getHours()).slice(-2)
        const minutes = ("0" + newDate.getMinutes()).slice(-2)

        const currentDate = `${day}.${month}.${year} ${hour}:${minutes}`;

        cy.visit('http://localhost:8000/models');
        cy.contains('TestName').parent('tr').children('td').find('button[aria-label="expand row"]').click();

        cy.contains('TestName').should('be.visible');
        cy.contains('Tanya Shchur').should('be.visible');
        cy.contains(currentDate).should('be.visible');

        cy.visit('http://localhost:8000/management/models');
        cy.contains('td', 'TestName').parent('tr').children('td').find('button[aria-label="Delete"]').click();

        cy.get('button').contains('Delete').click();

        cy.get('#logout').click();
    });
});
