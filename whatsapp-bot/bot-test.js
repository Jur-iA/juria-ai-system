const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🚀 Bot de Teste - Ultra Simples');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    console.log('\n📱 QR CODE:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ BOT CONECTADO!');
});

client.on('message', async (message) => {
    if (message.fromMe) return;
    
    console.log(`📨 MENSAGEM: "${message.body}" de ${message.from}`);
    
    try {
        await client.sendMessage(message.from, '🤖 BOT FUNCIONANDO! Mensagem recebida: ' + message.body);
        console.log('✅ RESPOSTA ENVIADA!');
    } catch (error) {
        console.log('❌ ERRO:', error.message);
    }
});

client.initialize();
