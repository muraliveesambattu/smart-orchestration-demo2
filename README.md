# Node.js CRUD Application

A simple and elegant CRUD (Create, Read, Update, Delete) application built with Node.js and Express.js.

## Features

- ✅ Create new items
- ✅ Read/View all items
- ✅ Update existing items
- ✅ Delete items
- 🎨 Modern and responsive UI
- 📡 RESTful API endpoints

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Get All Items
```
GET /api/items
```

### Get Single Item
```
GET /api/items/:id
```

### Create Item
```
POST /api/items
Body: { "name": "string", "description": "string", "price": number }
```

### Update Item
```
PUT /api/items/:id
Body: { "name": "string", "description": "string", "price": number }
```

### Delete Item
```
DELETE /api/items/:id
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Use the form to create new items
3. View all items in the grid below
4. Click "Edit" to modify an item
5. Click "Delete" to remove an item

## Project Structure

```
.
├── server.js          # Express server and API routes
├── package.json       # Project dependencies
├── public/           # Static files
│   └── index.html    # Frontend interface
└── README.md         # This file
```

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Body-parser** - Request body parsing middleware
- **HTML/CSS/JavaScript** - Frontend

## Notes

- The application currently uses an in-memory data store, so data will be lost when the server restarts
- For production use, consider integrating with a database (MongoDB, PostgreSQL, MySQL, etc.)

## License

ISC

