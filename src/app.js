#!/usr/bin/env node

// Proxy para o backend real
console.log('🔄 Redirecionando para o backend...');

// Carrega o app real do backend
const app = require('../backend/src/app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎉 JurIA Backend rodando na porta ${PORT}`);
  console.log(`🌐 URL: https://juria-ai-project.onrender.com`);
});
