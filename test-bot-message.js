// Script para testar o bot localmente
const axios = require('axios');

async function testBot() {
    console.log('🧪 Testando bot WhatsApp...');
    
    // Simular mensagem recebida
    const testMessage = "Oi, quero saber sobre o JurIA";
    console.log(`📨 Mensagem de teste: "${testMessage}"`);
    
    // Testar resposta da IA (sem OpenRouter configurado)
    console.log('\n🤖 Resposta esperada do bot:');
    console.log(`
Olá! Sou o assistente da JurIA, sua plataforma de IA jurídica.

🎯 **Nossos Planos:**

**📋 SOLO** - R$ 197/mês
• Ideal para advogados autônomos
• IA jurídica completa
• Análise de documentos
• Consulta de jurisprudência

**🏢 ESCRITÓRIO** - R$ 147/usuário/mês
• Para escritórios e equipes
• Todos os recursos do Solo
• Gestão de casos em equipe
• Relatórios avançados

Qual plano te interessa mais?`);

    // Testar backend
    console.log('\n🔍 Testando conexão com backend...');
    try {
        const response = await axios.get('http://localhost:3001/api/health');
        console.log('✅ Backend funcionando:', response.data);
    } catch (error) {
        console.log('❌ Backend não está respondendo');
    }
    
    console.log('\n📱 PRÓXIMO PASSO: Envie uma mensagem real no WhatsApp para testar!');
}

testBot();
