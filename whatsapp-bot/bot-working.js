const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🚀 JurIA Bot - Versão Definitiva');
console.log('⚡ Iniciando...');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        timeout: 60000
    }
});

client.on('qr', (qr) => {
    console.log('\n📱 ESCANEIE O QR CODE ABAIXO:');
    console.log('=' * 50);
    qrcode.generate(qr, { small: true });
    console.log('=' * 50);
    console.log('💡 WhatsApp > Menu > Dispositivos conectados > Conectar dispositivo\n');
});

client.on('authenticated', () => {
    console.log('🔐 AUTENTICADO COM SUCESSO!');
});

client.on('ready', () => {
    console.log('✅ JURIA BOT CONECTADO E FUNCIONANDO!');
    console.log('🤖 Pronto para receber mensagens!');
    console.log('📱 Teste enviando qualquer mensagem no WhatsApp\n');
});

client.on('message', async (message) => {
    // Não responder mensagens próprias
    if (message.fromMe) return;
    
    try {
        const contact = await message.getContact();
        const contactName = contact.name || contact.pushname || 'Usuário';
        
        console.log('\n' + '='.repeat(60));
        console.log(`📨 NOVA MENSAGEM RECEBIDA!`);
        console.log(`👤 De: ${contactName}`);
        console.log(`📞 Número: ${message.from}`);
        console.log(`💬 Mensagem: "${message.body}"`);
        console.log(`🕐 Hora: ${new Date().toLocaleTimeString()}`);
        
        // Resposta do bot
        const botResponse = `🤖 *JurIA - Assistente Jurídico*

Olá ${contactName}! Obrigado por entrar em contato!

🎯 *Nossos Planos:*

📋 *PLANO SOLO* - R$ 197/mês
• Ideal para advogados autônomos
• IA jurídica completa
• Análise de documentos
• Consulta de jurisprudência
• Geração de peças

🏢 *PLANO ESCRITÓRIO* - R$ 147/usuário/mês
• Para escritórios e equipes
• Todos os recursos do Solo
• Gestão de casos colaborativa
• Relatórios avançados
• Controle de usuários

💰 *Para assinar:*
• PIX: 04449816161
• Nome: Reginaldo Dias Junior
• Após pagamento: token de cadastro automático

🚀 Qual plano desperta seu interesse?

_Responda com "SOLO" ou "ESCRITORIO" para mais detalhes!_`;

        // Enviar resposta
        await client.sendMessage(message.from, botResponse);
        
        console.log(`✅ RESPOSTA ENVIADA PARA: ${contactName}`);
        console.log('='.repeat(60) + '\n');
        
    } catch (error) {
        console.error('❌ ERRO ao processar mensagem:', error.message);
    }
});

client.on('disconnected', (reason) => {
    console.log('⚠️ Bot desconectado:', reason);
    console.log('🔄 Reiniciando em 5 segundos...');
    setTimeout(() => {
        client.initialize();
    }, 5000);
});

client.on('auth_failure', (msg) => {
    console.error('❌ Falha na autenticação:', msg);
    console.log('🔄 Tente escanear o QR Code novamente');
});

// Inicializar cliente
console.log('🔄 Inicializando cliente WhatsApp...');
client.initialize();

// Tratamento de erros globais
process.on('unhandledRejection', (err) => {
    console.error('❌ Erro não tratado:', err.message);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Exceção não capturada:', err.message);
});

console.log('⚡ Bot configurado! Aguardando QR Code...');
