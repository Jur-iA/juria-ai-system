const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🚀 JurIA Bot - Versão Final que VAI FUNCIONAR!');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './session-final'
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    }
});

// Eventos do cliente
client.on('qr', (qr) => {
    console.log('\n📱 QR CODE GERADO - ESCANEIE AGORA:');
    console.log('='.repeat(50));
    qrcode.generate(qr, { small: true });
    console.log('='.repeat(50));
    console.log('💡 WhatsApp > Menu > Dispositivos conectados > Conectar dispositivo\n');
});

client.on('authenticated', () => {
    console.log('🔐 AUTENTICADO COM SUCESSO!');
});

client.on('ready', () => {
    console.log('✅ JURIA BOT CONECTADO E FUNCIONANDO!');
    console.log('🤖 Aguardando mensagens...');
    console.log('📱 Teste enviando qualquer mensagem no WhatsApp\n');
});

client.on('loading_screen', (percent, message) => {
    console.log('⏳ Carregando...', percent, message);
});

client.on('message', async (message) => {
    try {
        console.log('\n🔔 EVENTO DE MENSAGEM DETECTADO!');
        console.log('📨 From:', message.from);
        console.log('💬 Body:', message.body);
        console.log('👤 FromMe:', message.fromMe);
        
        // Não responder mensagens próprias
        if (message.fromMe) {
            console.log('🚫 Ignorando mensagem própria');
            return;
        }
        
        // Só responder conversas privadas (não grupos)
        if (message.from.includes('@g.us')) {
            console.log('🚫 Ignorando mensagem de grupo');
            return;
        }
        
        console.log('✅ PROCESSANDO MENSAGEM PRIVADA!');
        
        const contact = await message.getContact();
        const contactName = contact.name || contact.pushname || 'Cliente';
        
        console.log(`👤 Nome do contato: ${contactName}`);
        
        const response = `🤖 *JurIA - IA Jurídica*

Olá *${contactName}*! 👋

Obrigado por entrar em contato!

🎯 *NOSSOS PLANOS:*

📋 *PLANO SOLO* - R$ 197/mês
• Para advogados autônomos
• IA jurídica completa
• Análise de documentos
• Consulta de jurisprudência

🏢 *PLANO ESCRITÓRIO* - R$ 147/usuário/mês  
• Para escritórios e equipes
• Gestão colaborativa
• Relatórios avançados

💰 *PIX para assinar:*
• Chave: 04449816161
• Nome: Reginaldo Dias Junior

🚀 Qual plano te interessa mais?

_Responda "SOLO" ou "ESCRITORIO" para mais detalhes!_`;

        console.log('📤 ENVIANDO RESPOSTA...');
        await client.sendMessage(message.from, response);
        console.log('✅ RESPOSTA ENVIADA COM SUCESSO!');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('❌ ERRO ao processar mensagem:', error);
    }
});

client.on('disconnected', (reason) => {
    console.log('⚠️ Bot desconectado:', reason);
});

client.on('auth_failure', (msg) => {
    console.error('❌ Falha na autenticação:', msg);
});

// Inicializar
console.log('🔄 Inicializando cliente WhatsApp...');
client.initialize();

// Log de debug
setInterval(() => {
    console.log('💓 Bot ainda funcionando...', new Date().toLocaleTimeString());
}, 30000); // A cada 30 segundos

console.log('⚡ Bot configurado e aguardando conexão...');
