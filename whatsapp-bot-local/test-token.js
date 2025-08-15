// Script para testar criação de token
const https = require('https');

const tokenData = {
  phone: '5511945743182',
  contactName: 'Teste Cliente',
  plan: 'solo',
  amount: 'R$ 197,00'
};

const postData = JSON.stringify(tokenData);

const options = {
  hostname: 'juria-ai-project.onrender.com',
  port: 443,
  path: '/api/tokens/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🚀 Criando token de teste...');

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ Token criado:', response);
      
      if (response.token) {
        const linkCadastro = `https://resonant-sable-1eca3a.netlify.app/cadastro/${response.token}`;
        console.log('\n🔗 LINK DE CADASTRO:');
        console.log(linkCadastro);
        console.log('\n📋 Copie e cole este link no navegador para testar!');
      }
    } catch (e) {
      console.log('❌ Erro ao processar resposta:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erro na requisição:', e.message);
});

req.write(postData);
req.end();
