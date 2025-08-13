// Serviço para capturar dados do bot WhatsApp e enviar para o painel admin

const fs = require('fs').promises;
const path = require('path');

class BotAnalyticsService {
  constructor() {
    this.dataFile = path.join(__dirname, '../data/bot-analytics.json');
    this.initializeData();
  }

  async initializeData() {
    try {
      await fs.access(this.dataFile);
    } catch (error) {
      // Arquivo não existe, criar com dados iniciais
      const initialData = {
        messagesReceived: 0,
        messagesSent: 0,
        comprovantesReceived: 0,
        tokensGenerated: 0,
        activeConversations: 0,
        recentActivity: [],
        dailyStats: {},
        conversationHistory: []
      };
      
      // Criar diretório se não existir
      const dir = path.dirname(this.dataFile);
      await fs.mkdir(dir, { recursive: true });
      
      await fs.writeFile(this.dataFile, JSON.stringify(initialData, null, 2));
      console.log('📊 Bot Analytics: Arquivo de dados criado');
    }
  }

  async getData() {
    try {
      const data = await fs.readFile(this.dataFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Erro ao ler dados do bot:', error);
      return null;
    }
  }

  async updateData(updates) {
    try {
      const currentData = await this.getData();
      if (!currentData) return false;

      const newData = { ...currentData, ...updates };
      await fs.writeFile(this.dataFile, JSON.stringify(newData, null, 2));
      console.log('📊 Bot Analytics: Dados atualizados', updates);
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar dados do bot:', error);
      return false;
    }
  }

  // Registrar mensagem recebida
  async recordMessageReceived(from, body, type = 'text') {
    const data = await this.getData();
    if (!data) return;

    data.messagesReceived++;
    
    // Atualizar estatísticas diárias
    const today = new Date().toISOString().split('T')[0];
    if (!data.dailyStats[today]) {
      data.dailyStats[today] = { received: 0, sent: 0, comprovantes: 0 };
    }
    data.dailyStats[today].received++;

    // Adicionar à atividade recente
    data.recentActivity.unshift({
      type: 'message_received',
      from: from.replace('@c.us', ''),
      action: `Enviou: "${body.substring(0, 50)}${body.length > 50 ? '...' : ''}"`,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    });

    // Manter apenas últimas 20 atividades
    data.recentActivity = data.recentActivity.slice(0, 20);

    await this.updateData(data);
  }

  // Registrar mensagem enviada
  async recordMessageSent(to, body, type = 'text') {
    const data = await this.getData();
    if (!data) return;

    data.messagesSent++;
    
    // Atualizar estatísticas diárias
    const today = new Date().toISOString().split('T')[0];
    if (!data.dailyStats[today]) {
      data.dailyStats[today] = { received: 0, sent: 0, comprovantes: 0 };
    }
    data.dailyStats[today].sent++;

    // Adicionar à atividade recente
    data.recentActivity.unshift({
      type: 'message_sent',
      from: 'Bot JurIA',
      action: `Respondeu: "${body.substring(0, 50)}${body.length > 50 ? '...' : ''}"`,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    });

    data.recentActivity = data.recentActivity.slice(0, 20);
    await this.updateData(data);
  }

  // Registrar comprovante recebido
  async recordComprovante(from, mediaType) {
    const data = await this.getData();
    if (!data) return;

    data.comprovantesReceived++;
    
    // Atualizar estatísticas diárias
    const today = new Date().toISOString().split('T')[0];
    if (!data.dailyStats[today]) {
      data.dailyStats[today] = { received: 0, sent: 0, comprovantes: 0 };
    }
    data.dailyStats[today].comprovantes++;

    // Adicionar à atividade recente
    data.recentActivity.unshift({
      type: 'payment_proof',
      from: from.replace('@c.us', ''),
      action: `Enviou comprovante (${mediaType})`,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    });

    data.recentActivity = data.recentActivity.slice(0, 20);
    await this.updateData(data);
  }

  // Registrar token gerado
  async recordTokenGenerated(for_user, plan) {
    const data = await this.getData();
    if (!data) return;

    data.tokensGenerated++;

    // Adicionar à atividade recente
    data.recentActivity.unshift({
      type: 'token_generated',
      from: 'Admin',
      action: `Token liberado para ${for_user} (${plan})`,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    });

    data.recentActivity = data.recentActivity.slice(0, 20);
    await this.updateData(data);
  }

  // Atualizar conversas ativas
  async updateActiveConversations(count) {
    const data = await this.getData();
    if (!data) return;

    data.activeConversations = count;
    await this.updateData(data);
  }

  // Obter estatísticas para o painel admin
  async getStatsForAdmin() {
    const data = await this.getData();
    if (!data) return null;

    const today = new Date().toISOString().split('T')[0];
    const todayStats = data.dailyStats[today] || { received: 0, sent: 0, comprovantes: 0 };

    return {
      messagesReceived: data.messagesReceived,
      messagesSent: data.messagesSent,
      comprovantesReceived: data.comprovantesReceived,
      tokensGenerated: data.tokensGenerated,
      activeConversations: data.activeConversations,
      recentActivity: data.recentActivity,
      todayStats,
      totalDays: Object.keys(data.dailyStats).length
    };
  }

  // Zerar dados (para o botão de reset do admin)
  async resetData() {
    const initialData = {
      messagesReceived: 0,
      messagesSent: 0,
      comprovantesReceived: 0,
      tokensGenerated: 0,
      activeConversations: 0,
      recentActivity: [],
      dailyStats: {},
      conversationHistory: []
    };

    await fs.writeFile(this.dataFile, JSON.stringify(initialData, null, 2));
    console.log('🗑️ Bot Analytics: Dados zerados');
    return true;
  }
}

module.exports = new BotAnalyticsService();
