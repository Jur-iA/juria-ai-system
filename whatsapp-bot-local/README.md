# 🚀 JurIA WhatsApp Bot - Desenvolvimento Local

Bot WhatsApp completo da JurIA com todas as funcionalidades avançadas.

## 🎯 Funcionalidades

### ✅ Implementadas
- **Menu interativo** - Comandos: oi, olá, menu
- **Planos e preços** - Comando: planos, preços  
- **Contratação** - Comando: contratar
- **Pagamento** - Comando: pagar, comprovante
- **Filtro "site:"** - Detecta leads do website
- **Integração backend** - Registra leads em https://juria-ai-project.onrender.com
- **Notificações** - Alerta sobre novos pagamentos
- **Logs detalhados** - Para debug e monitoramento
- **Sessão persistente** - LocalAuth salva sessão
- **QR Code pequeno** - Cabe na tela do terminal

### 🔧 Configurações

- **Modo visual** - `headless: false` para desenvolvimento
- **Sessão local** - Salva em `./session`
- **Backup offline** - Leads salvos em `./leads-local.json`
- **Chrome detection** - Encontra Chrome no Windows automaticamente

## 🚀 Como usar

### 1. Instalar dependências
```bash
cd whatsapp-bot-local
npm install
```

### 2. Iniciar bot
```bash
npm start
```

### 3. Escanear QR Code
- Abra WhatsApp no celular
- Vá em "Dispositivos conectados"
- Escaneie o QR Code que aparece no terminal

### 4. Testar comandos
Envie mensagens para o bot:
- `oi` - Menu principal
- `planos` - Ver planos disponíveis
- `contratar` - Iniciar contratação  
- `pagar` - Confirmar pagamento

## 📁 Estrutura

```
whatsapp-bot-local/
├── bot.js              # Bot principal
├── package.json        # Dependências
├── README.md          # Este arquivo
├── session/           # Sessão WhatsApp (criada automaticamente)
└── leads-local.json   # Backup local de leads
```

## 🔧 Desenvolvimento

### Scripts disponíveis
- `npm start` - Iniciar bot
- `npm run dev` - Iniciar com nodemon (reinicia automaticamente)
- `npm run test` - Executar testes

### Debug
- Logs detalhados no console
- Modo visual (janela do Chrome aberta)
- Backup local se backend estiver offline

## 🌐 Integração Backend

O bot se conecta automaticamente ao backend:
- **URL**: https://juria-ai-project.onrender.com
- **Endpoint**: POST /api/leads
- **Fallback**: Salva localmente se offline

## 🚀 Deploy para Produção

Após testar localmente:
1. Configurar `headless: true`
2. Ajustar caminhos para Linux
3. Configurar PM2
4. Fazer upload para VPS

## 📞 Suporte

Bot desenvolvido para JurIA - IA Jurídica Avançada
