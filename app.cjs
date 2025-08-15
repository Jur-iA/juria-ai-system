#!/usr/bin/env node

// Proxy definitivo para o backend - caminho duplo src/src/
console.log('🔄 Redirecionando do src/src/ para o backend...');

// Carrega o app real do backend (../../ para sair de src/src/, depois backend/src/)
const app = require('../../backend/src/app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎉 JurIA Backend rodando na porta ${PORT}`);
  console.log(`🌐 URL: https://juria-ai-project.onrender.com`);
  console.log(`📁 Executando de: src/src/app.cjs`);
});
