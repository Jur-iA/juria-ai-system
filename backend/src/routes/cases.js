const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/auth');
const { upsertCase } = require('../services/cases');
const { supabase } = require('../lib/supabase');

router.get('/', authRequired, async (req, res) => {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, data });
});

router.post('/', authRequired, async (req, res) => {
  try {
    const saved = await upsertCase(req.body || {}, req.user.id);
    res.json({ ok: true, data: saved });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

module.exports = router;
