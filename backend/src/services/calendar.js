const { supabase } = require('../lib/supabase');

async function upsertDeadline(event = {}, userId = null) {
  const record = {
    title: event.title || 'Prazo',
    description: event.description || null,
    date: event.date || null,
    time: event.time || null,
    type: event.type || 'deadline',
    user_id: userId,
  };
  if (event.id) record.id = event.id;

  const { data, error } = await supabase
    .from('deadlines')
    .upsert(record)
    .select()
    .single();

  if (error) throw new Error(`[calendar.upsert] ${error.message}`);
  return data;
}

module.exports = { upsertDeadline };
