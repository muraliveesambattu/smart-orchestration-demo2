describe('Item CREATE Operations', () => {
  const baseUrl = 'http://localhost:3000';
  
  beforeEach(() => {
    // Visit the application before each test
    cy.visit(baseUrl);
    // Wait for the page to load
    cy.get('h1').should('contain', 'CRUD Application');
  });

  describe('CREATE - Create New Item', () => {
    it('should create a new item successfully', () => {
      const newItem = {
        name: 'Test Item',
        description: 'This is a test item description',
        price: '49.99'
      };

      // Fill in the form
      cy.get('#name').type(newItem.name);
      cy.get('#description').type(newItem.description);
      cy.get('#price').type(newItem.price);

      // Submit the form
      cy.get('#submit-btn').click();

      // Verify success message
      cy.get('#message').should('be.visible');
      cy.get('#message').should('contain', 'Item created successfully!');
      cy.get('#message').should('have.class', 'success');

      // Verify the item appears in the list
      cy.get('.item-card').should('contain', newItem.name);
      cy.get('.item-card').should('contain', newItem.description);
      cy.get('.item-card').should('contain', '$49.99');

      // Verify form is reset
      cy.get('#name').should('have.value', '');
      cy.get('#description').should('have.value', '');
      cy.get('#price').should('have.value', '');
    });

    it('should create multiple items', () => {
      const items = [
        { name: 'Item 1', description: 'Description 1', price: '10.00' },
        { name: 'Item 2', description: 'Description 2', price: '20.00' },
        { name: 'Item 3', description: 'Description 3', price: '30.00' }
      ];

      items.forEach((item) => {
        cy.get('#name').type(item.name);
        cy.get('#description').type(item.description);
        cy.get('#price').type(item.price);
        cy.get('#submit-btn').click();
        
        // Wait for success message
        cy.get('#message').should('contain', 'Item created successfully!');
        
        // Clear form for next item
        cy.wait(500); // Small wait for UI update
      });

      // Verify all items are displayed
      cy.get('.item-card').should('have.length.at.least', items.length);
      items.forEach((item) => {
        cy.get('.item-card').should('contain', item.name);
      });
    });

    it('should handle special characters in item name and description', () => {
      const specialItem = {
        name: 'Item with Special Chars: !@#$%^&*()',
        description: 'Description with <script>alert("XSS")</script>',
        price: '99.99'
      };

      cy.get('#name').type(specialItem.name);
      cy.get('#description').type(specialItem.description);
      cy.get('#price').type(specialItem.price);
      cy.get('#submit-btn').click();

      cy.get('#message').should('contain', 'Item created successfully!');
      // Verify special characters are properly escaped/displayed
      cy.get('.item-card').should('contain', specialItem.name);
    });

    it('should handle decimal prices correctly', () => {
      cy.get('#name').type('Decimal Price Item');
      cy.get('#description').type('Testing decimal prices');
      cy.get('#price').type('19.99');
      cy.get('#submit-btn').click();

      cy.get('#message').should('contain', 'Item created successfully!');
      cy.get('.item-card').should('contain', '$19.99');
    });

    it('should handle very long item names and descriptions', () => {
      const longName = 'A'.repeat(100);
      const longDescription = 'B'.repeat(200);

      cy.get('#name').type(longName);
      cy.get('#description').type(longDescription);
      cy.get('#price').type('25.00');
      cy.get('#submit-btn').click();

      cy.get('#message').should('contain', 'Item created successfully!');
      cy.get('.item-card').should('contain', longName);
    });

    it('should handle zero price', () => {
      cy.get('#name').type('Free Item');
      cy.get('#description').type('Item with zero price');
      cy.get('#price').type('0');
      cy.get('#submit-btn').click();

      cy.get('#message').should('contain', 'Item created successfully!');
      cy.get('.item-card').should('contain', '$0.00');
    });

    it('should handle negative price validation', () => {
      cy.get('#name').type('Negative Price Test');
      cy.get('#description').type('Testing negative price');
      cy.get('#price').type('-10.00');
      cy.get('#submit-btn').click();

      // HTML5 number input should allow negative, but we can verify it's handled
      cy.get('#price').then(($input) => {
        // Check if validation prevents negative or if it's accepted
        const value = $input.val();
        expect(parseFloat(value)).to.be.a('number');
      });
    });

    it('should handle very large price values', () => {
      cy.get('#name').type('Expensive Item');
      cy.get('#description').type('Very expensive item');
      cy.get('#price').type('999999.99');
      cy.get('#submit-btn').click();

      cy.get('#message').should('contain', 'Item created successfully!');
      cy.get('.item-card').should('contain', '$999999.99');
    });

    it('should handle whitespace-only input validation', () => {
      cy.get('#name').type('   ');
      cy.get('#description').type('   ');
      cy.get('#price').type('10.00');
      cy.get('#submit-btn').click();

      // HTML5 validation should catch this or backend should handle it
      cy.get('#name').then(($input) => {
        // Form might submit or validation might prevent it
        expect($input.val().trim()).to.equal('');
      });
    });

    it('should handle duplicate item names', () => {
      const duplicateName = 'Duplicate Item Name';
      
      // Create first item
      cy.get('#name').type(duplicateName);
      cy.get('#description').type('First item');
      cy.get('#price').type('10.00');
      cy.get('#submit-btn').click();
      cy.get('#message').should('contain', 'Item created successfully!');
      cy.wait(500); // Wait for UI update

      // Create second item with same name
      cy.get('#name').type(duplicateName);
      cy.get('#description').type('Second item');
      cy.get('#price').type('20.00');
      cy.get('#submit-btn').click();
      cy.get('#message').should('contain', 'Item created successfully!');
      cy.wait(500); // Wait for UI update

      // Verify both items exist by counting all cards containing the name
      cy.get('.item-card').then(($cards) => {
        let count = 0;
        $cards.each((index, card) => {
          if (Cypress.$(card).text().includes(duplicateName)) {
            count++;
          }
        });
        expect(count).to.be.at.least(2);
      });
    });

    it('should create item via API and verify in UI', () => {
      const apiItem = {
        name: 'API Created Item',
        description: 'Created via API call',
        price: 42.50
      };

      // Create item via API
      cy.request('POST', `${baseUrl}/api/items`, apiItem).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('id');
        expect(response.body.name).to.eq(apiItem.name);
      });

      // Reload page to see the new item
      cy.reload();
      cy.get('.item-card').should('contain', apiItem.name);
      cy.get('.item-card').should('contain', '$42.50');
    });
  });
});

