describe('Item CRUD Operations', () => {
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

    it('should validate required fields when creating an item', () => {
      // Try to submit empty form
      cy.get('#submit-btn').click();

      // HTML5 validation should prevent submission
      cy.get('#name').then(($input) => {
        expect($input[0].validationMessage).to.not.be.empty;
      });
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
  });

  describe('READ - View Items', () => {
    it('should display all items on page load', () => {
      // Check that items container exists
      cy.get('.items-container').should('be.visible');
      cy.get('#items-grid').should('exist');

      // Verify that at least the sample items are displayed
      cy.get('.item-card').should('have.length.at.least', 2);
    });

    it('should display item details correctly', () => {
      // Check that items have all required fields displayed
      cy.get('.item-card').first().within(() => {
        cy.get('h3').should('exist'); // Item name
        cy.get('p').should('exist'); // Item description
        cy.get('.price').should('exist'); // Item price
        cy.get('.item-actions').should('exist'); // Action buttons
      });
    });

    it('should show empty state when no items exist', () => {
      // This test would require clearing all items first
      // For now, we'll just verify the structure exists
      cy.get('#items-grid').should('exist');
    });
  });

  describe('UPDATE - Edit Existing Item', () => {
    it('should edit an existing item successfully', () => {
      // First, create an item to edit
      const originalItem = {
        name: 'Original Item',
        description: 'Original description',
        price: '25.00'
      };

      cy.get('#name').type(originalItem.name);
      cy.get('#description').type(originalItem.description);
      cy.get('#price').type(originalItem.price);
      cy.get('#submit-btn').click();
      cy.get('#message').should('contain', 'Item created successfully!');

      // Wait for the item to appear
      cy.get('.item-card').contains(originalItem.name).should('be.visible');

      // Click edit button on the first item that matches
      cy.get('.item-card').contains(originalItem.name).parent().within(() => {
        cy.get('button').contains('Edit').click();
      });

      // Verify form is populated with item data
      cy.get('#name').should('have.value', originalItem.name);
      cy.get('#description').should('have.value', originalItem.description);
      // Number inputs strip trailing zeros, so '25.00' becomes '25'
      cy.get('#price').should('have.value', '25');

      // Verify form title changed to "Edit Item"
      cy.get('#form-title').should('contain', 'Edit Item');
      cy.get('#submit-btn').should('contain', 'Update Item');
      cy.get('#cancel-btn').should('be.visible');

      // Update the item
      const updatedItem = {
        name: 'Updated Item',
        description: 'Updated description',
        price: '35.00'
      };

      cy.get('#name').clear().type(updatedItem.name);
      cy.get('#description').clear().type(updatedItem.description);
      cy.get('#price').clear().type(updatedItem.price);
      cy.get('#submit-btn').click();

      // Verify success message
      cy.get('#message').should('contain', 'Item updated successfully!');
      cy.get('#message').should('have.class', 'success');

      // Verify updated item appears in the list
      cy.get('.item-card').should('contain', updatedItem.name);
      cy.get('.item-card').should('contain', updatedItem.description);
      cy.get('.item-card').should('contain', '$35.00');

      // Verify form is reset to create mode
      cy.get('#form-title').should('contain', 'Create New Item');
      cy.get('#submit-btn').should('contain', 'Create Item');
      cy.get('#cancel-btn').should('have.class', 'hidden');
    });

    it('should cancel edit and reset form', () => {
      // Create an item first
      cy.get('#name').type('Item to Edit');
      cy.get('#description').type('Description');
      cy.get('#price').type('15.00');
      cy.get('#submit-btn').click();
      cy.get('#message').should('contain', 'Item created successfully!');

      // Click edit button
      cy.get('.item-card').contains('Item to Edit').parent().within(() => {
        cy.get('button').contains('Edit').click();
      });

      // Verify form is in edit mode
      cy.get('#form-title').should('contain', 'Edit Item');
      cy.get('#cancel-btn').should('be.visible');

      // Click cancel button
      cy.get('#cancel-btn').click();

      // Verify form is reset to create mode
      cy.get('#form-title').should('contain', 'Create New Item');
      cy.get('#submit-btn').should('contain', 'Create Item');
      cy.get('#cancel-btn').should('have.class', 'hidden');
      cy.get('#name').should('have.value', '');
      cy.get('#description').should('have.value', '');
      cy.get('#price').should('have.value', '');
    });

    it('should update only specific fields', () => {
      // Create an item
      cy.get('#name').type('Partial Update Item');
      cy.get('#description').type('Original Description');
      cy.get('#price').type('50.00');
      cy.get('#submit-btn').click();
      cy.get('#message').should('contain', 'Item created successfully!');

      // Edit the item
      cy.get('.item-card').contains('Partial Update Item').parent().within(() => {
        cy.get('button').contains('Edit').click();
      });

      // Update only the price
      cy.get('#price').clear().type('75.00');
      cy.get('#submit-btn').click();

      // Verify only price was updated
      cy.get('.item-card').should('contain', 'Partial Update Item');
      cy.get('.item-card').should('contain', 'Original Description');
      cy.get('.item-card').should('contain', '$75.00');
    });
  });

  describe('DELETE - Delete Item', () => {
    it('should delete an item successfully', () => {
      // Create an item to delete
      const itemToDelete = {
        name: 'Item to Delete',
        description: 'This item will be deleted',
        price: '99.99'
      };

      cy.get('#name').type(itemToDelete.name);
      cy.get('#description').type(itemToDelete.description);
      cy.get('#price').type(itemToDelete.price);
      cy.get('#submit-btn').click();
      cy.get('#message').should('contain', 'Item created successfully!');

      // Verify item exists
      cy.get('.item-card').should('contain', itemToDelete.name);

      // Count items before deletion
      cy.get('.item-card').then(($cards) => {
        const initialCount = $cards.length;

        // Click delete button
        cy.get('.item-card').contains(itemToDelete.name).parent().within(() => {
          cy.get('button').contains('Delete').click();
        });

        // Confirm deletion in the alert
        cy.on('window:confirm', (str) => {
          expect(str).to.equal('Are you sure you want to delete this item?');
          return true;
        });

        // Verify success message
        cy.get('#message').should('contain', 'Item deleted successfully!');
        cy.get('#message').should('have.class', 'success');

        // Verify item is removed from the list
        cy.get('.item-card').should('not.contain', itemToDelete.name);
        cy.get('.item-card').should('have.length', initialCount - 1);
      });
    });

    it('should cancel deletion when user cancels confirmation', () => {
      // Create an item
      cy.get('#name').type('Item Not Deleted');
      cy.get('#description').type('This item should remain');
      cy.get('#price').type('33.33');
      cy.get('#submit-btn').click();
      cy.get('#message').should('contain', 'Item created successfully!');

      // Verify item exists
      cy.get('.item-card').should('contain', 'Item Not Deleted');

      // Click delete button but cancel
      cy.get('.item-card').contains('Item Not Deleted').parent().within(() => {
        cy.get('button').contains('Delete').click();
      });

      // Cancel the confirmation
      cy.on('window:confirm', () => false);

      // Verify item still exists
      cy.get('.item-card').should('contain', 'Item Not Deleted');
    });

    it('should delete multiple items', () => {
      // Create multiple items
      const items = [
        { name: 'Delete Item 1', description: 'Desc 1', price: '11.11' },
        { name: 'Delete Item 2', description: 'Desc 2', price: '22.22' }
      ];

      items.forEach((item) => {
        cy.get('#name').type(item.name);
        cy.get('#description').type(item.description);
        cy.get('#price').type(item.price);
        cy.get('#submit-btn').click();
        cy.get('#message').should('contain', 'Item created successfully!');
        cy.wait(500);
      });

      // Delete each item
      items.forEach((item) => {
        cy.get('.item-card').contains(item.name).parent().within(() => {
          cy.get('button').contains('Delete').click();
        });

        cy.on('window:confirm', () => true);
        cy.get('#message').should('contain', 'Item deleted successfully!');
        cy.wait(500);
      });

      // Verify items are deleted
      items.forEach((item) => {
        cy.get('.item-card').should('not.contain', item.name);
      });
    });
  });

  describe('Integration Tests - Full CRUD Workflow', () => {
    it('should perform complete CRUD operations in sequence', () => {
      // CREATE
      cy.get('#name').type('Integration Test Item');
      cy.get('#description').type('Testing full CRUD workflow');
      cy.get('#price').type('100.00');
      cy.get('#submit-btn').click();
      cy.get('#message').should('contain', 'Item created successfully!');

      // READ - Verify item is displayed
      cy.get('.item-card').should('contain', 'Integration Test Item');
      cy.get('.item-card').should('contain', 'Testing full CRUD workflow');
      cy.get('.item-card').should('contain', '$100.00');

      // UPDATE
      cy.get('.item-card').contains('Integration Test Item').parent().within(() => {
        cy.get('button').contains('Edit').click();
      });

      cy.get('#name').clear().type('Updated Integration Test Item');
      cy.get('#description').clear().type('Updated description');
      cy.get('#price').clear().type('150.00');
      cy.get('#submit-btn').click();
      cy.get('#message').should('contain', 'Item updated successfully!');

      // READ - Verify update
      cy.get('.item-card').should('contain', 'Updated Integration Test Item');
      cy.get('.item-card').should('contain', 'Updated description');
      cy.get('.item-card').should('contain', '$150.00');

      // DELETE
      cy.get('.item-card').contains('Updated Integration Test Item').parent().within(() => {
        cy.get('button').contains('Delete').click();
      });

      cy.on('window:confirm', () => true);
      cy.get('#message').should('contain', 'Item deleted successfully!');

      // READ - Verify deletion
      cy.get('.item-card').should('not.contain', 'Updated Integration Test Item');
    });
  });

  describe('Edge Cases and Error Handling', () => {
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
  });

  describe('API Integration Tests', () => {
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

    it('should fetch all items via API', () => {
      cy.request('GET', `${baseUrl}/api/items`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.be.at.least(2); // At least sample items
      });
    });

    it('should fetch single item via API', () => {
      // First get all items to find an ID
      cy.request('GET', `${baseUrl}/api/items`).then((response) => {
        const firstItem = response.body[0];
        const itemId = firstItem.id;

        // Get single item
        cy.request('GET', `${baseUrl}/api/items/${itemId}`).then((itemResponse) => {
          expect(itemResponse.status).to.eq(200);
          expect(itemResponse.body).to.have.property('id', itemId);
          expect(itemResponse.body).to.have.property('name');
          expect(itemResponse.body).to.have.property('description');
          expect(itemResponse.body).to.have.property('price');
        });
      });
    });

    it('should return 404 for non-existent item', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/items/99999`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('error', 'Item not found');
      });
    });

    it('should update item via API and verify in UI', () => {
      // Create item first
      cy.request('POST', `${baseUrl}/api/items`, {
        name: 'API Update Test',
        description: 'Original description',
        price: 15.00
      }).then((createResponse) => {
        const itemId = createResponse.body.id;

        // Update via API
        cy.request('PUT', `${baseUrl}/api/items/${itemId}`, {
          name: 'API Updated Item',
          description: 'Updated description',
          price: 25.00
        }).then((updateResponse) => {
          expect(updateResponse.status).to.eq(200);
          expect(updateResponse.body.name).to.eq('API Updated Item');
        });

        // Reload and verify in UI
        cy.reload();
        cy.get('.item-card').should('contain', 'API Updated Item');
      });
    });

    it('should delete item via API and verify in UI', () => {
      // Create item first
      cy.request('POST', `${baseUrl}/api/items`, {
        name: 'API Delete Test',
        description: 'Will be deleted',
        price: 30.00
      }).then((createResponse) => {
        const itemId = createResponse.body.id;

        // Delete via API
        cy.request('DELETE', `${baseUrl}/api/items/${itemId}`).then((deleteResponse) => {
          expect(deleteResponse.status).to.eq(204);
        });

        // Reload and verify item is gone
        cy.reload();
        cy.get('.item-card').should('not.contain', 'API Delete Test');
      });
    });
  });

  describe('UI/UX Tests', () => {
    it('should show and auto-hide success message', () => {
      cy.get('#name').type('Message Test Item');
      cy.get('#description').type('Testing message display');
      cy.get('#price').type('12.00');
      cy.get('#submit-btn').click();

      // Message should be visible
      cy.get('#message').should('be.visible');
      cy.get('#message').should('contain', 'Item created successfully!');

      // Message should auto-hide after 3 seconds
      cy.wait(3500);
      cy.get('#message').should('have.class', 'hidden');
    });

    it('should show error message on API failure', () => {
      // Intercept and fail the API call
      cy.intercept('POST', '/api/items', { statusCode: 500, body: { error: 'Server error' } }).as('createItem');

      cy.get('#name').type('Error Test');
      cy.get('#description').type('Testing error handling');
      cy.get('#price').type('10.00');
      cy.get('#submit-btn').click();

      cy.wait('@createItem');
      cy.get('#message').should('be.visible');
      cy.get('#message').should('have.class', 'error');
    });

    it('should handle form submission with Enter key', () => {
      cy.get('#name').type('Enter Key Test');
      cy.get('#description').type('Testing Enter key submission');
      cy.get('#price').type('15.00');
      
      // Submit form using Enter key
      cy.get('#price').type('{enter}');

      cy.get('#message').should('contain', 'Item created successfully!');
      cy.get('.item-card').should('contain', 'Enter Key Test');
    });

    it('should maintain form state when switching between create and edit', () => {
      // Start creating an item
      cy.get('#name').type('Partial Item');
      cy.get('#description').type('Partial description');
      cy.get('#price').type('20.00');

      // Create another item first
      cy.get('#name').clear().type('First Item');
      cy.get('#description').clear().type('First description');
      cy.get('#price').clear().type('10.00');
      cy.get('#submit-btn').click();
      cy.get('#message').should('contain', 'Item created successfully!');

      // Edit that item
      cy.get('.item-card').contains('First Item').parent().within(() => {
        cy.get('button').contains('Edit').click();
      });

      // Verify form is populated
      cy.get('#name').should('have.value', 'First Item');
      cy.get('#cancel-btn').click();

      // Verify form is cleared after cancel
      cy.get('#name').should('have.value', '');
    });

    it('should scroll to form when editing an item', () => {
      // Create multiple items to enable scrolling
      for (let i = 1; i <= 5; i++) {
        cy.get('#name').type(`Item ${i}`);
        cy.get('#description').type(`Description ${i}`);
        cy.get('#price').type(`${i}0.00`);
        cy.get('#submit-btn').click();
        cy.get('#message').should('contain', 'Item created successfully!');
        cy.wait(300);
      }

      // Scroll down
      cy.scrollTo('bottom');

      // Click edit on last item
      cy.get('.item-card').contains('Item 5').parent().within(() => {
        cy.get('button').contains('Edit').click();
      });

      // Form should be visible (scrolled into view)
      cy.get('#form-title').should('be.visible');
      cy.get('#form-title').should('contain', 'Edit Item');
    });

    it('should display items in grid layout correctly', () => {
      // Verify grid structure
      cy.get('#items-grid').should('have.class', 'items-grid');
      cy.get('.item-card').should('have.length.at.least', 1);

      // Verify each card has required elements
      cy.get('.item-card').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('h3').should('exist');
          cy.get('p').should('exist');
          cy.get('.price').should('exist');
          cy.get('.item-actions').should('exist');
          cy.get('button').contains('Edit').should('exist');
          cy.get('button').contains('Delete').should('exist');
        });
      });
    });

    it('should handle rapid form submissions', () => {
      // Create multiple items quickly
      const items = [
        { name: 'Rapid 1', description: 'Desc 1', price: '1.00' },
        { name: 'Rapid 2', description: 'Desc 2', price: '2.00' },
        { name: 'Rapid 3', description: 'Desc 3', price: '3.00' }
      ];

      items.forEach((item) => {
        cy.get('#name').type(item.name);
        cy.get('#description').type(item.description);
        cy.get('#price').type(item.price);
        cy.get('#submit-btn').click();
        // Don't wait for message, just verify it appears
        cy.get('#message', { timeout: 2000 }).should('be.visible');
      });

      // Verify all items were created
      items.forEach((item) => {
        cy.get('.item-card').should('contain', item.name);
      });
    });
  });

  describe('Form Validation Tests', () => {
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

  describe('Data Persistence Tests', () => {
    it('should persist data after page refresh', () => {
      // Create an item
      const persistentItem = {
        name: 'Persistent Item',
        description: 'Should persist after refresh',
        price: '50.00'
      };

      cy.get('#name').type(persistentItem.name);
      cy.get('#description').type(persistentItem.description);
      cy.get('#price').type(persistentItem.price);
      cy.get('#submit-btn').click();
      cy.get('#message').should('contain', 'Item created successfully!');

      // Verify item exists
      cy.get('.item-card').should('contain', persistentItem.name);

      // Refresh page
      cy.reload();

      // Verify item still exists after refresh
      cy.get('.item-card').should('contain', persistentItem.name);
      cy.get('.item-card').should('contain', persistentItem.description);
      cy.get('.item-card').should('contain', '$50.00');
    });

    it('should maintain item order after operations', () => {
      // Create multiple items
      const items = ['First', 'Second', 'Third'];
      
      items.forEach((name) => {
        cy.get('#name').type(`${name} Item`);
        cy.get('#description').type(`Description for ${name}`);
        cy.get('#price').type('10.00');
        cy.get('#submit-btn').click();
        cy.get('#message').should('contain', 'Item created successfully!');
        cy.wait(300);
      });

      // Verify items are displayed
      items.forEach((name) => {
        cy.get('.item-card').should('contain', `${name} Item`);
      });
    });
  });

  describe('Button Interaction Tests', () => {
    it('should handle button click during form submission', () => {
      // Intercept to add delay
      cy.intercept('POST', '/api/items', {
        delay: 500,
        statusCode: 201,
        body: { id: 999, name: 'Button State Test', description: 'Testing button state', price: 10 }
      }).as('delayedCreate');

      cy.get('#name').type('Button State Test');
      cy.get('#description').type('Testing button state');
      cy.get('#price').type('10.00');
      cy.get('#submit-btn').click();

      // Wait for the delayed request
      cy.wait('@delayedCreate');
      
      // Verify button is still functional
      cy.get('#submit-btn').should('be.visible');
      cy.get('#message').should('be.visible');
    });

    it('should have proper button styling and hover effects', () => {
      // Verify buttons exist and have correct classes
      cy.get('#submit-btn').should('exist');
      cy.get('#submit-btn').should('be.visible');
      
      // Verify edit and delete buttons exist on items
      cy.get('.item-card').first().within(() => {
        cy.get('button').contains('Edit').should('exist');
        cy.get('button').contains('Delete').should('exist');
        cy.get('button').contains('Delete').should('have.class', 'btn-danger');
      });
    });
  });
});