const express = require('express');
const router = express.Router();
const { sign } = require('../lib/jwt');
const { authRequired } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');

// POST /api/auth/login
// Body: { email, password } - validates against Supabase table app_users
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email) return res.status(400).json({ ok: false, error: 'email_required' });
    if (!password) return res.status(400).json({ ok: false, error: 'password_required' });

    // Look up user in Supabase table `app_users`
    const { data, error } = await supabase
      .from('app_users')
      .select('email, password')
      .eq('email', email)
      .maybeSingle();

    const allowDev = String(process.env.ALLOW_DEV_LOGIN || 'true').toLowerCase() === 'true';
    const masterPass = process.env.DEV_MASTER_PASSWORD || '123456';
    const demoEmail = process.env.DEMO_EMAIL || 'teste@exemplo.com';

    if (error) {
      // If table missing or other server error, allow dev fallback
      if (allowDev && password === masterPass) {
        const user = { id: email, email };
        const isDemo = email === demoEmail;
        const token = sign(user, { expiresIn: isDemo ? '10m' : undefined });
        return res.json({ ok: true, token, user, dev: true, demo: isDemo });
      }
      return res.status(500).json({ ok: false, error: 'users_lookup_failed', details: error.message });
    }

    if (!data) {
      // Not found: allow dev fallback with master password
      if (allowDev && password === masterPass) {
        const user = { id: email, email };
        const isDemo = email === demoEmail;
        const token = sign(user, { expiresIn: isDemo ? '10m' : undefined });
        return res.json({ ok: true, token, user, dev: true, demo: isDemo });
      }
      return res.status(401).json({ ok: false, error: 'user_not_found' });
    }

    // Simple plaintext check for demo; replace with bcrypt in production
    if (data.password !== password) {
      // Wrong password for stored user; still allow dev fallback if enabled
      if (allowDev && password === masterPass) {
        const user = { id: email, email };
        const isDemo = email === demoEmail;
        const token = sign(user, { expiresIn: isDemo ? '10m' : undefined });
        return res.json({ ok: true, token, user, dev: true, demo: isDemo });
      }
      return res.status(401).json({ ok: false, error: 'invalid_credentials' });
    }

    const user = { id: email, email };
    const isDemo = email === demoEmail;
    const token = sign(user, { expiresIn: isDemo ? '10m' : undefined });
    res.json({ ok: true, token, user, demo: isDemo });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'unexpected', details: e.message });
  }
});

// GET /api/auth/me
router.get('/me', authRequired, async (req, res) => {
  res.json({ ok: true, user: req.user });
});

module.exports = router;
