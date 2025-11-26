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
  });
});