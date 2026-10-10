const express = require('express');
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

const MONGO_URL = 'mongodb://127.0.0.1:27017';
const DATABASE_NAME = 'account-db';
const PORT = 3000;

const app = express();
app.use(express.json({ limit: '20kb' }));
app.use(express.static('public'));

let users;
const HIDE_PASSWORD = { projection: { passwordHash: 0 } };

app.post('/api/register', async (req, res) => {
  const { username, name, email, password } = req.body ?? {};

  if (![username, name, email, password].every(v => typeof v === 'string' && v.trim())) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' });
  }
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({ error: 'username ต้องเป็น a-z, 0-9 หรือ _ ยาว 3–20 ตัว' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร' });
  }
  if (name.trim().length > 100 || email.trim().length > 254) {
    return res.status(400).json({ error: 'ชื่อหรืออีเมลยาวเกินกำหนด' });
  }

  const user = {
    username,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: 'member',
    createdAt: new Date()
  };

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await users.insertOne({ ...user, passwordHash });
    return res.status(201).json({ _id: result.insertedId, ...user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'username หรือ email นี้ถูกใช้แล้ว' });
    }
    console.error(err);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'กรุณากรอก username และรหัสผ่าน' });
  }

  const user = await users.findOne({ username });
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!ok) {
    return res.status(401).json({ error: 'username หรือรหัสผ่านไม่ถูกต้อง' });
  }

  await users.updateOne(
    { _id: user._id },
    { $inc: { loginCount: 1 }, $set: { lastLoginAt: new Date() } }
  );
  return res.json({
    message: 'เข้าสู่ระบบสำเร็จ',
    user: { username: user.username, name: user.name, role: user.role }
  });
});

app.get('/api/users', async (_req, res) => {
  const list = await users.find({}, HIDE_PASSWORD).sort({ createdAt: -1 }).toArray();
  res.json(list);
});

app.delete('/api/users/:username', async (req, res) => {
  const result = await users.deleteOne({ username: req.params.username });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'ไม่พบผู้ใช้นี้' });
  }
  return res.status(204).end();
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

async function main() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  users = client.db(DATABASE_NAME).collection('users');
  await users.createIndex({ username: 1 }, { unique: true });
  await users.createIndex({ email: 1 }, { unique: true });

  app.listen(PORT, () => {
    console.log('เชื่อมต่อ MongoDB สำเร็จ');
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

main().catch(err => {
  console.error('เชื่อมต่อฐานข้อมูลไม่สำเร็จ:', err.message);
  process.exit(1);
});
