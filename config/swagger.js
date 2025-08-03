const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MyKnowledge API',
      version: '1.0.0',
      description: 'API for managing notes, journals, and tags with user authentication',
      contact: {
        name: 'API Support',
        email: 'support@myknowledge.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server'
      },
      {
        url: 'https://your-production-domain.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token from Clerk authentication'
        }
      },
             schemas: {
         Note: {
           type: 'object',
           properties: {
             _id: { type: 'string', description: 'Note ID' },
             title: { type: 'string', description: 'Note title' },
             content: { type: 'string', description: 'Note content' },
             date: { type: 'string', format: 'date-time', description: 'Note creation date' },
             tagIds: { 
               type: 'array', 
               items: { type: 'string' },
               description: 'Array of tag IDs associated with the note'
             },
             isPinned: { type: 'boolean', description: 'Whether the note is pinned' },
             isJournal: { type: 'boolean', description: 'Whether the note is a journal entry' },
             userId: { type: 'string', description: 'User ID from Clerk' }
           },
           required: ['title', 'content', 'userId']
         },
         Tag: {
           type: 'object',
           properties: {
             _id: { type: 'string', description: 'Tag ID' },
             name: { type: 'string', description: 'Tag name' },
             color: { type: 'string', description: 'Tag color in hex format' },
             userId: { type: 'string', description: 'User ID from Clerk' }
           },
           required: ['name', 'userId']
         },
         User: {
           type: 'object',
           properties: {
             id: { type: 'string', description: 'Clerk user ID' },
             email: { type: 'string', description: 'User email address' },
             firstName: { type: 'string', description: 'User first name' },
             lastName: { type: 'string', description: 'User last name' },
             fullName: { type: 'string', description: 'User full name' },
             imageUrl: { type: 'string', description: 'User profile image URL' },
             createdAt: { type: 'string', format: 'date-time', description: 'Account creation date' },
             lastSignInAt: { type: 'string', format: 'date-time', description: 'Last sign in date' },
             publicMetadata: { 
               type: 'object', 
               description: 'Public metadata stored with the user' 
             },
             privateMetadata: { 
               type: 'object', 
               description: 'Private metadata stored with the user' 
             }
           },
           required: ['id', 'email']
         },
         Organization: {
           type: 'object',
           properties: {
             organization: { 
               type: 'object',
               properties: {
                 id: { type: 'string', description: 'Organization ID' },
                 name: { type: 'string', description: 'Organization name' },
                 slug: { type: 'string', description: 'Organization slug' },
                 imageUrl: { type: 'string', description: 'Organization image URL' }
               }
             },
             role: { type: 'string', description: 'User role in the organization' }
           }
         },
         Error: {
           type: 'object',
           properties: {
             error: { type: 'string', description: 'Error message' },
             details: { type: 'string', description: 'Additional error details' }
           }
         }
       }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './server.js']
};

module.exports = swaggerJsdoc(swaggerOptions); 