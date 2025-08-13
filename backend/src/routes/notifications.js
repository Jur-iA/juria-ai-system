const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');

// GET /api/notifications
router.get('/', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, data });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'unexpected', details: e.message });
  }
});

// POST /api/notifications (internal use or tests)
router.post('/', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, message, type = 'email', severity = 'LOW', metadata } = req.body || {};
    if (!title || !message) return res.status(400).json({ ok: false, error: 'title_and_message_required' });

    const { data, error } = await supabase
      .from('notifications')
      .insert([{ user_id: userId, title, message, type, severity, metadata }])
      .select()
      .single();

    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, record: data });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'unexpected', details: e.message });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('notifications')
      .update({ metadata: { ...(req.body?.metadata || {}), read: true } })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, record: data });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'unexpected', details: e.message });
  }
});

// DELETE /api/notifications/:id
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'unexpected', details: e.message });
  }
});

// DELETE /api/notifications (delete all for user)
router.delete('/', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'unexpected', details: e.message });
  }
});

module.exports = router;
