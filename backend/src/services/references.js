const { supabase } = require('../lib/supabase');

async function logReferences(items = [], userId = null, meta = {}) {
  // items: [{ title, url }]
  const rows = (items || []).map((it) => ({
    title: it.title || null,
    url: it.url || null,
    user_id: userId,
    meta
  }));
  if (!rows.length) return [];

  const { data, error } = await supabase
    .from('references')
    .insert(rows)
    .select();

  if (error) throw new Error(`[references.log] ${error.message}`);
  return data;
}

module.exports = { logReferences };
