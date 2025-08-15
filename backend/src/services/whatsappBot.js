const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

class WhatsAppBot {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.userStates = new Map();
    this.init();
  }

  init() {
    console.log('🤖 Inicializando WhatsApp Bot...');
    
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: path.join(__dirname, '../data/whatsapp-session'),
        clientId: 'juria-bot-render'
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
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--memory-pressure-off'
        ],
        timeout: 60000
      },
      webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
      }
    });

    this.setupEventHandlers();
    this.client.initialize();
  }

  setupEventHandlers() {
    this.client.on('qr', (qr) => {
      console.log('📱 QR Code recebido, escaneie com seu WhatsApp:');
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      console.log('✅ WhatsApp Bot conectado e pronto!');
      this.isReady = true;
    });

    this.client.on('authenticated', () => {
      console.log('🔐 WhatsApp Bot autenticado com sucesso!');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('❌ Falha na autenticação:', msg);
    });

    this.client.on('disconnected', (reason) => {
      console.log('🔌 WhatsApp Bot desconectado:', reason);
      this.isReady = false;
      // Tentar reconectar após 30 segundos
      setTimeout(() => {
        console.log('🔄 Tentando reconectar...');
        this.client.initialize();
      }, 30000);
    });

    this.client.on('message', async (message) => {
      await this.handleMessage(message);
    });
  }

  async handleMessage(message) {
    try {
      // Ignorar mensagens de grupos
      const chat = await message.getChat();
      if (chat.isGroup) return;

      // Ignorar mensagens próprias
      if (message.fromMe) return;

      const userId = message.from;
      const messageText = message.body.toLowerCase().trim();

      console.log(`📨 Mensagem recebida de ${userId}: ${message.body}`);

      // Salvar mensagem no backend
      await this.saveMessage(userId, message.body, 'received');

      // Processar comando
      const response = await this.processCommand(userId, messageText, message);
      
      if (response) {
        await message.reply(response);
        await this.saveMessage(userId, response, 'sent');
      }

    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
    }
  }

  async processCommand(userId, messageText, message) {
    const userState = this.userStates.get(userId) || { step: 'initial' };

    // Comandos principais
    if (messageText.includes('oi') || messageText.includes('olá') || messageText.includes('ola')) {
      return this.getWelcomeMessage();
    }

    if (messageText.includes('detalhar solo') || messageText.includes('solo')) {
      return this.getSoloDetails();
    }

    if (messageText.includes('detalhar escritório') || messageText.includes('escritorio') || messageText.includes('escritório')) {
      return this.getEscritorioDetails();
    }

    if (messageText.includes('assinar solo')) {
      this.userStates.set(userId, { step: 'awaiting_payment', plan: 'solo' });
      return this.getPaymentInstructions('solo');
    }

    if (messageText.includes('assinar escritório') || messageText.includes('assinar escritorio')) {
      this.userStates.set(userId, { step: 'awaiting_payment', plan: 'escritorio' });
      return this.getPaymentInstructions('escritorio');
    }

    // Verificar se é comprovante (imagem/documento)
    if (userState.step === 'awaiting_payment' && (message.hasMedia || message.type === 'document')) {
      return await this.handlePaymentProof(userId, userState.plan, message);
    }

    // Resposta padrão
    return this.getDefaultResponse();
  }

  getWelcomeMessage() {
    return `🤖 *Olá! Sou a IA da JurIA!*

🎯 *Planos Disponíveis:*

💼 *SOLO* - R$ 197/mês
👥 *ESCRITÓRIO* - R$ 147/usuário/mês

📋 *Comandos:*
• Digite *"detalhar solo"* para ver detalhes do plano Solo
• Digite *"detalhar escritório"* para ver detalhes do plano Escritório
• Digite *"assinar solo"* ou *"assinar escritório"* para contratar

Como posso te ajudar? 🚀`;
  }

  getSoloDetails() {
    return `💼 *PLANO SOLO - R$ 197/mês*

✅ *Inclui:*
• Chat IA especializado em Direito
• Gestão completa de casos
• Geração de documentos com IA
• Calendário de prazos inteligente
• Análise de jurisprudência
• Suporte prioritário

🎯 *Ideal para:* Advogados autônomos

💳 *Para assinar:* Digite *"assinar solo"*`;
  }

  getEscritorioDetails() {
    return `👥 *PLANO ESCRITÓRIO - R$ 147/usuário/mês*

✅ *Inclui tudo do Solo +*
• Múltiplos usuários
• Gestão colaborativa
• Relatórios avançados
• Dashboard administrativo
• Integração WhatsApp
• Suporte dedicado

🎯 *Ideal para:* Escritórios e equipes

💳 *Para assinar:* Digite *"assinar escritório"*`;
  }

  getPaymentInstructions(plan) {
    const valor = plan === 'solo' ? 'R$ 197,00' : 'R$ 147,00';
    
    return `💳 *Instruções de Pagamento - Plano ${plan.toUpperCase()}*

💰 *Valor:* ${valor}

🏦 *PIX:*
*Chave:* contato@juria.ai
*Valor:* ${valor}

📸 *Após o pagamento:*
Envie o *comprovante* (foto ou PDF) aqui no chat

✅ *Liberação:* Imediata após confirmação

⚠️ *Importante:* Envie apenas o comprovante real do PIX`;
  }

  async handlePaymentProof(userId, plan, message) {
    try {
      // Aqui você pode implementar validação do comprovante
      // Por enquanto, vamos simular aprovação automática
      
      // Gerar token de cadastro
      const token = await this.generateCadastroToken(userId, plan);
      
      if (token) {
        this.userStates.delete(userId); // Limpar estado
        
        return `✅ *Comprovante recebido e aprovado!*

🎉 *Parabéns! Sua assinatura foi ativada!*

🔗 *Link de cadastro:*
https://resonant-sable-1eca3a.netlify.app/signup/${token}

⏰ *Válido por:* 24 horas

📋 *Próximos passos:*
1. Clique no link acima
2. Crie sua conta
3. Comece a usar a JurIA!

🚀 *Bem-vindo à revolução jurídica!*`;
      } else {
        return '❌ Erro ao processar pagamento. Tente novamente ou entre em contato com suporte.';
      }
      
    } catch (error) {
      console.error('Erro ao processar comprovante:', error);
      return '❌ Erro ao processar comprovante. Tente novamente.';
    }
  }

  async generateCadastroToken(userId, plan) {
    try {
      // Fazer requisição para API de tokens
      const response = await fetch('https://juria-ai-project.onrender.com/api/tokens/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: plan,
          whatsapp: userId,
          expiresIn: '24h'
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.token;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao gerar token:', error);
      return null;
    }
  }

  async saveMessage(userId, content, type) {
    try {
      await fetch('https://juria-ai-project.onrender.com/api/bot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp_id: userId,
          message: content,
          type: type,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
    }
  }

  getDefaultResponse() {
    return `🤖 *Não entendi seu comando.*

📋 *Comandos disponíveis:*
• *"detalhar solo"* - Detalhes do plano Solo
• *"detalhar escritório"* - Detalhes do plano Escritório  
• *"assinar solo"* - Contratar plano Solo
• *"assinar escritório"* - Contratar plano Escritório

Como posso te ajudar? 🚀`;
  }

  getStatus() {
    return {
      isReady: this.isReady,
      activeUsers: this.userStates.size
    };
  }
}

module.exports = WhatsAppBot;
