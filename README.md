# MyKnowledge Backend API

This is the backend API for the MyKnowledge application, providing endpoints for managing notes, journals, and tags with user authentication via Clerk.

## API Documentation

The API documentation is available via Swagger UI at:
- **Development**: http://localhost:4000/api-docs
- **Production**: https://your-production-domain.com/api-docs

## Features

- **Notes Management**: Create, read, update, and delete notes
- **Journal Entries**: Special note type for journal entries
- **Tags**: Organize notes with customizable tags
- **Authentication**: JWT-based authentication using Clerk
- **User Isolation**: All data is scoped to the authenticated user

## API Endpoints

### Notes
- `GET /api/notes` - Get all notes for the user
- `POST /api/notes` - Create a new note
- `GET /api/notes/:id` - Get a specific note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

### Journals
- `GET /api/journals` - Get all journal entries for the user
- `POST /api/journals` - Create a new journal entry
- `GET /api/journals/:id` - Get a specific journal entry
- `PUT /api/journals/:id` - Update a journal entry
- `DELETE /api/journals/:id` - Delete a journal entry

### Tags
- `GET /api/tags` - Get all tags for the user
- `POST /api/tags` - Create a new tag
- `PUT /api/tags/:id` - Update a tag
- `DELETE /api/tags/:id` - Delete a tag

## Authentication

All endpoints require authentication using a JWT token from Clerk. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Running the Server

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `CLERK_JWT_KEY`: Your Clerk JWT verification key

3. Start the server:
   ```bash
   node server.js
   ```

The server will run on port 4000 by default, and the Swagger documentation will be available at `http://localhost:4000/api-docs`.