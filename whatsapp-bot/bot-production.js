const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

console.log('🚀 JurIA Bot - PRODUÇÃO (SEM LOOP INFINITO!)');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './session-production'
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

// Contador de mensagens
let messageCount = 0;

// Cache para evitar processar a mesma mensagem múltiplas vezes
const processedMessages = new Set();

// Eventos do cliente
client.on('qr', (qr) => {
    console.log('\n📱 QR CODE PRODUÇÃO - ESCANEIE PARA CONECTAR:');
    console.log('='.repeat(60));
    qrcode.generate(qr, { small: true });
    console.log('='.repeat(60));
    console.log('💡 WhatsApp > Menu > Dispositivos conectados > Conectar dispositivo');
    console.log('🚫 IGNORA MENSAGENS PRÓPRIAS (sem loop infinito)');
    console.log('✅ RESPONDE APENAS A CLIENTES REAIS\n');
});

client.on('authenticated', () => {
    console.log('🔐 BOT PRODUÇÃO AUTENTICADO COM SUCESSO!');
});

client.on('ready', () => {
    console.log('✅ JURIA BOT PRODUÇÃO CONECTADO E FUNCIONANDO!');
    console.log('🤖 Aguardando mensagens de CLIENTES (não próprias)');
    console.log('📱 PIX: 04449816161 - Reginaldo Dias Junior');
    console.log('💰 Solo R$197/mês | Escritório R$147/usuário');
    console.log('\n🎯 PRONTO PARA VENDAS REAIS!\n');
});

client.on('message', async (message) => {
    try {
        // Criar ID único da mensagem para evitar duplicatas
        const messageId = `${message.from}_${message.timestamp}_${message.id._serialized}`;
        
        // Verificar se já processamos esta mensagem
        if (processedMessages.has(messageId)) {
            console.log('🔄 Mensagem já processada, ignorando duplicata');
            return;
        }
        
        // Adicionar ao cache
        processedMessages.add(messageId);
        
        // Limpar cache antigo (manter apenas últimas 100 mensagens)
        if (processedMessages.size > 100) {
            const oldMessages = Array.from(processedMessages).slice(0, 50);
            oldMessages.forEach(id => processedMessages.delete(id));
        }
        
        messageCount++;
        
        console.log('\n🔔 NOVA MENSAGEM RECEBIDA!');
        console.log(`📊 Contador: #${messageCount}`);
        console.log('📨 From:', message.from);
        console.log('💬 Body:', `"${message.body}"`);
        console.log('👤 FromMe:', message.fromMe);
        console.log('📱 Type:', message.type);
        console.log('🆔 MessageID:', messageId);
        
        // ⚠️ CRÍTICO: NÃO RESPONDER MENSAGENS PRÓPRIAS (evita loop infinito)
        if (message.fromMe) {
            console.log('🚫 IGNORANDO MENSAGEM PRÓPRIA (evita loop infinito)');
            return;
        }
        
        // Não processar mensagens vazias ou de notificação
        if (!message.body || message.body.trim() === '' || message.type === 'notification_template') {
            console.log('🚫 Ignorando mensagem vazia/notificação');
            return;
        }
        
        // PRODUÇÃO: Ignorar grupos silenciosamente (apenas conversas privadas)
        if (message.from.includes('@g.us')) {
            return; // Ignora grupos sem logs
        }
        
        // Verificar se é chat privado
        const chat = await message.getChat();
        if (chat.isGroup) {
            return; // Dupla verificação para grupos
        }
        
        // Obter informações do contato
        const contact = await message.getContact();
        const contactName = contact.name || contact.pushname || contact.number || 'Cliente';
        
        console.log(`👤 Nome do contato: ${contactName}`);
        console.log('✅ PROCESSANDO MENSAGEM DE CLIENTE!');
        
        // Detectar intenção do usuário (funil inteligente)
        // Função para remover acentos
        function removerAcentos(texto) {
            return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        }
        const userMsgRaw = message.body.trim();
        const userMsg = removerAcentos(userMsgRaw).toLowerCase();
        let funilResponse = null;
        // Controle de estado para saber se o usuário está aguardando envio de comprovante
        if (!global.waitingComprovante) global.waitingComprovante = {};
        const userId = message.from;
        // DETECÇÃO ROBUSTA DE MÍDIA - MÚLTIPLAS VERIFICAÇÕES
        let isImageOrDoc = false;
        
        // Verificação 1: Propriedades básicas
        if (message.hasMedia || message.type === 'image' || message.type === 'document') {
            isImageOrDoc = true;
        }
        
        // Verificação 2: Dados internos da mensagem
        if (message._data) {
            if (message._data.type === 'image' || message._data.type === 'document') {
                isImageOrDoc = true;
            }
            if (message._data.mimetype) {
                const mime = message._data.mimetype.toLowerCase();
                if (mime.includes('image') || mime.includes('pdf') || mime === 'application/pdf') {
                    isImageOrDoc = true;
                }
            }
        }
        
        // Verificação 3: Mensagem sem texto mas com mídia (comum no mobile)
        if (message.body === '' || message.body.trim() === '') {
            if (message.hasMedia || message.caption) {
                isImageOrDoc = true;
            }
        }
        
        // Verificação 4: Se tem caption (legenda), provavelmente é mídia
        if (message.caption !== undefined && message.caption !== null) {
            isImageOrDoc = true;
        }

        // DEBUG COMPLETO
        console.log(`🔍 DEBUG COMPLETO:`);
        console.log(`   UserId: ${userId}`);
        console.log(`   Message type: ${message.type}`);
        console.log(`   Has media: ${message.hasMedia}`);
        console.log(`   Message body: "${message.body}"`);
        console.log(`   Caption: "${message.caption || 'N/A'}"`);
        console.log(`   _data:`, JSON.stringify(message._data, null, 2));
        console.log(`   Is image/doc FINAL: ${isImageOrDoc}`);
        console.log(`   Waiting comprovante:`, global.waitingComprovante);
        console.log(`   User in waiting list: ${!!global.waitingComprovante[userId]}`);
        console.log('='.repeat(50));

        // Regex helpers
        const isSolo = /solo|aut[oô]nomo|individual/.test(userMsg);
        const isEscritorio = /escrit[oó]rio|equipe|colaborativo/.test(userMsg);
        const isDetalhar = /detalh(ar|e|es|a)|mais info|explica|completo/.test(userMsg);
        const isAssinar = /assinar|contratar|quero|pagar|token|cadastro|cadastrar/.test(userMsg);
        
        // Detecção específica para comandos de assinatura
        const isAssinarSolo = /assinar.*solo|solo.*assinar/.test(userMsg);
        const isAssinarEscritorio = /assinar.*escrit[oó]rio|escrit[oó]rio.*assinar/.test(userMsg);
        
        // DEBUG: Verificar se os regex estão funcionando
        console.log(`🔍 REGEX DEBUG:`);
        console.log(`   isSolo: ${isSolo}`);
        console.log(`   isEscritorio: ${isEscritorio}`);
        console.log(`   isDetalhar: ${isDetalhar}`);
        console.log(`   isAssinar: ${isAssinar}`);
        console.log(`   isAssinarSolo: ${isAssinarSolo}`);
        console.log(`   isAssinarEscritorio: ${isAssinarEscritorio}`);
        console.log(`   userMsg: "${userMsg}"`);

        // FUNIL: Se usuário está aguardando envio de comprovante e mandou MÍDIA REAL (imagem/PDF)
        // --- NOVO FLUXO: Recebeu comprovante, avisa grupo e aguarda liberação manual ---
        if (global.waitingComprovante[userId] && (isImageOrDoc || message.hasMedia)) {
            const plano = global.waitingComprovante[userId];
            // Salva estado de aguardando liberação
            if (!global.aguardandoLiberacao) global.aguardandoLiberacao = {};
            global.aguardandoLiberacao[userId] = { plano, nome: contactName };
            // Envia aviso ao grupo
            const chats = await client.getChats();
            const grupoPagamentos = chats.find(c => c.isGroup && c.name && c.name.toLowerCase().includes('pagamentos juria'));
            if (grupoPagamentos) {
                await client.sendMessage(grupoPagamentos.id._serialized,
                  `📥 Novo comprovante recebido!
Plano: *${plano}*
Nome: *${contactName}*
Número: *${userId}*

Para liberar, envie: /liberar ${userId}`);
            }
            // Responde ao cliente
            await client.sendMessage(message.from, 'Recebemos seu comprovante! Aguarde a validação, em breve você receberá o link de acesso.');
            delete global.waitingComprovante[userId];
            return; // NÃO EXECUTA MAIS NENHUM FLUXO PARA ESSA MENSAGEM
        }

        // --- Comando manual de liberação no grupo ---
        if (message.body && message.body.trim().toLowerCase().startsWith('/liberar')) {
            // Só processa se for no grupo correto
            if (chat.isGroup && chat.name && chat.name.toLowerCase().includes('pagamentos juria')) {
                const partes = message.body.trim().split(/\s+/);
                if (partes.length >= 2) {
                    const liberarId = partes[1];
                    if (global.aguardandoLiberacao && global.aguardandoLiberacao[liberarId]) {
                        const dados = global.aguardandoLiberacao[liberarId];
                        const axios = require('axios');
                        const backendUrl = 'http://localhost:3001/api/tokens';
                        const expiresAt = new Date(Date.now() + 1000*60*60*3).toISOString(); // 3h validade
                        const token = Math.random().toString(36).substring(2, 10) + Date.now().toString().slice(-4);
                        try {
                            const { data } = await axios.post(backendUrl, {
                                token,
                                phone: liberarId,
                                contactName: dados.nome,
                                expiresAt
                            });
                            await client.sendMessage(liberarId, `✅ Pagamento validado!\n\nSeu token de cadastro: *${token}*\n\nAcesse: https://juria.app/cadastro?token=${token}\n\nO link expira em 3 horas. Bem-vindo(a) ao JurIA!`);
                            await client.sendMessage(grupoPagamentos.id._serialized, `✅ Liberação concluída para ${dados.nome} (${liberarId})! Token enviado.`);
                            delete global.aguardandoLiberacao[liberarId];
                        } catch (err) {
                            await client.sendMessage(grupoPagamentos.id._serialized, `❌ Erro ao liberar token para ${liberarId}: ${err.message}`);
                        }
                    } else {
                        await client.sendMessage(grupoPagamentos.id._serialized, `Nenhum comprovante pendente para ${liberarId}.`);
                    }
                }
            }
        }

        // Funil de respostas (prioridade máxima para detalhar solo/escritório)
        if (/detalhar.*solo|solo.*detalhar/.test(userMsg)) {
            funilResponse = `📋 *PLANO SOLO* - R$ 197/mês\n\n• Para advogados autônomos\n• IA jurídica completa\n• Análise de documentos\n• Consulta de jurisprudência\n\nIdeal para quem quer praticidade e autonomia com IA jurídica de ponta.\n\nDeseja assinar? Envie "ASSINAR SOLO" para receber o link de cadastro!`;
        } else if (/detalhar.*escrit[oó]rio|escrit[oó]rio.*detalhar/.test(userMsg)) {
            funilResponse = `🏢 *PLANO ESCRITÓRIO* - R$ 147/usuário/mês\n\n• Para escritórios e equipes\n• Gestão colaborativa\n• Relatórios avançados\n\nIdeal para equipes que buscam produtividade, colaboração e controle.\n\nDeseja assinar? Envie "ASSINAR ESCRITORIO" para receber o link de cadastro!`;
        } else if (isDetalhar && !isSolo && !isEscritorio) {
            funilResponse = `🔎 Qual plano você deseja detalhar?\n\nResponda com:\n- "detalhar solo"\n- "detalhar escritório"`;
        } else if (isAssinarSolo || (isAssinar && isSolo)) {
            // Ativa modo de espera do comprovante para PLANO SOLO
            console.log(`🎯 EXECUTANDO CONDIÇÃO ASSINAR SOLO!`);
            global.waitingComprovante[userId] = 'SOLO';
            console.log(`✅ ATIVANDO MODO ESPERA SOLO para ${userId}`);
            console.log(`🔍 Estado após salvar:`, global.waitingComprovante);
            funilResponse = `💸 Para assinar o *PLANO SOLO*, envie o comprovante do PIX para este número:

*Chave PIX:* 04449816161
*Nome:* Reginaldo Dias Junior

Assim que recebermos, você receberá o link de acesso!`;
        } else if (isAssinarEscritorio || (isAssinar && isEscritorio)) {
            // Ativa modo de espera do comprovante para PLANO ESCRITÓRIO
            global.waitingComprovante[userId] = 'ESCRITORIO';
            console.log(`✅ ATIVANDO MODO ESPERA ESCRITÓRIO para ${userId}`);
            funilResponse = `💸 Para assinar o *PLANO ESCRITÓRIO*, envie o comprovante do PIX para este número:

*Chave PIX:* 04449816161
*Nome:* Reginaldo Dias Junior

Assim que recebermos, você receberá o link de acesso!`;
        } else if (isSolo) {
            funilResponse = `📋 *PLANO SOLO* - R$ 197/mês\n\n• Para advogados autônomos\n• IA jurídica completa\n• Análise de documentos\n• Consulta de jurisprudência\n\nPara mais detalhes, responda "detalhar solo".\nPara assinar, envie o comprovante do PIX para este número. Assim que recebermos, você receberá o link de acesso.`;
        } else if (isEscritorio) {
            funilResponse = `🏢 *PLANO ESCRITÓRIO* - R$ 147/usuário/mês\n\n• Para escritórios e equipes\n• Gestão colaborativa\n• Relatórios avançados\n\nPara mais detalhes, responda "detalhar escritório".\nPara assinar, envie o comprovante do PIX para este número. Assim que recebermos, você receberá o link de acesso.`;
        } else if (isAssinar) {
            funilResponse = `💸 Para assinar, especifique o plano: "ASSINAR SOLO" ou "ASSINAR ESCRITÓRIO".`;
        }

        if (funilResponse) {
            await client.sendMessage(message.from, funilResponse);
            console.log('✅ Funil inteligente: resposta enviada!');
            return;
        }

        // Resposta padrão (vitrine)
        const response = `🤖 *JurIA - IA Jurídica*

Olá *${contactName}*! 👋

Obrigado por entrar em contato!

🎯 *NOSSOS PLANOS:*

🟢 *PLANO SOLO* - R$ 197/mês
• Para advogados autônomos
• IA jurídica completa
• Análise de documentos
• Consulta de jurisprudência

🔵 *PLANO ESCRITÓRIO* - R$ 147/usuário/mês
• Para escritórios e equipes
• Gestão colaborativa
• Relatórios avançados

💰 *PIX para assinar:*
• Chave: 04449816161
• Nome: Reginaldo Dias Junior

🚀 Qual plano te interessa mais?

_Responda "SOLO" ou "ESCRITORIO" para mais detalhes!_

*Atendimento automatizado* | *${new Date().toLocaleTimeString()}*`;

        console.log('📤 ENVIANDO RESPOSTA DE VENDAS...');
        await client.sendMessage(message.from, response);
        console.log('✅ RESPOSTA ENVIADA COM SUCESSO!');
        console.log(`📊 Vendas para: ${contactName} (${chatType})`);
        console.log('='.repeat(80));
        
    } catch (error) {
        console.error('❌ ERRO ao processar mensagem:', error.message);
        
        // Tentar enviar mensagem de erro simples (sem loop)
        try {
            if (!message.fromMe) { // Só responder se não for mensagem própria
                await client.sendMessage(message.from, '🤖 Oi! Sou o JurIA Bot. Houve um problema, mas estou funcionando!');
                console.log('✅ Mensagem de erro enviada');
            }
        } catch (errorMsg) {
            console.error('❌ Falha ao enviar erro:', errorMsg.message);
        }
    }
});

client.on('disconnected', (reason) => {
    console.log('⚠️ Bot desconectado:', reason);
    console.log('🔄 Tentando reconectar em 10 segundos...');
    setTimeout(() => {
        console.log('🔄 Reiniciando bot produção...');
        client.initialize();
    }, 10000);
});

client.on('auth_failure', (msg) => {
    console.error('❌ Falha na autenticação:', msg);
    console.log('🔄 Escaneie o QR Code novamente');
});

// Inicializar
console.log('🔄 Inicializando Cliente Produção...');
client.initialize();

// Heartbeat
setInterval(() => {
    console.log(`💓 Bot Produção funcionando... ${new Date().toLocaleTimeString()} | Mensagens: ${messageCount}`);
}, 30000); // A cada 30 segundos

// Tratamento de erros
process.on('unhandledRejection', (err) => {
    console.error('❌ Erro não tratado:', err.message);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Exceção não capturada:', err.message);
});

console.log('🚀 BOT PRODUÇÃO - SEM LOOP INFINITO - PRONTO PARA VENDAS!');
