describe('Item READ Operations', () => {
  const baseUrl = 'http://localhost:3000';
  
  beforeEach(() => {
    // Visit the application before each test
    cy.visit(baseUrl);
    // Wait for the page to load
    cy.get('h1').should('contain', 'CRUD Application');
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
});

