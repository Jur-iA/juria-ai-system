# Assistente Jurídica IA - Integração OpenRouter

Este projeto é uma aplicação React + TypeScript que implementa uma assistente jurídica especializada em direito brasileiro, integrada com a API do OpenRouter para respostas inteligentes.

## 🚀 Configuração da API OpenRouter

### 1. Obter Chave da API
1. Acesse [OpenRouter](https://openrouter.ai/keys)
2. Crie uma conta ou faça login
3. Gere uma nova chave de API

### 2. Configurar Variáveis de Ambiente
1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e substitua `your_openrouter_api_key_here` pela sua chave real:
   ```env
   VITE_OPENROUTER_API_KEY=sk-or-v1-sua-chave-aqui
   ```

## 📦 Instalação e Execução

### Instalar dependências:
```bash
npm install
```

### Executar em modo de desenvolvimento:
```bash
npm run dev
```

### Porta do servidor de desenvolvimento (obrigatória)

- O projeto usa Vite fixo na porta **5174**.
- Arquivo: `vite.config.ts` com `server.port = 5174` e `server.strictPort = true` (sem fallback).
- Se aparecer erro de porta ocupada, finalize o processo que está usando a 5174 e rode novamente.
  - Windows (PowerShell):
    ```powershell
    netstat -ano | findstr :5174
    # pegue o PID e finalize
    taskkill /PID <PID_ENCONTRADO> /F
    ```
  - Ou altere/feche o outro app que esteja rodando na 5174.


### Build para produção:
```bash
npm run build
```

## 🔧 Funcionalidades

- **Chat Inteligente**: Integração com OpenRouter para respostas jurídicas especializadas
- **Interface Moderna**: Design responsivo com Tailwind CSS
- **Tratamento de Erros**: Mensagens claras quando a API não está configurada
- **Indicadores Visuais**: Status da configuração da API no header
- **Sugestões Contextuais**: Botões de ação rápida para consultas comuns

## 🛠️ Estrutura do Projeto

```
src/
├── services/
│   └── openRouterService.ts    # Serviço de integração com OpenRouter
├── pages/
│   └── ChatPage.tsx           # Página principal do chat
├── components/
├── contexts/
└── ...
```

## 🔍 Exemplo de Uso da API

O serviço `openRouterService` implementa a chamada para a API OpenRouter conforme especificado:

```typescript
// Exemplo de uso interno
const response = await openRouterService.sendLegalQuery(
  "Como calcular juros de mora em contratos?"
);
```

## ⚠️ Solução de Problemas

### API não configurada
- Verifique se o arquivo `.env` existe na raiz do projeto
- Confirme se a variável `VITE_OPENROUTER_API_KEY` está definida corretamente
- Reinicie o servidor de desenvolvimento após alterar o `.env`

### Erros de conexão
- Verifique sua conexão com a internet
- Confirme se a chave da API é válida
- Verifique se há créditos suficientes na sua conta OpenRouter

## 📝 Modelos Disponíveis

Por padrão, o sistema usa `openai/gpt-3.5-turbo`, mas você pode modificar o modelo no arquivo `openRouterService.ts` para usar outros modelos disponíveis no OpenRouter.

## 🤝 Contribuição

Este projeto integra a API OpenRouter conforme solicitado, permitindo que a IA forneça respostas jurídicas especializadas em tempo real.
