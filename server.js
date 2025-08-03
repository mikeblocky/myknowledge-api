// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

// Import modules
const swaggerSpecs = require('./config/swagger');
const notesRoutes = require('./routes/notes');
const journalsRoutes = require('./routes/journals');
const tagsRoutes = require('./routes/tags');

console.log('Is CLERK_JWT_KEY set in this environment?', !!process.env.CLERK_JWT_KEY); 

const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://myknowledge-phi.vercel.app', // your Vercel frontend URL
    'http://localhost:3000' // for local development
  ],
  credentials: true,
}));
app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use('/api/notes', notesRoutes);
app.use('/api/journals', journalsRoutes);
app.use('/api/tags', tagsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});
