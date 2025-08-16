const express = require('express');
const router = express.Router();

// Get all cases
router.get('/', (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented', 
    message: 'Endpoint de listagem de casos ainda não implementado' 
  });
});

// Create a new case
router.post('/', (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented', 
    message: 'Endpoint de criação de casos ainda não implementado' 
  });
});

// Get a specific case
router.get('/:id', (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented', 
    message: 'Endpoint de detalhes de caso ainda não implementado' 
  });
});

// Update a specific case
router.put('/:id', (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented', 
    message: 'Endpoint de atualização de caso ainda não implementado' 
  });
});

// Delete a specific case
router.delete('/:id', (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented', 
    message: 'Endpoint de exclusão de caso ainda não implementado' 
  });
});

module.exports = router;
