const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🚀 Iniciando JurIA Bot Final...');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './whatsapp-session'
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('\n📱 NOVO QR CODE - ESCANEIE AGORA:');
    qrcode.generate(qr, { small: true });
    console.log('\n💡 WhatsApp > Menu > Dispositivos conectados > Conectar dispositivo\n');
});

client.on('authenticated', () => {
    console.log('🔐 Autenticado com sucesso!');
});

client.on('ready', () => {
    console.log('✅ JurIA Bot conectado e FUNCIONANDO!');
    console.log('🤖 Aguardando mensagens...');
    console.log('📱 PIX: 04449816161 - Reginaldo Dias Junior');
    console.log('💰 Planos: Solo R$197/mês | Escritório R$147/usuário\n');
});

client.on('message', async (message) => {
    try {
        // Não responder próprias mensagens
        if (message.fromMe) return;
        
        const contact = await message.getContact();
        const isGroup = message.from.includes('@g.us');
        const chatType = isGroup ? 'GRUPO' : 'PRIVADO';
        
        console.log(`\n📨 [${chatType}] Mensagem de ${contact.name || contact.pushname || 'Desconhecido'}:`);
        console.log(`💬 "${message.body}"`);
        console.log(`📞 De: ${message.from}`);
        
        // Resposta do bot
        const response = `🤖 *JurIA - Assistente de IA Jurídica*

Olá! Obrigado por entrar em contato! 

🎯 *Nossos Planos:*

📋 *SOLO* - R$ 197/mês
• Ideal para advogados autônomos
• IA jurídica completa
• Análise de documentos
• Consulta de jurisprudência

🏢 *ESCRITÓRIO* - R$ 147/usuário/mês
• Para escritórios e equipes
• Todos os recursos do Solo
• Gestão de casos em equipe
• Relatórios avançados

💰 *Como assinar:*
• PIX: 04449816161
• Nome: Reginaldo Dias Junior
• Após pagamento: receba token de cadastro

🚀 Qual plano te interessa mais?`;

        await client.sendMessage(message.from, response);
        console.log(`✅ Resposta enviada para ${contact.name || contact.pushname || 'Desconhecido'}`);
        console.log('─'.repeat(50));
        
    } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error.message);
    }
});

client.on('disconnected', (reason) => {
    console.log('⚠️ Bot desconectado:', reason);
    console.log('🔄 Reiniciando...');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Falha na autenticação:', msg);
});

// Inicializar
console.log('⚡ Inicializando cliente WhatsApp...');
client.initialize();

// Tratamento de erros
process.on('unhandledRejection', (err) => {
    console.error('❌ Erro não tratado:', err.message);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Exceção não capturada:', err.message);
});

console.log('🔄 Bot configurado e aguardando conexão...');
