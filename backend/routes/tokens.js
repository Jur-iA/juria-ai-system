const express = require('express');
const { supabase } = require('../src/lib/supabase');
const router = express.Router();

// Criar novo token de acesso (rota para bot WhatsApp)
router.post('/create', async (req, res) => {
  try {
    const { phone, contactName, plan, amount } = req.body;

    if (!phone || !contactName) {
      return res.status(400).json({ 
        error: 'Phone e contactName são obrigatórios' 
      });
    }

    // Gerar token único
    const token = 'JURIA-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // Expirar em 24 horas
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('access_tokens')
      .insert([{
        token,
        phone,
        contact_name: contactName,
        plan: plan || 'solo',
        amount: amount || 'R$ 197,00',
        expires_at: expiresAt,
        used: false,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;

    console.log(`✅ Token criado: ${token} para ${contactName} (${phone})`);
    res.json({ 
      success: true, 
      token: token,
      data: data[0],
      link: `https://resonant-sable-1eca3a.netlify.app/cadastro/${token}`
    });

  } catch (error) {
    console.error('❌ Erro ao criar token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Criar novo token de acesso (rota original)
router.post('/', async (req, res) => {
  try {
    const { token, phone, contactName, expiresAt } = req.body;

    if (!token || !phone || !contactName || !expiresAt) {
      return res.status(400).json({ 
        error: 'Token, phone, contactName e expiresAt são obrigatórios' 
      });
    }

    const { data, error } = await supabase
      .from('access_tokens')
      .insert([{
        token,
        phone,
        contact_name: contactName,
        expires_at: expiresAt,
        used: false,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;

    console.log(`✅ Token criado: ${token} para ${contactName} (${phone})`);
    res.json({ success: true, data: data[0] });

  } catch (error) {
    console.error('❌ Erro ao criar token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Validar token para cadastro
router.get('/validate/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const { data, error } = await supabase
      .from('access_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return res.status(400).json({ 
        error: 'Token inválido, expirado ou já utilizado' 
      });
    }

    res.json({ 
      valid: true, 
      data: {
        token: data.token,
        contactName: data.contact_name,
        phone: data.phone,
        expiresAt: data.expires_at
      }
    });

  } catch (error) {
    console.error('❌ Erro ao validar token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Usar token (marcar como usado após cadastro)
router.post('/use/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { userId } = req.body;

    const { data, error } = await supabase
      .from('access_tokens')
      .update({ 
        used: true, 
        used_at: new Date().toISOString(),
        user_id: userId 
      })
      .eq('token', token)
      .eq('used', false)
      .select();

    if (error || !data.length) {
      return res.status(400).json({ 
        error: 'Token inválido ou já utilizado' 
      });
    }

    console.log(`✅ Token usado: ${token} por usuário ${userId}`);
    res.json({ success: true });

  } catch (error) {
    console.error('❌ Erro ao usar token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Listar tokens (admin)
router.get('/admin/list', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('access_tokens')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json({ tokens: data });

  } catch (error) {
    console.error('❌ Erro ao listar tokens:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
