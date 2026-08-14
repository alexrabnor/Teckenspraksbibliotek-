import express from 'express';
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

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Upload fil till Directus
app.post('/api/upload', upload.single('file'), async (req, res) => {
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
app.post('/api/resources', async (req, res) => {
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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Teckenspraksbibliotek running on port ${PORT}`);
});
