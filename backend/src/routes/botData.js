// API para integração do bot WhatsApp com o painel admin

const express = require('express');
const router = express.Router();
const botAnalytics = require('../services/botAnalytics');

// Obter dados do bot para o painel admin
router.get('/stats', async (req, res) => {
  try {
    const stats = await botAnalytics.getStatsForAdmin();
    if (!stats) {
      return res.status(500).json({ error: 'Erro ao obter dados do bot' });
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Erro ao obter stats do bot:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Registrar mensagem recebida (chamado pelo bot)
router.post('/message-received', async (req, res) => {
  try {
    const { from, body, type } = req.body;
    await botAnalytics.recordMessageReceived(from, body, type);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao registrar mensagem recebida:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Registrar mensagem enviada (chamado pelo bot)
router.post('/message-sent', async (req, res) => {
  try {
    const { to, body, type } = req.body;
    await botAnalytics.recordMessageSent(to, body, type);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao registrar mensagem enviada:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Registrar comprovante recebido (chamado pelo bot)
router.post('/comprovante-received', async (req, res) => {
  try {
    const { from, mediaType } = req.body;
    await botAnalytics.recordComprovante(from, mediaType);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao registrar comprovante:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Registrar token gerado (chamado pelo sistema de vendas)
router.post('/token-generated', async (req, res) => {
  try {
    const { for_user, plan } = req.body;
    await botAnalytics.recordTokenGenerated(for_user, plan);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao registrar token:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar conversas ativas
router.post('/active-conversations', async (req, res) => {
  try {
    const { count } = req.body;
    await botAnalytics.updateActiveConversations(count);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao atualizar conversas ativas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Zerar dados do bot (para o botão reset do admin)
router.post('/reset', async (req, res) => {
  try {
    await botAnalytics.resetData();
    res.json({ success: true, message: 'Dados do bot zerados com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao zerar dados do bot:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
