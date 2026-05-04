const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3456;
const DB_FILE = path.join(__dirname, 'community.json');

// Max body 10MB (thumbnails + grid data)
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// CORS for development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// --- DB helpers ---
function readDB() {
    try {
        if (fs.existsSync(DB_FILE)) {
            return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        }
    } catch (e) {
        console.error('DB read error:', e.message);
    }
    return [];
}

function writeDB(items) {
    fs.writeFileSync(DB_FILE, JSON.stringify(items), 'utf8');
}

// --- API ---

// GET all community projects
app.get('/api/community', (req, res) => {
    let items = readDB();
    let sort = req.query.sort || 'newest';
    if (sort === 'likes') items.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    else if (sort === 'name') items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    else items.sort((a, b) => (b.ts || 0) - (a.ts || 0));
    res.json(items);
});

// POST publish a new project
app.post('/api/community', (req, res) => {
    let { name, author, desc, data, thumb, avatar } = req.body;
    if (!name || typeof name !== 'string') return res.status(400).json({ error: 'name required' });
    if (!data || typeof data !== 'string') return res.status(400).json({ error: 'data required' });

    // Sanitize inputs
    name = name.slice(0, 40).trim();
    author = (author || 'Anonym').slice(0, 20).trim();
    desc = (desc || '').slice(0, 80).trim();
    if (typeof thumb !== 'string') thumb = '';
    if (typeof avatar !== 'string') avatar = '';

    let items = readDB();
    let entry = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name, author, desc,
        date: new Date().toLocaleString('cs-CZ'),
        ts: Date.now(),
        data, thumb, avatar,
        likes: 0
    };
    items.unshift(entry);
    if (items.length > 500) items = items.slice(0, 500);
    writeDB(items);
    res.json({ ok: true, id: entry.id });
});

// POST like/unlike a project
app.post('/api/community/:id/like', (req, res) => {
    let items = readDB();
    let item = items.find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'not found' });
    item.likes = (item.likes || 0) + 1;
    writeDB(items);
    res.json({ ok: true, likes: item.likes });
});

// POST unlike a project
app.post('/api/community/:id/unlike', (req, res) => {
    let items = readDB();
    let item = items.find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'not found' });
    item.likes = Math.max(0, (item.likes || 0) - 1);
    writeDB(items);
    res.json({ ok: true, likes: item.likes });
});

// DELETE a project
app.delete('/api/community/:id', (req, res) => {
    let items = readDB();
    let idx = items.findIndex(i => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'not found' });
    items.splice(idx, 1);
    writeDB(items);
    res.json({ ok: true });
});

// Start
app.listen(PORT, () => {
    console.log(`Sandbox community server running on http://localhost:${PORT}`);
});
