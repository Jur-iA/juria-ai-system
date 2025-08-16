const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    time: new Date().toISOString(),
    message: 'JurIA Backend is running successfully!' 
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cases', require('./routes/cases'));

// Root route to avoid 404 on base URL
app.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'JurIA Backend',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      cases: '/api/cases'
    }
  });
});

console.log('🔧 Backend app configured');

module.exports = app;
