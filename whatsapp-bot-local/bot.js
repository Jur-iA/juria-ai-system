const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

console.log('🚀 JurIA Bot LOCAL - Desenvolvimento e Testes');

// Configurações
const BACKEND_URL = 'https://juria-ai-project.onrender.com';

// GRUPO ESPECÍFICO DO USUÁRIO
const GRUPO_NOTIFICACAO_ID = '120363417778458272@g.us'; // Pagamentos JurIA Advogados 😊
const ADMIN_GRUPO_ID = '120363417778458272@g.us'; // Mesmo grupo para comandos admin
const NOME_GRUPO_PAGAMENTOS = 'Pagamentos JurIA Advogados 😊';

// Controle de liberações pendentes
const liberacoesPendentes = new Map(); // numero -> {nome, plano, timestamp}

// Função para detectar Chromium (Windows)
function findChromium() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'
  ];
  
  for (const path of candidates) {
    if (fs.existsSync(path)) {
      console.log('✅ Chrome encontrado:', path);
      return path;
    }
  }
  
  console.log('⚠️ Chrome não encontrado, usando Puppeteer padrão');
  return null;
}

// Cliente WhatsApp
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './session'
  }),
  puppeteer: {
    headless: false, // Modo visual para desenvolvimento
    executablePath: findChromium(),
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--disable-gpu'
    ]
  }
});

// Função para registrar leads no backend
async function registrarLead(numero, nome, origem) {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/leads`, {
      telefone: numero,
      nome: nome || 'Não informado',
      origem: origem,
      timestamp: new Date().toISOString(),
      status: 'novo'
    });
    
    console.log('✅ Lead registrado no backend:', numero, '-', origem);
    return response.data;
  } catch (error) {
    console.log('⚠️ Erro ao registrar lead (backend offline):', error.message);
    
    // Salvar localmente se backend estiver offline
    const leadLocal = {
      telefone: numero,
      nome: nome,
      origem: origem,
      timestamp: new Date().toISOString(),
      status: 'pendente_sync'
    };
    
    // Salvar em arquivo local
    const leadsFile = './leads-local.json';
    let leads = [];
    
    if (fs.existsSync(leadsFile)) {
      leads = JSON.parse(fs.readFileSync(leadsFile, 'utf8'));
    }
    
    leads.push(leadLocal);
    fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2));
    
    console.log('💾 Lead salvo localmente:', numero);
    return leadLocal;
  }
}

// Função para notificar grupo
async function notificarGrupo(mensagem) {
  try {
    if (GRUPO_NOTIFICACAO_ID) {
      await client.sendMessage(GRUPO_NOTIFICACAO_ID, mensagem);
      console.log('✅ Notificação enviada ao grupo:', NOME_GRUPO_PAGAMENTOS);
    } else {
      console.log('⚠️ Grupo de pagamentos não configurado. Mensagem:', mensagem);
    }
  } catch (error) {
    console.error('❌ Erro ao notificar grupo:', error.message);
  }
}

// Event Handlers
client.on('qr', (qr) => {
  console.log('\n' + '='.repeat(50));
  console.log('📱 ESCANEIE O QR CODE COM SEU WHATSAPP:');
  console.log('='.repeat(50));
  
  // QR Code bem pequeno para caber na tela
  qrcode.generate(qr, { small: true });
  
  console.log('='.repeat(50));
  console.log('💡 WhatsApp > Dispositivos conectados > Conectar');
  console.log('='.repeat(50));
  console.log('');
});

client.on('ready', () => {
  console.log('✅ JURIA BOT LOCAL CONECTADO! 🚀');
  console.log('🎯 Funcionalidades ativas:');
  console.log('   • Filtro "site:" para leads do website');
  console.log('   • Integração com backend');
  console.log('   • Mensagens formatadas corretamente');
  console.log('   • Logs detalhados para debug');
  console.log('');
  console.log(`✅ Grupo de pagamentos: ${NOME_GRUPO_PAGAMENTOS}`);
  console.log(`📋 ID configurado: ${GRUPO_NOTIFICACAO_ID}`);
  console.log('');
});

client.on('authenticated', () => {
  console.log('🔐 Sessão autenticada com sucesso!');
});

client.on('auth_failure', (msg) => {
  console.error('❌ Falha na autenticação:', msg);
});

client.on('disconnected', (reason) => {
  console.log('⚠️ Bot desconectado:', reason);
  console.log('🔄 Para reconectar, execute: npm start');
});

client.on('message_create', async (msg) => {
  try {
    // Ignorar mensagens próprias
    if (msg.fromMe) return;
    
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const text = (msg.body || '').trim();
    
    // COMANDOS ADMIN NO GRUPO
    if (chat.isGroup && chat.id._serialized === ADMIN_GRUPO_ID) {
      if (text.startsWith('/liberar ')) {
        const numeroParaLiberar = text.replace('/liberar ', '').trim();
        
        // Verificar se há liberação pendente
        if (liberacoesPendentes.has(numeroParaLiberar)) {
          const dadosCliente = liberacoesPendentes.get(numeroParaLiberar);
          
          // Gerar token único
          const tokenUnico = 'JURIA-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
          
          // Enviar token para o cliente
          const mensagemToken = `🎉 *PAGAMENTO APROVADO!*

✅ Seu acesso foi liberado com sucesso!

🔗 *Link de cadastro JurIA:*
https://resonant-sable-1eca3a.netlify.app/cadastro/${tokenUnico}

👤 *Próximos passos:*
1️⃣ Clique no link acima
2️⃣ Preencha seus dados
3️⃣ Crie sua conta
4️⃣ Comece a usar a JurIA!

⚠️ *IMPORTANTE:* Este link é único e válido por 24h!

🚀 Bem-vindo à revolução da advocacia digital!

❓ *Dúvidas?* Pode chamar aqui mesmo!`;

          console.log(`🎫 Token gerado: ${tokenUnico} para ${numeroParaLiberar}`);
          
          await client.sendMessage(numeroParaLiberar + '@c.us', mensagemToken);
          
          // Confirmar no grupo
          await msg.reply(`✅ Token liberado para ${dadosCliente.nome} (${numeroParaLiberar})`);
          
          // Remover da lista de pendentes
          liberacoesPendentes.delete(numeroParaLiberar);
          
          console.log(`🔓 Token liberado para: ${numeroParaLiberar}`);
        } else {
          await msg.reply(`❌ Não há liberação pendente para ${numeroParaLiberar}`);
        }
        return;
      }
      
      // Outros comandos admin podem ser adicionados aqui
      return; // Ignorar outras mensagens do grupo
    }
    
    // FILTRO PRINCIPAL: Apenas mensagens DIRETAS (privadas) ou do SITE
    if (chat.isGroup) {
      console.log('🚫 Mensagem de grupo ignorada');
      return;
    }
    
    // Obter informações do contato (já obtidas acima)
    const numero = contact.number;
    const nome = contact.pushname || contact.name || 'Sem nome';
    const textLower = text.toLowerCase();
    
    console.log(`\n📨 Nova mensagem DIRETA de ${nome} (${numero}): "${text}"`);
    
    // FILTRO SITE: Detectar origem do lead
    let origem = 'whatsapp_direto';
    
    if (textLower.includes('site:') || textLower.includes('website') || textLower.includes('landing') || textLower.includes('botao') || textLower.includes('demo do juria')) {
      origem = 'website';
      console.log('🌐 LEAD DO WEBSITE DETECTADO!');
    }
    
    // Registrar lead no backend
    await registrarLead(numero, nome, origem);
    
    // COMANDOS DO BOT
    if (textLower === 'planos' || textLower === 'preços' || textLower.includes('demo do juria') || textLower === 'oi' || textLower === 'olá' || textLower === 'ola' || textLower === 'menu') {
      const mensagem = `🤖 *Olá! Sou a JurIA - IA Jurídica Avançada!*

🏢 *NOSSOS PLANOS:*

👤 *PLANO SOLO - R$ 197/mês*
• 🧠 IA Jurídica personalizada
• 📄 Geração de documentos
• ⏰ Gestão de prazos automática
• 📊 Dashboard individual
• 💬 Suporte 24/7

🏛️ *PLANO ESCRITÓRIO - R$ 497/mês*
• 👥 Até 10 usuários
• 🧠 IA Jurídica avançada
• 📄 Documentos ilimitados
• ⏰ Gestão completa de casos
• 📊 Dashboard administrativo
• 🔄 Integração com sistemas
• 💬 Suporte prioritário

💡 *Para saber mais sobre um plano específico:*
• Digite "solo" para detalhes do Plano Solo
• Digite "escritorio" para detalhes do Plano Escritório`;
      
      await msg.reply(mensagem);
      console.log('✅ Resposta enviada: PLANOS COMPLETOS');
      return;
    }

    // PLANO SOLO ESPECÍFICO
    if (textLower === 'solo') {
      const mensagem = `👤 *PLANO SOLO - R$ 197/mês*

🎯 *IDEAL PARA:*
• Advogados autônomos
• Profissionais liberais
• Pequenos escritórios (1 pessoa)

⚡ *FUNCIONALIDADES:*
• 🧠 IA Jurídica personalizada
• 📄 Geração automática de petições
• ⏰ Controle de prazos inteligente
• 📊 Dashboard individual
• 🔍 Pesquisa jurisprudencial
• 💬 Suporte 24/7

💳 *Para contratar, digite "contratar solo"*`;
      
      await msg.reply(mensagem);
      console.log('✅ Resposta enviada: PLANO SOLO DETALHADO');
      return;
    }

    // PLANO ESCRITÓRIO ESPECÍFICO
    if (textLower === 'escritorio' || textLower === 'escritório') {
      const mensagem = `🏛️ *PLANO ESCRITÓRIO - R$ 497/mês*

🎯 *IDEAL PARA:*
• Escritórios de advocacia
• Equipes jurídicas
• Departamentos jurídicos

⚡ *FUNCIONALIDADES:*
• 👥 Até 10 usuários simultâneos
• 🧠 IA Jurídica avançada
• 📄 Documentos ilimitados
• ⏰ Gestão completa de casos
• 📊 Dashboard administrativo
• 🔄 Integração com sistemas
• 📈 Relatórios e analytics
• 💬 Suporte prioritário

💳 *Para contratar, digite "contratar escritorio"*`;
      
      await msg.reply(mensagem);
      console.log('✅ Resposta enviada: PLANO ESCRITÓRIO DETALHADO');
      return;
    }

    if (textLower === 'contratar solo' || textLower === 'contratar') {
      const mensagem = `💳 *CONTRATAÇÃO PLANO SOLO*

💰 Valor: R$ 197,00/mês

🏦 *DADOS PARA PIX:*
Chave PIX: 04449816161
Nome: Reginaldo Dias Junior

📱 *Após fazer o PIX:*
Envie o comprovante aqui no chat

⚡ Processamento em até 2 horas!`;
      
      await msg.reply(mensagem);
      console.log('✅ Resposta enviada: CONTRATAR SOLO');
      return;
    }

    if (textLower === 'contratar escritorio' || textLower === 'contratar escritório') {
      const mensagem = `💳 *CONTRATAÇÃO PLANO ESCRITÓRIO*

💰 Valor: R$ 497,00/mês

🏦 *DADOS PARA PIX:*
Chave PIX: 04449816161
Nome: Reginaldo Dias Junior

📱 *Após fazer o PIX:*
Envie o comprovante aqui no chat

⚡ Processamento em até 2 horas!`;
      
      await msg.reply(mensagem);
      console.log('✅ Resposta enviada: CONTRATAR ESCRITÓRIO');
      return;
    }

    // DETECÇÃO DE COMPROVANTE (texto, PDF ou imagem)
    const isComprovante = textLower === 'pagar' || 
                         textLower.includes('comprovante') || 
                         msg.hasMedia || 
                         (msg.type === 'document' && msg.body.toLowerCase().includes('.pdf')) ||
                         (msg.type === 'image');
    
    if (isComprovante) {
      // Detectar qual plano baseado no contexto ou assumir SOLO como padrão
      let plano = 'SOLO';
      let valor = 'R$ 197,00';
      
      // Salvar liberação pendente
      liberacoesPendentes.set(numero, {
        nome: nome,
        plano: plano,
        timestamp: new Date().toISOString()
      });
      
      const mensagem = `✅ *Comprovante recebido!*

⏳ Aguarde a validação, em breve você receberá o link de acesso.

🔄 Nossa equipe está analisando seu pagamento...`;
      
      await msg.reply(mensagem);
      console.log('✅ Resposta enviada: COMPROVANTE RECEBIDO (PDF/Imagem)');
      
      // Notificar grupo para liberação manual
      const notificacao = `🔔 *Novo comprovante recebido!*
Plano: ${plano}
Nome: ${nome}
Número: ${numero}

Para liberar, envie: /liberar ${numero}`;
      
      await notificarGrupo(notificacao);
      console.log('📢 Notificação enviada ao grupo');
      return;
    }

    // Comando não reconhecido - sugerir opções
    if (!['planos', 'preços', 'solo', 'escritorio', 'escritório', 'contratar', 'contratar solo', 'contratar escritorio', 'contratar escritório', 'pagar'].some(cmd => textLower.includes(cmd))) {
      const mensagem = `🤖 *Olá! Sou a JurIA!*

💡 *Comandos disponíveis:*
• "planos" – Ver todos os planos
• "solo" – Detalhes Plano Solo
• "escritorio" – Detalhes Plano Escritório
• "contratar" – Iniciar contratação`;
      
      await msg.reply(mensagem);
      console.log('✅ Resposta enviada: AJUDA');
    }
    
  } catch (err) {
    console.error('❌ Erro ao processar mensagem:', err.message);
    console.error('Stack:', err.stack);
  }
});

// Inicializar o cliente
console.log('🔄 Inicializando JurIA Bot Local...');
console.log('📍 Sessão será salva em: ./session');
console.log('📄 Leads locais em: ./leads-local.json');
console.log('');

client.initialize();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Parando bot...');
  client.destroy();
  process.exit(0);
});
