import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import argon2 from 'argon2';
import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const db = new Database(process.env.DB_PATH || path.join(__dirname, 'amira.db'));
const isProd = process.env.NODE_ENV === 'production';
const SESSION_DAYS = 14;

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));

// SQLite schema. Password hashes and session IDs are never exposed to the client.
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS memories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
`);

function cookieOptions() {
  return { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/', maxAge: SESSION_DAYS * 86400000 };
}

function hashSessionId(id) {
  return crypto.createHash('sha256').update(id).digest('hex');
}

function createSession(userId) {
  const raw = nanoid(48);
  const id = hashSessionId(raw);
  const now = Date.now();
  db.prepare('INSERT INTO sessions (id,user_id,expires_at,created_at) VALUES (?,?,?,?)')
    .run(id, userId, now + SESSION_DAYS * 86400000, now);
  return raw;
}

function auth(req, res, next) {
  const raw = req.cookies.amira_session;
  if (!raw) return res.status(401).json({ error: 'Authentication required' });
  const row = db.prepare(`SELECT s.id,s.expires_at,u.id user_id,u.email,u.display_name
    FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=?`).get(hashSessionId(raw));
  if (!row || row.expires_at <= Date.now()) {
    if (row) db.prepare('DELETE FROM sessions WHERE id=?').run(row.id);
    res.clearCookie('amira_session', { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/' });
    return res.status(401).json({ error: 'Session expired' });
  }
  req.user = { id: row.user_id, email: row.email, displayName: row.display_name, sessionId: row.id };
  next();
}

app.post('/api/auth/register', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const displayName = String(req.body?.displayName || '').trim();
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 10 || displayName.length < 1 || displayName.length > 80)
    return res.status(400).json({ error: 'Use a valid email, a password of at least 10 characters, and a name.' });
  try {
    const hash = await argon2.hash(password, { type: argon2.argon2id });
    const result = db.prepare('INSERT INTO users (email,password_hash,display_name,created_at) VALUES (?,?,?,?)').run(email, hash, displayName, Date.now());
    const session = createSession(result.lastInsertRowid);
    res.cookie('amira_session', session, cookieOptions());
    res.status(201).json({ user: { email, displayName } });
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) return res.status(409).json({ error: 'Account already exists.' });
    console.error(e); res.status(500).json({ error: 'Could not create account.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const user = db.prepare('SELECT id,email,password_hash,display_name FROM users WHERE email=?').get(email);
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
  try {
    if (!(await argon2.verify(user.password_hash, password))) return res.status(401).json({ error: 'Invalid email or password.' });
    const session = createSession(user.id);
    res.cookie('amira_session', session, cookieOptions());
    res.json({ user: { email: user.email, displayName: user.display_name } });
  } catch { res.status(401).json({ error: 'Invalid email or password.' }); }
});

app.post('/api/auth/logout', auth, (req, res) => {
  db.prepare('DELETE FROM sessions WHERE id=?').run(req.user.sessionId);
  res.clearCookie('amira_session', { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/' });
  res.status(204).end();
});

app.get('/api/auth/me', auth, (req, res) => res.json({ user: { email: req.user.email, displayName: req.user.displayName } }));

app.get('/api/content', auth, (req, res) => {
  const memories = db.prepare('SELECT id,title,body,created_at createdAt FROM memories ORDER BY id DESC').all();
  res.json({ user: { displayName: req.user.displayName }, memories });
});

app.post('/api/content/memories', auth, (req, res) => {
  const title = String(req.body?.title || '').trim();
  const body = String(req.body?.body || '').trim();
  if (!title || !body || title.length > 120 || body.length > 5000) return res.status(400).json({ error: 'Invalid memory.' });
  const result = db.prepare('INSERT INTO memories (title,body,created_at) VALUES (?,?,?)').run(title, body, Date.now());
  res.status(201).json({ id: result.lastInsertRowid });
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`AmiRa running on port ${port}`));
