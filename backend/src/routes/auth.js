const express = require('express');
const router = express.Router();

// Register endpoint
router.post('/register', (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented', 
    message: 'Endpoint de registro ainda não implementado' 
  });
});

// Login endpoint
router.post('/login', (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented', 
    message: 'Endpoint de login ainda não implementado' 
  });
});

// Profile endpoint
router.get('/profile', (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented', 
    message: 'Endpoint de perfil ainda não implementado' 
  });
});

router.put('/profile', (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented', 
    message: 'Endpoint de atualização de perfil ainda não implementado' 
  });
});

module.exports = router;
