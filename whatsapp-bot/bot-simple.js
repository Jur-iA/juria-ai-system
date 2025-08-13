const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🚀 JurIA Bot - Ultra Simples');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    console.log('\n📱 ESCANEIE O QR CODE:');
    qrcode.generate(qr, { small: true });
    console.log('\n💡 WhatsApp > Menu > Dispositivos conectados');
});

client.on('ready', () => {
    console.log('✅ BOT CONECTADO!');
    console.log('🤖 Pronto para receber mensagens!');
});

client.on('message', async (message) => {
    // Não responder mensagens próprias
    if (message.fromMe) return;
    
    // Só responder conversas privadas (não grupos)
    if (message.from.includes('@g.us')) return;
    
    console.log(`📨 Mensagem: "${message.body}"`);
    
    const response = `🤖 *JurIA - IA Jurídica*

Olá! Obrigado pelo contato!

📋 *PLANO SOLO* - R$ 197/mês
• Para advogados autônomos
• IA jurídica completa

🏢 *PLANO ESCRITÓRIO* - R$ 147/usuário/mês  
• Para escritórios
• Gestão em equipe

💰 *PIX para assinar:*
• Chave: 04449816161
• Nome: Reginaldo Dias Junior

Qual plano te interessa?`;

    try {
        await client.sendMessage(message.from, response);
        console.log('✅ Resposta enviada!');
    } catch (error) {
        console.log('❌ Erro:', error.message);
    }
});

console.log('⚡ Iniciando...');
client.initialize();
