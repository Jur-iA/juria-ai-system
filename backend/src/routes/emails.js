const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

// Simple shared-secret verification for inbound email webhooks
function verifySecret(req) {
  const secret = process.env.EMAIL_WEBHOOK_SECRET || '';
  const header = req.headers['x-email-secret'] || req.headers['x-webhook-secret'] || '';
  return secret && header && String(secret) === String(header);
}

// Provider -> POST /api/emails/inbound
// Expected JSON body (flexible by provider): { to, from, subject, text, html, user }
router.post('/inbound', express.json({ limit: '5mb' }), async (req, res) => {
  try {
    const allowDev = String(process.env.ALLOW_DEV_LOGIN || 'false').toLowerCase() === 'true';
    const devFlag = req.query.dev === '1' || req.query.dev === 'true';
    const isVerified = verifySecret(req);

    if (!isVerified && !(allowDev || devFlag)) {
      return res.status(401).json({ ok: false, error: 'invalid_webhook_secret' });
    }

    const { to, from, subject, text, html, user } = req.body || {};

    const recipient = (user || (Array.isArray(to) ? to[0] : to) || '').toString().toLowerCase();
    if (!recipient) return res.status(400).json({ ok: false, error: 'recipient_required' });

    const title = 'E-mail Recebido';
    const message = subject ? `Assunto: ${subject}` : 'Novo e-mail recebido';

    const payload = {
      user_id: recipient, // usamos o e-mail do destinatário como user_id (compatível com o app)
      title,
      message,
      type: 'email',
      severity: 'LOW',
      metadata: { to, from, subject, text, html, received_at: new Date().toISOString() },
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert([payload])
      .select()
      .single();

    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, record: data });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'unexpected', details: e.message });
  }
});

module.exports = router;
