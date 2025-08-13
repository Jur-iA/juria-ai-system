const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🚀 JurIA Bot - Versão Estável (Apenas Conversas Privadas)');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './whatsapp-session-stable'
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
            '--disable-web-security'
        ],
        timeout: 60000
    }
});

client.on('qr', (qr) => {
    console.log('\n📱 ESCANEIE O QR CODE PARA CONECTAR:');
    console.log('='.repeat(50));
    qrcode.generate(qr, { small: true });
    console.log('='.repeat(50));
    console.log('💡 WhatsApp > Menu > Dispositivos conectados > Conectar dispositivo');
    console.log('⚠️  IMPORTANTE: Este bot funciona APENAS com conversas PRIVADAS (não grupos)\n');
});

client.on('authenticated', () => {
    console.log('🔐 AUTENTICADO COM SUCESSO!');
});

client.on('ready', () => {
    console.log('✅ JURIA BOT CONECTADO E ESTÁVEL!');
    console.log('🤖 Funcionando apenas para conversas PRIVADAS');
    console.log('🚫 Grupos serão IGNORADOS para evitar spam');
    console.log('📱 PIX: 04449816161 - Reginaldo Dias Junior');
    console.log('💰 Planos: Solo R$197/mês | Escritório R$147/usuário');
    console.log('\n🎯 TESTE: Envie uma mensagem PRIVADA no WhatsApp\n');
});

client.on('message', async (message) => {
    try {
        // Ignorar mensagens próprias
        if (message.fromMe) return;
        
        // IMPORTANTE: Ignorar grupos (apenas conversas privadas)
        if (message.from.includes('@g.us')) {
            console.log('🚫 Mensagem de GRUPO ignorada (política do bot)');
            return;
        }
        
        const contact = await message.getContact();
        const contactName = contact.name || contact.pushname || 'Cliente';
        
        console.log('\n' + '='.repeat(60));
        console.log(`📨 MENSAGEM PRIVADA RECEBIDA!`);
        console.log(`👤 Cliente: ${contactName}`);
        console.log(`📞 Número: ${message.from}`);
        console.log(`💬 Mensagem: "${message.body}"`);
        console.log(`🕐 Horário: ${new Date().toLocaleTimeString()}`);
        
        // Resposta personalizada do JurIA
        const botResponse = `🤖 *JurIA - Assistente Jurídico IA*

Olá *${contactName}*! 👋

Obrigado por entrar em contato! Sou o assistente da JurIA, sua plataforma de Inteligência Artificial Jurídica.

🎯 *NOSSOS PLANOS:*

📋 *PLANO SOLO* - R$ 197/mês
• Perfeito para advogados autônomos
• IA jurídica completa e avançada
• Análise inteligente de documentos
• Consulta de jurisprudência atualizada
• Geração automática de peças jurídicas
• Cálculo de prazos processuais

🏢 *PLANO ESCRITÓRIO* - R$ 147/usuário/mês
• Ideal para escritórios e equipes
• Todos os recursos do Plano Solo
• Gestão colaborativa de casos
• Relatórios gerenciais avançados
• Controle de usuários e permissões
• Dashboard executivo

💰 *COMO ASSINAR:*
• *PIX:* 04449816161
• *Nome:* Reginaldo Dias Junior
• *Após pagamento:* Token de cadastro automático
• *Acesso liberado:* Em até 2 minutos

🚀 *Qual plano desperta seu interesse?*

_Responda com *"SOLO"* ou *"ESCRITORIO"* para receber mais detalhes específicos!_

_Ou envie *"PIX"* para receber os dados de pagamento novamente._`;

        // Enviar resposta
        await client.sendMessage(message.from, botResponse);
        
        console.log(`✅ RESPOSTA ENVIADA PARA: ${contactName}`);
        console.log(`📊 Status: Conversa privada processada com sucesso`);
        console.log('='.repeat(60) + '\n');
        
    } catch (error) {
        console.error('❌ ERRO ao processar mensagem:', error.message);
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

// Tratamento de erros
process.on('unhandledRejection', (err) => {
    console.error('❌ Erro não tratado:', err.message);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Exceção não capturada:', err.message);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando bot...');
    client.destroy();
    process.exit(0);
});

console.log('⚡ Bot configurado para conversas PRIVADAS apenas!');
