const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGO_URL = 'mongodb://127.0.0.1:27017';
const DATABASE_NAME = 'account-db';

async function main() {
  const client = new MongoClient(MONGO_URL);
  try {
    await client.connect();
    const users = client.db(DATABASE_NAME).collection('users');
    const username = 'somchai';
    const email = 'somchai@example.com';

    // ทำให้สคริปต์รันซ้ำได้โดยไม่สร้างบัญชี somchai ซ้ำ
    let user = await users.findOne({ username });
    if (!user) {
      const passwordHash = await bcrypt.hash('P@ssw0rd', 10);
      await users.insertOne({
        username,
        name: 'สมชาย ใจดี',
        email,
        role: 'member',
        passwordHash,
        createdAt: new Date()
      });
      console.log(`สร้างผู้ใช้ ${username} แล้ว`);
      user = await users.findOne({ username });
    } else {
      console.log(`มีผู้ใช้ ${username} อยู่แล้ว จึงไม่เพิ่มซ้ำ`);
    }

    console.log('รหัสผ่านถูกต้อง:', await bcrypt.compare('P@ssw0rd', user.passwordHash));
    console.log('รหัสผ่านผิด:', await bcrypt.compare('123456', user.passwordHash));
    const list = await users.find({}, { projection: { passwordHash: 0 } }).toArray();
    console.log('รายชื่อโดยไม่แสดง passwordHash:', list);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
