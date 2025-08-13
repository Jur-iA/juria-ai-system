const { supabase } = require('../lib/supabase');

async function upsertCase(payload, userId = null) {
  const record = {
    title: payload.title || 'Sem título',
    client: payload.client || null,
    type: payload.type || null,
    status: payload.status || 'Em andamento',
    priority: payload.priority || null,
    deadline: payload.deadline || null,
    description: payload.description || null,
    user_id: userId,
  };

  // Se vier id, atualiza; senão cria
  if (payload.id) record.id = payload.id;

  const { data, error } = await supabase
    .from('cases')
    .upsert(record)
    .select()
    .single();

  if (error) throw new Error(`[cases.upsert] ${error.message}`);
  return data;
}

module.exports = { upsertCase };
