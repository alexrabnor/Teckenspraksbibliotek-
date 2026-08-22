import express from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://databasen.alexcloud.se';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

const APP_PIN = String(process.env.APP_PIN || '');
const SESSION_SECRET = String(process.env.SESSION_SECRET || '');
const SESSION_DAYS = 30;
const COOKIE = 'tsbib_session';

if (!DIRECTUS_TOKEN || !APP_PIN || !SESSION_SECRET) {
  console.error('DIRECTUS_TOKEN, APP_PIN och SESSION_SECRET maste finnas i .env.');
  process.exit(1);
}

// Kollektioner som far lasas via proxyn.
const TILLATNA = new Set(['teckensprak_resurser', 'teckensprak_dokument']);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });

app.set('trust proxy', true);
app.use(cookieParser());
app.use(express.json());

// --- Inloggning (kravs for att radera) ---
function skapaSession() {
  const utgar = Date.now() + SESSION_DAYS * 86400000;
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(String(utgar)).digest('hex');
  return utgar + '.' + sig;
}

function giltigSession(token) {
  if (typeof token !== 'string') return false;
  const [utgar, sig] = token.split('.');
  if (!utgar || !sig || !/^[0-9]+$/.test(utgar)) return false;
  if (Number(utgar) < Date.now()) return false;
  const vantad = crypto.createHmac('sha256', SESSION_SECRET).update(utgar).digest('hex');
  const a = Buffer.from(sig);
  const b = Buffer.from(vantad);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const forsok = new Map();
const klientIp = (req) => req.headers['cf-connecting-ip'] || req.ip || 'okand';

app.post('/api/login', (req, res) => {
  const ip = klientIp(req);
  const rad = forsok.get(ip);
  if (rad && rad.antal >= 5 && Date.now() - rad.senast <= 15 * 60 * 1000) {
    return res.status(429).json({ error: 'For manga forsok - vanta 15 minuter.' });
  }
  const pin = String(req.body?.pin || '');
  const ratt =
    pin.length === APP_PIN.length &&
    crypto.timingSafeEqual(Buffer.from(pin), Buffer.from(APP_PIN));
  if (!ratt) {
    forsok.set(ip, { antal: rad && Date.now() - rad.senast <= 15 * 60 * 1000 ? rad.antal + 1 : 1, senast: Date.now() });
    return res.status(401).json({ error: 'Fel kod' });
  }
  forsok.delete(ip);
  res.cookie(COOKIE, skapaSession(), { httpOnly: true, secure: true, sameSite: 'lax', maxAge: SESSION_DAYS * 86400000 });
  res.json({ ok: true });
});

app.get('/api/session', (req, res) => {
  res.json({ inloggad: giltigSession(req.cookies?.[COOKIE]) });
});

function kravInloggning(req, res, next) {
  if (giltigSession(req.cookies?.[COOKIE])) return next();
  res.status(401).json({ error: 'Inloggning kravs' });
}

// --- Lasproxy: token server-side, aldrig i bundlen ---
app.use('/directus', async (req, res) => {
  const rest = req.originalUrl.replace(/^\/directus/, '');
  const traff = rest.split('?')[0].match(/^\/items\/([a-z_]+)/);
  if (!traff || !TILLATNA.has(traff[1]) || req.method !== 'GET') {
    return res.status(403).json({ error: 'Otillaten resurs' });
  }
  try {
    const svar = await fetch(`${DIRECTUS_URL}${rest}`, {
      headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}`, 'Content-Type': 'application/json' },
    });
    const text = await svar.text();
    res.status(svar.status).type(svar.headers.get('content-type') || 'application/json').send(text);
  } catch (e) {
    res.status(502).json({ error: 'Kunde inte na databasen' });
  }
});

// Upload fil till Directus
// Uppladdning och nya resurser kraver inloggning. Utan det kan vem som helst
// pa internet lagga upp filer (500 MB styck) i Directus med appens token.
app.post('/api/upload', kravInloggning, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  console.log(`[upload] ${req.file.originalname} (${(req.file.size/1024/1024).toFixed(2)} MB)`);
  try {
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype || 'application/octet-stream' });
    const form = new globalThis.FormData();
    form.append('file', blob, req.file.originalname);

    const response = await fetch(`${DIRECTUS_URL}/files`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` },
      body: form,
      signal: AbortSignal.timeout(120000), // 2 min timeout
    });
    if (!response.ok) {
      const err = await response.text();
      console.error(`[upload] Directus error for ${req.file.originalname}:`, err);
      return res.status(500).json({ error: 'Directus upload failed', detail: err });
    }
    const data = await response.json();
    console.log(`[upload] OK: ${req.file.originalname} → ${data.data.id}`);
    res.json({ file_id: data.data.id, filename: data.data.filename_download });
  } catch (e) {
    console.error(`[upload] Exception for ${req.file.originalname}:`, e.message);
    res.status(500).json({ error: e.message });
  }
});

// Spara resurs-metadata till Directus
app.post('/api/resources', kravInloggning, async (req, res) => {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/teckensprak_resurser`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    if (!response.ok) return res.status(500).json({ error: await response.text() });
    res.json(await response.json());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Ta bort resurs
app.delete('/api/resources/:id', async (req, res) => {
  if (!giltigSession(req.cookies?.[COOKIE])) {
    return res.status(401).json({ error: 'Radering kraver inloggning' });
  }
  try {
    await fetch(`${DIRECTUS_URL}/items/teckensprak_resurser/${req.params.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` },
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(express.static(path.join(__dirname, 'dist'), {
  index: false,
  setHeaders(res, filePath) {
    if (/\.(html|json)$/.test(filePath)) res.setHeader('Cache-Control', 'no-cache');
    else res.setHeader('Cache-Control', 'public, max-age=86400');
  },
}));

app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Teckenspraksbibliotek running on port ${PORT}`);
});
