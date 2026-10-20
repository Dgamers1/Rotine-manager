const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Aviso: configure SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY no ambiente.');
}

const admin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

app.get('/config.js', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ supabaseUrl: SUPABASE_URL || '', supabaseAnonKey: SUPABASE_ANON_KEY || '' });
});

async function authenticatedUser(req, res, next) {
  try {
    if (!admin) return res.status(503).json({ error: 'Supabase não configurado no servidor.' });
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Autenticação necessária.' });
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    req.user = data.user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(500).json({ error: 'Erro ao validar sessão.' });
  }
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/data', authenticatedUser, async (req, res) => {
  try {
    const { data, error } = await admin.from('user_data').select('data').eq('user_id', req.user.id).maybeSingle();
    if (error) throw error;
    res.json({ data: data?.data ?? null });
  } catch (error) {
    console.error('Load data error:', error.message);
    res.status(500).json({ error: 'Não foi possível carregar os dados.' });
  }
});
app.put('/api/data', authenticatedUser, async (req, res) => {
  try {
    const payload = req.body?.data;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return res.status(400).json({ error: 'Formato de dados inválido.' });
    }
    const { error } = await admin.from('user_data').upsert(
      { user_id: req.user.id, data: payload, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    console.error('Save data error:', error.message);
    res.status(500).json({ error: 'Não foi possível salvar os dados.' });
  }
});

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
app.get(/.*/, (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(`Dgamer server listening on ${PORT}`));
