const { supabase } = require('../lib/supabase');

async function saveDocumentMeta(doc = {}, userId = null) {
  const record = {
    name: doc.name || 'documento.txt',
    path: doc.path || null,
    url: doc.url || null,
    type: doc.type || 'text/plain',
    size: doc.size || null,
    extracted_fields: doc.fields || doc.extracted_fields || null,
    summary: doc.summary || null,
    user_id: userId,
  };
  if (doc.id) record.id = doc.id;

  const { data, error } = await supabase
    .from('documents')
    .upsert(record)
    .select()
    .single();

  if (error) throw new Error(`[documents.save] ${error.message}`);
  return data;
}

module.exports = { saveDocumentMeta };
