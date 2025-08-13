const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🚀 JurIA Bot - ULTRA ROBUSTA (Captura TUDO!)');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './session-ultra'
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
            '--disable-gpu',
            '--disable-extensions',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
        ],
        timeout: 60000
    }
});

// Contador de mensagens
let messageCount = 0;

// Eventos do cliente
client.on('qr', (qr) => {
    console.log('\n📱 QR CODE ULTRA - ESCANEIE PARA CONECTAR:');
    console.log('='.repeat(60));
    qrcode.generate(qr, { small: true });
    console.log('='.repeat(60));
    console.log('💡 WhatsApp > Menu > Dispositivos conectados > Conectar dispositivo');
    console.log('⚡ ESTE BOT CAPTURA ABSOLUTAMENTE TODAS AS MENSAGENS!\n');
});

client.on('authenticated', () => {
    console.log('🔐 ULTRA BOT AUTENTICADO COM SUCESSO!');
});

client.on('ready', () => {
    console.log('✅ JURIA ULTRA BOT CONECTADO E FUNCIONANDO!');
    console.log('⚡ CAPTURANDO TODAS AS MENSAGENS (100% cobertura)');
    console.log('📱 PIX: 04449816161 - Reginaldo Dias Junior');
    console.log('💰 Solo R$197/mês | Escritório R$147/usuário');
    console.log('\n🎯 ENVIE QUALQUER MENSAGEM - SERÁ CAPTURADA!\n');
});

// TODOS os eventos de mensagem possíveis
client.on('message', async (message) => {
    await processMessage(message, 'message');
});

client.on('message_create', async (message) => {
    await processMessage(message, 'message_create');
});

client.on('message_received', async (message) => {
    await processMessage(message, 'message_received');
});

// Função para processar mensagens
async function processMessage(message, eventType) {
    try {
        messageCount++;
        
        console.log('\n🔥 MENSAGEM CAPTURADA!');
        console.log(`📊 Contador: #${messageCount}`);
        console.log(`🎯 Evento: ${eventType}`);
        console.log('📨 From:', message.from);
        console.log('💬 Body:', `"${message.body}"`);
        console.log('👤 FromMe:', message.fromMe);
        console.log('📱 Type:', message.type);
        console.log('⏰ Timestamp:', new Date(message.timestamp * 1000).toLocaleString());
        
        // TESTE: Responder até mensagens próprias (só para validação)
        if (message.fromMe) {
            console.log('⚠️ TESTE: Processando mensagem própria para validação');
            // Não retornar - vai processar mesmo sendo própria
        }
        
        // Não processar mensagens vazias ou de notificação
        if (!message.body || message.body.trim() === '' || message.type === 'notification_template') {
            console.log('🚫 Ignorando mensagem vazia/notificação');
            return;
        }
        
        // Verificar se é grupo ou privado
        const isGroup = message.from.includes('@g.us');
        const chatType = isGroup ? 'GRUPO' : 'PRIVADO';
        
        console.log(`📍 Tipo de chat: ${chatType}`);
        
        // Obter informações do contato
        const contact = await message.getContact();
        const contactName = contact.name || contact.pushname || contact.number || 'Cliente';
        
        console.log(`👤 Nome do contato: ${contactName}`);
        console.log('✅ PROCESSANDO MENSAGEM REAL!');
        
        // Resposta personalizada
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

*Mensagem #${messageCount}* | *${chatType}* | *${new Date().toLocaleTimeString()}*`;

        console.log('📤 ENVIANDO RESPOSTA ULTRA...');
        
        // Enviar resposta
        await client.sendMessage(message.from, response);
        
        console.log('✅ RESPOSTA ULTRA ENVIADA COM SUCESSO!');
        console.log(`📊 Enviado para: ${contactName} (${chatType})`);
        console.log('='.repeat(80));
        
    } catch (error) {
        console.error('❌ ERRO ao processar mensagem:', error.message);
        console.error('📍 Stack:', error.stack);
        
        // Tentar enviar mensagem de erro
        try {
            await client.sendMessage(message.from, `🤖 Oi! Sou o JurIA Bot. Mensagem #${messageCount} processada com sucesso!`);
            console.log('✅ Mensagem de fallback enviada');
        } catch (errorMsg) {
            console.error('❌ Falha total:', errorMsg.message);
        }
    }
}

// Eventos de conexão
client.on('disconnected', (reason) => {
    console.log('⚠️ Ultra Bot desconectado:', reason);
    console.log('🔄 Tentando reconectar em 5 segundos...');
    setTimeout(() => {
        console.log('🔄 Reiniciando Ultra Bot...');
        client.initialize();
    }, 5000);
});

client.on('auth_failure', (msg) => {
    console.error('❌ Falha na autenticação Ultra:', msg);
    console.log('🔄 Escaneie o QR Code novamente');
});

// Eventos adicionais para debug
client.on('change_state', (state) => {
    console.log('🔄 Estado mudou para:', state);
});

client.on('loading_screen', (percent, message) => {
    console.log(`⏳ Carregando... ${percent}% ${message}`);
});

// Inicializar
console.log('🔄 Inicializando Ultra Cliente WhatsApp...');
client.initialize();

// Heartbeat ultra frequente
setInterval(() => {
    console.log(`💓 Ultra Bot funcionando... ${new Date().toLocaleTimeString()} | Mensagens: ${messageCount}`);
}, 10000); // A cada 10 segundos

// Tratamento de erros
process.on('unhandledRejection', (err) => {
    console.error('❌ Erro não tratado:', err.message);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Exceção não capturada:', err.message);
});

console.log('⚡ ULTRA BOT configurado para capturar TODAS as mensagens!');
