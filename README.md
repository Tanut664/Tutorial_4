# MongoDB + Node.js Membership Workshop

## ความสามารถ
- สมัครสมาชิกและตรวจสอบข้อมูลจากฝั่งเซิร์ฟเวอร์
- เข้าสู่ระบบโดยตรวจรหัสผ่านด้วย `bcryptjs`
- บันทึกข้อมูลถาวรใน MongoDB ฐานข้อมูล `account-db` คอลเลกชัน `users`
- ป้องกัน username และ email ซ้ำด้วย unique indexes
- แสดงรายชื่อสมาชิกโดยไม่ส่ง `passwordHash` ไปหน้าเว็บ
- ลบบัญชีสมาชิก
- นับจำนวนครั้งที่เข้าสู่ระบบและบันทึกเวลาเข้าสู่ระบบล่าสุด

## สิ่งที่ต้องติดตั้ง
1. Node.js LTS
2. MongoDB Community Server ที่กำลังทำงาน
3. Visual Studio Code
4. Google Chrome

## วิธีติดตั้งและเปิดใช้งาน (Windows PowerShell)
เปิด PowerShell ในโฟลเดอร์นี้ แล้วรัน:

```powershell
npm install
npm start
```

เปิด Chrome ที่ `http://localhost:3000`

> MongoDB ในเครื่องต้องทำงานและรับการเชื่อมต่อที่ `mongodb://127.0.0.1:27017` ก่อนเปิดเว็บ

## ทดลองระบบ
1. สมัครสมาชิกโดยใช้ username ตัวพิมพ์เล็ก ตัวเลข หรือ `_` ความยาว 3–20 ตัว
2. รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร
3. ลองสมัครด้วย username หรือ email เดิมเพื่อทดสอบการป้องกันข้อมูลซ้ำ
4. เข้าสู่ระบบด้วยรหัสผ่านถูกและผิด
5. ดูรายชื่อสมาชิก แล้วทดลองลบบัญชี
6. กด `Ctrl+C` ใน terminal แล้วใช้ `npm start` เปิดใหม่ ข้อมูลควรยังอยู่ใน MongoDB
7. เปิด MongoDB Compass เชื่อมต่อ `mongodb://127.0.0.1:27017` แล้วดู `account-db` > `users`

## API
| Method | URL | หน้าที่ |
|---|---|---|
| POST | `/api/register` | สมัครสมาชิก |
| POST | `/api/login` | เข้าสู่ระบบ |
| GET | `/api/users` | แสดงรายชื่อสมาชิก โดยไม่ส่ง passwordHash |
| DELETE | `/api/users/:username` | ลบบัญชี |
| GET | `/api/health` | ตรวจสถานะเซิร์ฟเวอร์ |

## ไฟล์ในโปรเจกต์
- `app.js` — Express server และ API
- `public/index.html` — หน้าเว็บ
- `public/script.js` — เรียก API ด้วย `fetch()`
- `db-test.js` — ทดสอบการเชื่อมต่อ MongoDB
- `user-test.js` — ทดลอง bcrypt และการตรวจสอบรหัสผ่าน
- `package.json` — รายการแพ็กเกจและคำสั่งรัน
- `.gitignore` — ไม่ส่ง `node_modules` ขึ้น Git

## หมายเหตุด้านความปลอดภัย
โครงงานนี้เป็นตัวอย่างเพื่อการเรียน ไม่ใช่ระบบ production: ยังไม่มี session/JWT, การควบคุมสิทธิ์ผู้ลบ, rate limiting หรือ HTTPS และ endpoint ลบบัญชียังเปิดให้ผู้เข้าถึงเว็บเรียกได้ ควรใช้ข้อมูลทดลองเท่านั้น
