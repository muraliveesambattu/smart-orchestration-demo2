describe('Item UPDATE and DELETE Operations', () => {
  const baseUrl = 'http://localhost:3000';
  
  beforeEach(() => {
    // Visit the application before each test
    cy.visit(baseUrl);
    // Wait for the page to load
    cy.get('h1').should('contain', 'CRUD Application');
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
});

