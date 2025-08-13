const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🚀 Iniciando JurIA Bot...');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('\n📱 ESCANEIE O QR CODE ABAIXO:');
    qrcode.generate(qr, { small: true });
    console.log('\n💡 Abra WhatsApp > Menu > Dispositivos conectados > Conectar dispositivo\n');
});

client.on('ready', () => {
    console.log('✅ JurIA Bot conectado e funcionando!');
    console.log('🤖 Bot pronto para receber mensagens!');
});

client.on('message', async (message) => {
    if (message.fromMe) return; // Só ignora mensagens próprias
    
    const contact = await message.getContact();
    console.log(`📨 Mensagem de ${contact.name || contact.pushname}: ${message.body}`);
    
    const response = `Olá! Sou o assistente da JurIA, sua plataforma de IA jurídica.

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

Qual plano te interessa mais?`;

    await client.sendMessage(message.from, response);
    console.log(`✅ Resposta enviada para ${contact.name || contact.pushname}`);
});

client.initialize();

console.log('⚡ Aguardando QR Code...');
