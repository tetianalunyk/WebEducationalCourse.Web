
beforeEach(() => {
    cy.visit('http://localhost:8000/login');
});

describe('Login', () => {
    it('should correctly filled all fields', () => {
        cy.get('#email').type("test@gmail.com");
        cy.get('#password').type("1234");

        cy.get('#email').should('have.value', 'test@gmail.com');
        cy.get('#password').should('have.value', '1234');
    });

    it('should show error when Email or Password is empty', () => {
        cy.get('#login').click();

        cy.contains('This field cannot be empty!').should('be.visible');
    });

    it('should show error when Email is not valid', () => {
        cy.get('#email').type("test@@gmail.com");
        cy.get('#password').type("1234");

        cy.get('#login').click();

        cy.contains("Email is not valid!").should('be.visible');
    });

    it('should correctly login user', () => {
        cy.get('#email').type("tetianka@gmail.com");
        cy.get('#password').type("1234");

        cy.get('#login').click();

        cy.contains('Email is not valid!').should('not.exist');
        cy.contains('This field cannot be empty!').should('not.exist');
        cy.contains('tetianka@gmail.com').should('be.visible');
    });

})