const express = require('express');
const router = express.Router();
const { chatCompletion } = require('../lib/openrouter');
const { upsertCase } = require('../services/cases');
const { upsertDeadline } = require('../services/calendar');
const { saveDocumentMeta } = require('../services/documents');
const { logReferences } = require('../services/references');
const { authOptional } = require('../middleware/auth');

// System prompts por agente
const SYSTEMS = {
  'assistente-prazos': `Você é o Assistente de Prazos. Objetivo: ler eventos do calendário, calcular prazos (considerando dias úteis se informado), sugerir datas e criar/atualizar eventos. Retorne sempre passos claros e, quando sugerir mudanças, inclua um JSON com { action: 'calendar.upsert', event: { title, description, date, time, type: 'deadline' } }. Linguagem: PT-BR, profissional e concisa.`,
  'analista-documentos': `Você é o Analista de Documentos. Objetivo: receber conteúdo de documentos (texto extraído), classificar, extrair campos e propor uma minuta. Retorne um resumo, campos extraídos (JSON) e, quando gerar minuta, inclua { action: 'documents.generate', name, content }. Linguagem: PT-BR, técnica e objetiva.`,
  'consultor-jurisprudencia': `Você é o Consultor de Jurisprudência. Objetivo: responder com base em jurisprudência e doutrina do contexto fornecido (RAG). Sempre inclua referências/links quando possível e um bloco final com { action: 'references', items: [{title, url}] }. Linguagem: PT-BR, cite fontes.`,
  'assistente-casos': `Você é o Assistente de Casos. Objetivo: criar/editar casos, sugerir próximos passos, atualizar status/priority. Ao propor mudanças, inclua { action: 'cases.upsert', case: { title, client, type, status, priority, deadline, description } }. Linguagem: PT-BR, orientada a ação.`,
};

// POST /api/agents/:agent/act
// body: { message: string, context?: any }
router.post('/:agent/act', authOptional, async (req, res) => {
  try {
    const agent = String(req.params.agent || '').toLowerCase();
    const system = SYSTEMS[agent];
    if (!system) return res.status(404).json({ error: 'Agente não encontrado' });

    const { message, context } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message (string) é obrigatório' });
    }

    const messages = [
      { role: 'system', content: system },
      { role: 'user', content: JSON.stringify({ message, context: context || null }) }
    ];

    const result = await chatCompletion(messages, { temperature: 0.2 });

    // Tentar extrair bloco de ação do texto do modelo
    const action = extractActionBlock(result.content || '');
    let persisted = null;
    let persistError = null;

    if (action && action.action) {
      try {
        const userId = req.user?.id || null;
        switch (action.action) {
          case 'cases.upsert': {
            const saved = await upsertCase(action.case || {}, userId);
            persisted = { type: 'case', record: saved };
            break;
          }
          case 'calendar.upsert': {
            const saved = await upsertDeadline(action.event || {}, userId);
            persisted = { type: 'deadline', record: saved };
            break;
          }
          case 'documents.save': {
            const saved = await saveDocumentMeta(action.document || {}, userId);
            persisted = { type: 'document', record: saved };
            break;
          }
          case 'references': {
            const saved = await logReferences(action.items || [], userId, { agent, message });
            persisted = { type: 'references', record: saved };
            break;
          }
          default:
            // Sem persistência automática para outras ações
            break;
        }
      } catch (e) {
        persistError = String(e.message || e);
      }
    }

    return res.json({ ok: true, agent, reply: result.content, raw: result.raw, action, persisted, persistError });
  } catch (e) {
    console.error('[agents.act] error', e);
    res.status(500).json({ error: 'agent_error', detail: String(e.message || e) });
  }
});

module.exports = router;

// Extrai bloco do tipo { action: 'x.y', ... } mesmo se vier com aspas simples
function extractActionBlock(text) {
  if (!text || typeof text !== 'string') return null;
  // Encontrar primeiro bloco { ... }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  let snippet = text.slice(start, end + 1).trim();
  // Normalizar: aspas simples -> duplas
  snippet = snippet.replace(/'/g, '"');
  // Garantir chaves com aspas (keys sem aspas):
  snippet = snippet.replace(/(\{|,|\s)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
  try {
    return JSON.parse(snippet);
  } catch (_) {
    return null;
  }
}
