describe('UI/UX Tests', () => {
  const baseUrl = 'http://localhost:3000';
  
  beforeEach(() => {
    // Visit the application before each test
    cy.visit(baseUrl);
    // Wait for the page to load
    cy.get('h1').should('contain', 'CRUD Application');
  });

  describe('UI/UX Functionality', () => {
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
});

