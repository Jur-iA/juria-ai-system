const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🚀 JurIA Bot - Versão Robusta (Funciona com TUDO!)');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './session-robust'
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
        ],
        timeout: 60000
    }
});

// Eventos do cliente
client.on('qr', (qr) => {
    console.log('\n📱 QR CODE - ESCANEIE PARA CONECTAR:');
    console.log('='.repeat(50));
    qrcode.generate(qr, { small: true });
    console.log('='.repeat(50));
    console.log('💡 WhatsApp > Menu > Dispositivos conectados > Conectar dispositivo');
    console.log('⚠️  ESTE BOT RESPONDE A CONVERSAS PRIVADAS E GRUPOS\n');
});

client.on('authenticated', () => {
    console.log('🔐 AUTENTICADO COM SUCESSO!');
});

client.on('ready', () => {
    console.log('✅ JURIA BOT CONECTADO E FUNCIONANDO!');
    console.log('🤖 Respondendo a TODAS as mensagens (privadas e grupos)');
    console.log('📱 PIX: 04449816161 - Reginaldo Dias Junior');
    console.log('💰 Planos: Solo R$197/mês | Escritório R$147/usuário');
    console.log('\n🎯 TESTE: Envie qualquer mensagem no WhatsApp\n');
});

client.on('message', async (message) => {
    try {
        console.log('\n🔔 NOVA MENSAGEM RECEBIDA!');
        console.log('📨 From:', message.from);
        console.log('💬 Body:', `"${message.body}"`);
        console.log('👤 FromMe:', message.fromMe);
        console.log('📱 Type:', message.type);
        
        // Não responder mensagens próprias
        if (message.fromMe) {
            console.log('🚫 Ignorando mensagem própria');
            return;
        }
        
        // Verificar se é grupo ou privado
        const isGroup = message.from.includes('@g.us');
        const chatType = isGroup ? 'GRUPO' : 'PRIVADO';
        
        console.log(`📍 Tipo de chat: ${chatType}`);
        
        // AGORA RESPONDE TANTO GRUPOS QUANTO PRIVADOS (para teste)
        const contact = await message.getContact();
        const contactName = contact.name || contact.pushname || 'Cliente';
        
        console.log(`👤 Nome do contato: ${contactName}`);
        console.log('✅ PROCESSANDO MENSAGEM!');
        
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

_Responda "SOLO" ou "ESCRITORIO" para mais detalhes!_

*Chat: ${chatType}* | *Hora: ${new Date().toLocaleTimeString()}*`;

        console.log('📤 ENVIANDO RESPOSTA...');
        
        // Tentar enviar a mensagem
        await client.sendMessage(message.from, response);
        
        console.log('✅ RESPOSTA ENVIADA COM SUCESSO!');
        console.log(`📊 Enviado para: ${contactName} (${chatType})`);
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('❌ ERRO ao processar mensagem:', error.message);
        console.error('📍 Detalhes do erro:', error);
        
        // Tentar enviar mensagem de erro simples
        try {
            await client.sendMessage(message.from, '🤖 Oi! Sou o JurIA Bot. Houve um problema, mas estou funcionando!');
            console.log('✅ Mensagem de erro enviada');
        } catch (errorMsg) {
            console.error('❌ Não foi possível enviar nem mensagem de erro:', errorMsg.message);
        }
    }
});

client.on('disconnected', (reason) => {
    console.log('⚠️ Bot desconectado:', reason);
    console.log('🔄 Tentando reconectar em 10 segundos...');
    setTimeout(() => {
        console.log('🔄 Reiniciando bot...');
        client.initialize();
    }, 10000);
});

client.on('auth_failure', (msg) => {
    console.error('❌ Falha na autenticação:', msg);
    console.log('🔄 Escaneie o QR Code novamente');
});

// Inicializar
console.log('🔄 Inicializando cliente WhatsApp...');
client.initialize();

// Heartbeat mais frequente para debug
setInterval(() => {
    console.log('💓 Bot funcionando...', new Date().toLocaleTimeString());
}, 15000); // A cada 15 segundos

// Tratamento de erros
process.on('unhandledRejection', (err) => {
    console.error('❌ Erro não tratado:', err.message);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Exceção não capturada:', err.message);
});

console.log('⚡ Bot configurado para responder a TODAS as mensagens!');
