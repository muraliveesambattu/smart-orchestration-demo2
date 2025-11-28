describe('Form Validation Tests', () => {
  const baseUrl = 'http://localhost:3000';
  
  beforeEach(() => {
    cy.visit(baseUrl);
    // Wait for the page to load
    cy.get('h1').should('contain', 'CRUD Application');
  });

  describe('Form Validation', () => {
    it('should validate required fields when creating an item', () => {
      // Try to submit empty form
      cy.get('#submit-btn').click();

      // HTML5 validation should prevent submission
      cy.get('#name').then(($input) => {
        expect($input[0].validationMessage).to.not.be.empty;
      });
    });

    it('should validate name field is required', () => {
      cy.get('#description').type('Description without name');
      cy.get('#price').type('10.00');
      cy.get('#submit-btn').click();

      // HTML5 validation should prevent submission
      cy.get('#name:invalid').should('exist');
      cy.get('#name').then(($input) => {
        expect($input[0].validationMessage).to.not.be.empty;
      });
    });

    it('should validate description field is required', () => {
      cy.get('#name').type('Name without description');
      cy.get('#price').type('10.00');
      cy.get('#submit-btn').click();

      // HTML5 validation should prevent submission
      cy.get('#description:invalid').should('exist');
      cy.get('#description').then(($input) => {
        expect($input[0].validationMessage).to.not.be.empty;
      });
    });

    it('should validate price field is required', () => {
      cy.get('#name').type('Name without price');
      cy.get('#description').type('Description without price');
      cy.get('#submit-btn').click();

      // HTML5 validation should prevent submission
      cy.get('#price:invalid').should('exist');
      cy.get('#price').then(($input) => {
        expect($input[0].validationMessage).to.not.be.empty;
      });
    });

    it('should validate price accepts only numbers', () => {
      cy.get('#name').type('Price Validation Test');
      cy.get('#description').type('Testing price validation');
      cy.get('#price').type('abc');
      cy.get('#submit-btn').click();

      // HTML5 validation should prevent submission
      cy.get('#price:invalid').should('exist');
    });

    it('should allow decimal values in price field', () => {
      cy.get('#name').type('Decimal Price Test');
      cy.get('#description').type('Testing decimal input');
      // Use 2 decimal places as the input has step="0.01"
      cy.get('#price').type('12.34');
      cy.get('#submit-btn').click();

      cy.get('#message').should('contain', 'Item created successfully!');
      // Price should be displayed
      cy.get('.item-card').should('contain', 'Decimal Price Test');
      cy.get('.item-card').should('contain', '$12.34');
    });
  });
});

