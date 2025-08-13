// Simple E2E test: health -> login -> list cases -> agent act -> list cases
const BASE = process.env.BASE_URL || 'http://localhost:3001';

async function getFetch() {
  if (typeof fetch !== 'undefined') return fetch;
  const mod = await import('node-fetch');
  return mod.default;
}

async function main() {
  try {
    const fetch = await getFetch();
    console.log('--- HEALTH ---');
    const h = await fetch(`${BASE}/api/health`).then(r => r.json());
    console.log(h);

    console.log('--- LOGIN ---');
    const lres = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@local' })
    });
    const ltext = await lres.text();
    let login;
    try {
      login = JSON.parse(ltext);
    } catch (_) {
      console.error('LOGIN RAW:', ltext.slice(0, 400));
      throw new Error('Login did not return JSON');
    }
    console.log(login);
    const token = login && login.token;
    if (!token) throw new Error('No token from login');

    const headers = { Authorization: `Bearer ${token}` };

    console.log('--- CASES (before) ---');
    const before = await fetch(`${BASE}/api/cases`, { headers }).then(r => r.json());
    console.log(before);

    console.log('--- AGENT (assistente-casos) ---');
    const agent = await fetch(`${BASE}/api/agents/assistente-casos/act`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message: 'Criar caso trabalhista cliente Maria prioridade alta prazo 2025-08-30' })
    }).then(r => r.json());
    console.log(agent);

    console.log('--- CASES (after) ---');
    const after = await fetch(`${BASE}/api/cases`, { headers }).then(r => r.json());
    console.log(after);
  } catch (e) {
    console.error('E2E ERROR:', e.message);
    process.exitCode = 1;
  }
}

main();
