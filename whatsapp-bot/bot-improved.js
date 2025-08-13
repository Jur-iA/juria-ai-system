const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
require('dotenv').config();

console.log('🚀 Iniciando JurIA Bot...');

// Configuração mais robusta do cliente WhatsApp
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
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
        ],
        timeout: 60000
    }
});

// Configurações do bot
const BOT_CONFIG = {
    name: process.env.BOT_NAME || 'JurIA Assistant',
    owner: process.env.OWNER_NAME || 'Reginaldo Dias Junior',
    pixKey: process.env.PIX_KEY || '04449816161',
    pixOwner: process.env.PIX_OWNER || 'Reginaldo Dias Junior',
    backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
    openRouterKey: process.env.OPENROUTER_API_KEY,
    soloPlanPrice: process.env.SOLO_PLAN_PRICE || 197,
    officePlanPrice: process.env.OFFICE_PLAN_PRICE || 147
};

// Event Listeners
client.on('qr', (qr) => {
    console.log('\n📱 ESCANEIE O QR CODE ABAIXO COM SEU WHATSAPP:');
    console.log('⏰ QR Code expira em 30 segundos. Um novo será gerado automaticamente.\n');
    qrcode.generate(qr, { small: true });
    console.log('\n💡 DICA: Abra WhatsApp > Menu (3 pontos) > Dispositivos conectados > Conectar dispositivo');
});

client.on('authenticated', () => {
    console.log('🔐 Autenticação realizada com sucesso!');
});

client.on('ready', () => {
    console.log('✅ JurIA Bot conectado e funcionando!');
    console.log('📞 WhatsApp Web conectado com sucesso!');
    console.log(`💰 PIX configurado: ${BOT_CONFIG.pixKey} - ${BOT_CONFIG.pixOwner}`);
    console.log('🤖 Bot pronto para receber mensagens!\n');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Falha na autenticação:', msg);
    console.log('🔄 Reiniciando em 5 segundos...');
    setTimeout(() => {
        process.exit(1);
    }, 5000);
});

client.on('disconnected', (reason) => {
    console.log('⚠️ Bot desconectado:', reason);
    console.log('🔄 Reiniciando em 10 segundos...');
    setTimeout(() => {
        process.exit(1);
    }, 10000);
});

// Função para chamar IA
async function callAI(message) {
    if (!BOT_CONFIG.openRouterKey || BOT_CONFIG.openRouterKey === 'sk-or-v1-sua-key-aqui') {
        return `Olá! Sou o assistente da JurIA, sua plataforma de IA jurídica.

🎯 **Nossos Planos:**

**📋 SOLO** - R$ ${BOT_CONFIG.soloPlanPrice}/mês
• Ideal para advogados autônomos
• IA jurídica completa
• Análise de documentos
• Consulta de jurisprudência

**🏢 ESCRITÓRIO** - R$ ${BOT_CONFIG.officePlanPrice}/usuário/mês
• Para escritórios e equipes
• Todos os recursos do Solo
• Gestão de casos em equipe
• Relatórios avançados

Qual plano te interessa mais?`;
    }

    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'openai/gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: `Você é o assistente de vendas da JurIA, uma plataforma de IA jurídica brasileira. 

INFORMAÇÕES DOS PLANOS:
- SOLO: R$ ${BOT_CONFIG.soloPlanPrice}/mês (advogados autônomos)
- ESCRITÓRIO: R$ ${BOT_CONFIG.officePlanPrice}/usuário/mês (escritórios)

DADOS PARA PIX:
- Chave PIX: ${BOT_CONFIG.pixKey}
- Nome: ${BOT_CONFIG.pixOwner}

Seja profissional, educado e focado em vendas. Qualifique o cliente (área jurídica, tamanho do escritório) e apresente o plano mais adequado. Quando o cliente demonstrar interesse em assinar, forneça os dados do PIX.`
                },
                {
                    role: 'user',
                    content: message
                }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${BOT_CONFIG.openRouterKey}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Erro na IA:', error.message);
        return `Olá! Sou o assistente da JurIA. Como posso ajudar você hoje?

Para conhecer nossos planos, envie: "planos"
Para falar sobre assinatura, envie: "assinar"`;
    }
}

// Função para gerar token de cadastro
async function generateToken(phone, contactName) {
    try {
        const tokenData = {
            token: `JURIA_${Date.now()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            phone: phone,
            contactName: contactName,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };

        const response = await axios.post(`${BOT_CONFIG.backendUrl}/api/tokens`, tokenData);
        return tokenData.token;
    } catch (error) {
        console.error('Erro ao gerar token:', error.message);
        return null;
    }
}

// Handler de mensagens
client.on('message', async (message) => {
    // Ignora grupos e mensagens próprias
    if (message.from.includes('@g.us') || message.fromMe) return;

    const contact = await message.getContact();
    const messageText = message.body.toLowerCase();

    console.log(`📨 Mensagem de ${contact.name || contact.pushname}: ${message.body}`);

    try {
        let response = '';

        // Comandos específicos
        if (messageText.includes('pix') || messageText.includes('pagamento') || messageText.includes('comprovante')) {
            // Simula validação de pagamento (2 minutos)
            response = `✅ Comprovante recebido!

🔄 **Validando pagamento...**
⏰ Aguarde até 2 minutos para confirmação.

Após a confirmação, você receberá:
• Token de cadastro único
• Link para criar sua conta
• Acesso liberado por 30 dias

💡 O link de cadastro expira em 24 horas!`;

            // Simula processo de validação
            setTimeout(async () => {
                const token = await generateToken(message.from, contact.name || contact.pushname);
                if (token) {
                    const confirmMessage = `🎉 **PAGAMENTO CONFIRMADO!**

✅ Seu pagamento foi aprovado com sucesso!

🔑 **Token de cadastro:** ${token}
🔗 **Link:** http://localhost:5174/cadastro/${token}

⏰ **IMPORTANTE:** 
• Link válido por 24 horas
• Use apenas uma vez
• Guarde bem esses dados

🚀 Acesse o link e crie sua conta agora!

Dúvidas? Estou aqui para ajudar! 😊`;
                    
                    await client.sendMessage(message.from, confirmMessage);
                    console.log(`✅ Token enviado para ${contact.name}: ${token}`);
                }
            }, 120000); // 2 minutos

        } else {
            // Resposta via IA
            response = await callAI(message.body);
        }

        await client.sendMessage(message.from, response);
        console.log(`✅ Resposta enviada para ${contact.name || contact.pushname}`);

    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        await client.sendMessage(message.from, 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.');
    }
});

// Inicializar bot
console.log('🔄 Inicializando cliente WhatsApp...');
client.initialize();

// Tratamento de erros globais
process.on('unhandledRejection', (err) => {
    console.error('Erro não tratado:', err);
});

process.on('uncaughtException', (err) => {
    console.error('Exceção não capturada:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Encerrando bot...');
    await client.destroy();
    process.exit(0);
});

console.log('⚡ Bot configurado e aguardando conexão...');
