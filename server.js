const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// In-memory data store (in production, use a database)
let items = [
  { id: 1, name: 'Sample Item 1', description: 'This is a sample item', price: 29.99 },
  { id: 2, name: 'Sample Item 2', description: 'Another sample item', price: 39.99 },
  { id: 3, name: 'Sample Item 3', description: 'Another sample item - Description 3', price: 39.99 },

];
let nextId = 3;

// Helper function to find item by ID
const findItemById = (id) => {
  return items.find(item => item.id === parseInt(id));
};

// Routes

// GET /api/items - Get all items
app.get('/api/items', (req, res) => {
  res.json(items);
});

// GET /api/items/:id - Get a single item by ID
app.get('/api/items/:id', (req, res) => {
  const item = findItemById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json(item);
});

// POST /api/items - Create a new item
app.post('/api/items', (req, res) => {
  const { name, description, price } = req.body;
  
  if (!name || !description || price === undefined) {
    return res.status(400).json({ error: 'Name, description, and price are required' });
  }

  const newItem = {
    id: nextId++,
    name,
    description,
    price: parseFloat(price)
  };

  items.push(newItem);
  res.status(201).json(newItem);
});

// PUT /api/items/:id - Update an existing item
app.put('/api/items/:id', (req, res) => {
  const item = findItemById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const { name, description, price } = req.body;
  
  if (name !== undefined) item.name = name;
  if (description !== undefined) item.description = description;
  if (price !== undefined) item.price = parseFloat(price);

  res.json(item);
});

// DELETE /api/items/:id - Delete an item
app.delete('/api/items/:id', (req, res) => {
  const itemIndex = items.findIndex(item => item.id === parseInt(req.params.id));
  
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  items.splice(itemIndex, 1);
  res.status(204).send();
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

