const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const cron = require('node-cron');
require('dotenv').config();

class JuriaBot {
  constructor() {
    // Inicializar cliente WhatsApp com configurações otimizadas
    this.client = new Client({
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
          '--single-process',
          '--disable-gpu'
        ],
        timeout: 60000
      },
      webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
      }
    });

    this.conversations = new Map();
    this.pixKey = process.env.PIX_KEY;
    this.pixOwner = process.env.PIX_OWNER;
    this.soloPlanPrice = process.env.SOLO_PLAN_PRICE;
    this.officePlanPrice = process.env.OFFICE_PLAN_PRICE;
    
    this.setupEventListeners();
    this.setupCronJobs();
  }

  setupEventListeners() {
    // Event listeners
    this.client.on('qr', (qr) => {
      console.log('📱 Escaneie o QR Code abaixo com seu WhatsApp:');
      console.log('⏰ QR Code expira em 30 segundos. Um novo será gerado automaticamente.');
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      console.log('✅ JurIA Bot conectado e pronto!');
      console.log('📞 WhatsApp Web conectado com sucesso!');
    });

    this.client.on('authenticated', () => {
      console.log('🔐 Autenticação realizada com sucesso!');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('❌ Falha na autenticação:', msg);
      console.log('🔄 Reiniciando bot em 5 segundos...');
      setTimeout(() => {
        this.start();
      }, 5000);
    });

    this.client.on('disconnected', (reason) => {
      console.log('⚠️ Bot desconectado:', reason);
      console.log('🔄 Tentando reconectar em 10 segundos...');
      setTimeout(() => {
        this.start();
      }, 10000);
    });

    this.client.on('message', this.handleMessage.bind(this));

    this.client.on('message', async (message) => {
      if (message.from.includes('@g.us')) return; // Ignora grupos
      if (message.from === 'status@broadcast') return; // Ignora status
      
      await this.handleMessage(message);
    });

    this.client.on('disconnected', (reason) => {
      console.log('❌ Bot desconectado:', reason);
    });
  }

  async handleMessage(message) {
    const contact = await message.getContact();
    const phone = message.from;
    const text = message.body.toLowerCase().trim();
    
    console.log(`📨 ${contact.name || contact.pushname}: ${message.body}`);

    try {
      // Verifica se é comprovante de pagamento
      if (message.hasMedia && (text.includes('comprovante') || text.includes('pago') || text.includes('transferência'))) {
        await this.handlePaymentProof(message, phone);
        return;
      }

      // Processa mensagem com IA
      const response = await this.processWithAI(text, phone, contact);
      
      // Executa ações especiais se detectadas
      await this.executeActions(response, phone, contact);
      
      // Envia resposta
      await message.reply(response.text);
      
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      await message.reply('Desculpe, tive um problema técnico. Pode repetir sua mensagem?');
    }
  }

  async processWithAI(text, phone, contact) {
    const conversation = this.conversations.get(phone) || [];
    
    const systemPrompt = `Você é o assistente jurídico do JurIA, especializado em direito brasileiro.

INFORMAÇÕES DO SISTEMA:
- Plano Solo: R$ ${this.soloPlanPrice}/mês (1 usuário)
- Plano Escritório: R$ ${this.officePlanPrice}/usuário/mês (múltiplos usuários)
- PIX: ${this.pixKey} (${this.pixOwner})

SUAS FUNÇÕES:
1. VENDAS: Qualificar clientes, explicar benefícios, fechar vendas
2. SUPORTE: Responder dúvidas jurídicas básicas
3. PAGAMENTOS: Orientar sobre PIX e gerar tokens de acesso
4. RELACIONAMENTO: Manter clientes engajados

PERSONALIDADE:
- Profissional mas acessível
- Use "Dr./Dra." quando apropriado
- Seja preciso com informações jurídicas
- Sempre ofereça ajuda adicional

AÇÕES ESPECIAIS (use exatamente estes códigos):
- [GERAR_PIX_SOLO] - quando cliente quer assinar plano Solo
- [GERAR_PIX_ESCRITORIO] - quando cliente quer assinar plano Escritório  
- [AGUARDAR_COMPROVANTE] - após enviar PIX
- [GERAR_TOKEN] - quando confirmar pagamento
- [AGENDAR_LEMBRETE] - para renovações futuras

Cliente: ${contact.name || contact.pushname}
Telefone: ${phone}`;

    try {
      const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversation,
          { role: 'user', content: text }
        ],
        temperature: 0.7,
        max_tokens: 500
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const aiResponse = response.data.choices[0].message.content;
      
      // Atualiza conversa
      conversation.push({ role: 'user', content: text });
      conversation.push({ role: 'assistant', content: aiResponse });
      
      // Mantém apenas últimas 10 mensagens
      if (conversation.length > 20) {
        conversation.splice(0, conversation.length - 20);
      }
      
      this.conversations.set(phone, conversation);
      
      return { text: aiResponse, actions: this.extractActions(aiResponse) };
      
    } catch (error) {
      console.error('❌ Erro na API OpenRouter:', error);
      return { 
        text: 'Desculpe, estou com dificuldades técnicas. Pode tentar novamente em alguns minutos?',
        actions: []
      };
    }
  }

  extractActions(response) {
    const actions = [];
    const actionRegex = /\[([A-Z_]+)\]/g;
    let match;
    
    while ((match = actionRegex.exec(response)) !== null) {
      actions.push(match[1]);
    }
    
    return actions;
  }

  async executeActions(response, phone, contact) {
    if (!response.actions) return;
    
    for (const action of response.actions) {
      switch (action) {
        case 'GERAR_PIX_SOLO':
          await this.sendPixInfo(phone, 'SOLO', this.soloPlanPrice);
          break;
          
        case 'GERAR_PIX_ESCRITORIO':
          await this.sendPixInfo(phone, 'ESCRITORIO', this.officePlanPrice);
          break;
          
        case 'GERAR_TOKEN':
          await this.generateAccessToken(phone, contact);
          break;
          
        case 'AGENDAR_LEMBRETE':
          await this.scheduleReminder(phone, contact);
          break;
      }
    }
  }

  async sendPixInfo(phone, plan, price) {
    const pixMessage = `🔗 *PIX GERADO - PLANO ${plan}*

💰 *Valor:* R$ ${price},00
🏦 *PIX:* ${this.pixKey}
👤 *Favorecido:* ${this.pixOwner}
📝 *Descrição:* JurIA - Plano ${plan}

📋 *INSTRUÇÕES:*
1. Faça o PIX no valor exato
2. Envie o comprovante aqui no chat
3. Seu acesso será liberado em até 5 minutos

⏰ *Válido por 24 horas*`;

    await this.client.sendMessage(phone, pixMessage);
  }

  async handlePaymentProof(message, phone) {
    const contact = await message.getContact();
    
    // Salva comprovante (você pode implementar upload para servidor)
    console.log(`💳 Comprovante recebido de ${contact.name}: ${phone}`);
    
    const confirmMessage = `✅ *COMPROVANTE RECEBIDO*

Olá ${contact.name}!

Recebi seu comprovante de pagamento. 
Estou validando e em até 5 minutos você receberá:

🔑 Link de cadastro personalizado
📧 Suas credenciais de acesso
📱 Tutorial de primeiros passos

*Aguarde que já estou processando!*`;

    await message.reply(confirmMessage);
    
    // Aqui você pode implementar validação automática ou notificar admin
    // Por enquanto, simula aprovação automática após 2 minutos
    setTimeout(async () => {
      await this.generateAccessToken(phone, contact);
    }, 120000); // 2 minutos
  }

  async generateAccessToken(phone, contact) {
    try {
      // Gera token único
      const token = this.generateUniqueToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
      
      // Salva token no backend
      await axios.post(`${process.env.BACKEND_URL}/api/tokens`, {
        token,
        phone,
        contactName: contact.name || contact.pushname,
        expiresAt
      });
      
      const accessMessage = `🎉 *PAGAMENTO CONFIRMADO!*

Olá ${contact.name}!

Seu acesso ao JurIA foi liberado! 

🔗 *Link de cadastro:*
https://juria.com/cadastro?token=${token}

⏰ *Válido até:* ${expiresAt.toLocaleDateString('pt-BR')} às ${expiresAt.toLocaleTimeString('pt-BR')}

📋 *PRÓXIMOS PASSOS:*
1. Clique no link acima
2. Preencha seus dados
3. Crie sua senha
4. Comece a usar o JurIA!

🆘 *Precisa de ajuda?* Só chamar aqui!

Bem-vindo(a) ao futuro da advocacia! 🚀`;

      await this.client.sendMessage(phone, accessMessage);
      
    } catch (error) {
      console.error('❌ Erro ao gerar token:', error);
      await this.client.sendMessage(phone, 'Houve um erro ao gerar seu acesso. Vou resolver isso agora!');
    }
  }

  generateUniqueToken() {
    return 'JURIA_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }

  async scheduleReminder(phone, contact) {
    // Implementar sistema de lembretes
    console.log(`⏰ Lembrete agendado para ${contact.name}: ${phone}`);
  }

  setupCronJobs() {
    // Verifica vencimentos todo dia às 9h
    cron.schedule('0 9 * * *', async () => {
      console.log('🔍 Verificando vencimentos...');
      await this.checkExpirations();
    });
    
    // Limpa conversas antigas toda meia-noite
    cron.schedule('0 0 * * *', () => {
      console.log('🧹 Limpando conversas antigas...');
      this.conversations.clear();
    });
  }

  async checkExpirations() {
    try {
      const response = await axios.get(`${process.env.BACKEND_URL}/api/subscriptions/expiring`);
      const expiring = response.data;
      
      for (const subscription of expiring) {
        await this.sendRenewalReminder(subscription);
      }
      
    } catch (error) {
      console.error('❌ Erro ao verificar vencimentos:', error);
    }
  }

  async sendRenewalReminder(subscription) {
    const message = `⚠️ *LEMBRETE DE RENOVAÇÃO*

Olá ${subscription.name}!

Seu plano JurIA vence em ${subscription.daysUntilExpiry} dias (${subscription.expiryDate}).

💰 *Valor da renovação:* R$ ${subscription.price},00
🔗 *PIX:* ${this.pixKey}

Quer renovar agora? É só fazer o PIX e enviar o comprovante!

Qualquer dúvida, estou aqui para ajudar! 😊`;

    await this.client.sendMessage(subscription.phone, message);
  }

  async start() {
    console.log('🚀 Iniciando JurIA Bot...');
    await this.client.initialize();
  }
}

// Inicia o bot
const bot = new JuriaBot();
bot.start().catch(console.error);

module.exports = JuriaBot;
