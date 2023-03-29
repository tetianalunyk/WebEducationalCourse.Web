Cypress.Commands.add('login', () => {
  cy.visit('http://localhost:8000/login')
  cy.get('#email').type("tetianka@gmail.com");
  cy.get('#password').type("1234");

  cy.get('#login').click();
});

beforeEach(() => {
  cy.login();
  cy.visit('http://localhost:8000/management/users');
});

describe('UserList', () => {
  it('should correctly filled all fields', () => {
    cy.contains('New').click();
    cy.get('#firstName').type("TestName");
    cy.get('#lastName').type("TestSurname");
    cy.get('#email').type("TestEmail@gmail.com");
    cy.get('#roles').type("Admin").get('li[data-option-index="0"]').click();

    cy.get('#firstName').should('have.value', 'TestName');
    cy.get('#lastName').should('have.value', 'TestSurname');
    cy.get('#email').should('have.value', 'TestEmail@gmail.com');
    cy.get('.MuiChip-label').should('have.text', 'Admin');

    cy.contains('User Profile').find('button[aria-label="close"]').click();
  });

  it('should show error when First Name or Last Name contain not only letters', () => {
    cy.contains('New').click();
    cy.get('#firstName').type("Test123");
    cy.get('#lastName').type("Test123");

    cy.contains('Save changes').click();

    cy.contains('This field must contain letters only!').should('be.visible');
    cy.contains("The form isn't filled correct").should('be.visible');

    cy.contains('User Profile').find('button[aria-label="close"]').click();
  });

  it('should show error when fields are empty', () => {
    cy.contains('New').click();

    cy.contains('Save changes').click();

    cy.contains("The form isn't filled correct").should('be.visible');

    cy.contains('User Profile').find('button[aria-label="close"]').click();
  });

  it('should show a list of users', () => {
    cy.contains('Tanya').should('be.visible');
    cy.contains('Sasha').should('be.visible');
    cy.contains('Olya').should('be.visible');
  });

  it('should filter a list of users', () => {
    cy.get('#filter').clear().type('tan');

    cy.contains('Tanya').should('be.visible');
    cy.contains('Sasha').should('not.exist');
    cy.contains('Olya').should('not.exist');
  });

  it('should open form for user editing with correct data', () => {
    cy.get('#filter').type('tan');

    cy.contains('Tanya').parent('tr').children('td').find('button[aria-label="Edit"]').click();

    cy.get('#firstName').should('have.value', 'Tanya');
    cy.get('#lastName').should('have.value', 'Shchur');
    cy.get('#email').should('have.value', 'tetianka@gmail.com');

    cy.contains('User Profile').find('button[aria-label="close"]').click();
  });

  it('should correctly add new user', () => {
    cy.contains('New').click();
    cy.get('#firstName').type("TestName");
    cy.get('#lastName').type("TestSurname");
    cy.get('#email').type("TestEmail@gmail.com");
    cy.get('#password').type("1234");
    cy.get('#roles').type("Admin").get('li[data-option-index="0"]').click();
    cy.get('#profilePhoto').selectFile('./cypress/mocks/test.png');
    cy.contains('Save changes').click();

    cy.contains('TestName').should('be.visible');
  });

  it('should correctly update user', () => {
    cy.contains('TestName').parent('tr').children('td').find('button[aria-label="Edit"]').click();
    cy.get('#firstName').clear().type("TestNameUpdated");
    cy.get('#lastName').clear().type("TestSurnameUpdated");
    cy.get('#email').clear().type("TestEmailUpdated@gmail.com");
    cy.get('#password').type("1234");
    cy.get('#roles').clear().type("Super admin").get('li[data-option-index="0"]').click();
    cy.contains('Save changes').click();

    cy.contains('TestNameUpdated').should('be.visible');
    cy.get('#firstName').should('have.value', 'TestNameUpdated');
    cy.get('#lastName').should('have.value', 'TestSurnameUpdated');
    cy.get('#email').should('have.value', 'TestEmailUpdated@gmail.com');
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