const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { supabase } = require('./lib/supabase');
const agentsRouter = require('./routes/agents');
const authRouter = require('./routes/auth');
const casesRouter = require('./routes/cases');
const calendarRouter = require('./routes/calendar');
const documentsRouter = require('./routes/documents');
const notificationsRouter = require('./routes/notifications');
const emailsRouter = require('./routes/emails');
const botDataRouter = require('./routes/botData');

const app = express();

app.use(cors({ origin: '*'}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Upload de documentos para Supabase Storage (bucket)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024) } });

app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Arquivo não enviado' });
    const bucket = process.env.SUPABASE_BUCKET || 'documents';
    const ext = req.file.originalname.split('.').pop()?.toLowerCase() || 'bin';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) return res.status(500).json({ error: error.message });

    // Obter URL pública
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return res.json({
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
      path: data.path,
      url: pub.publicUrl,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Falha no upload' });
  }
});

// Agentes de IA
app.use('/api/agents', agentsRouter);

// Auth & CRUD
app.use('/api/auth', authRouter);
app.use('/api/cases', casesRouter);
app.use('/api/deadlines', calendarRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/emails', emailsRouter);

// Bot WhatsApp data (sem autenticação - usado pelo bot)
app.use('/api/bot', botDataRouter);

// Tokens de cadastro (sem autenticação - usado pelo bot WhatsApp)
const tokensRouter = require('./routes/tokens');
app.use('/api/tokens', tokensRouter);

module.exports = app;
