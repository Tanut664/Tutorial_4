const message = document.querySelector('#message');
const userTable = document.querySelector('#user-table');

function showMessage(text, isError = false) {
  message.textContent = text;
  message.className = isError ? 'error' : 'success';
}

async function requestJSON(url, options = {}) {
  const res = await fetch(url, options);
  let body = null;
  if (res.status !== 204) {
    const type = res.headers.get('content-type') || '';
    if (type.includes('application/json')) body = await res.json();
  }
  return { ok: res.ok, status: res.status, body };
}

async function postJSON(url, data) {
  return requestJSON(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

document.querySelector('#register-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  try {
    const { ok, body } = await postJSON('/api/register', Object.fromEntries(new FormData(form)));
    if (ok) {
      showMessage(`สมัครสมาชิกสำเร็จ ยินดีต้อนรับคุณ ${body.name}`);
      form.reset();
      await loadUsers();
    } else {
      showMessage(body?.error || 'สมัครสมาชิกไม่สำเร็จ', true);
    }
  } catch {
    showMessage('ติดต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่', true);
  }
});

document.querySelector('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const { ok, body } = await postJSON('/api/login', Object.fromEntries(new FormData(event.currentTarget)));
    if (ok) {
      showMessage(`เข้าสู่ระบบสำเร็จ สวัสดีคุณ ${body.user.name} (${body.user.role})`);
      event.currentTarget.reset();
    } else {
      showMessage(body?.error || 'เข้าสู่ระบบไม่สำเร็จ', true);
    }
  } catch {
    showMessage('ติดต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่', true);
  }
});

async function loadUsers() {
  try {
    const { ok, body } = await requestJSON('/api/users');
    if (!ok) throw new Error('โหลดข้อมูลไม่สำเร็จ');
    userTable.replaceChildren();

    for (const user of body) {
      const tr = document.createElement('tr');
      for (const value of [user.username, user.name, user.email, user.role]) {
        const td = document.createElement('td');
        td.textContent = value ?? '-';
        tr.appendChild(td);
      }

      const actionCell = document.createElement('td');
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'danger';
      deleteBtn.textContent = 'ลบ';
      deleteBtn.addEventListener('click', () => deleteUser(user.username));
      actionCell.appendChild(deleteBtn);
      tr.appendChild(actionCell);
      userTable.appendChild(tr);
    }
    if (body.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 5;
      td.textContent = 'ยังไม่มีสมาชิก';
      tr.appendChild(td);
      userTable.appendChild(tr);
    }
  } catch {
    showMessage('โหลดรายชื่อไม่สำเร็จ กรุณาตรวจสอบเซิร์ฟเวอร์', true);
  }
}

async function deleteUser(username) {
  if (!confirm(`ลบบัญชี ${username} ใช่หรือไม่?`)) return;
  try {
    const { ok, body } = await requestJSON(`/api/users/${encodeURIComponent(username)}`, { method: 'DELETE' });
    if (ok) {
      showMessage(`ลบบัญชี ${username} แล้ว`);
      await loadUsers();
    } else {
      showMessage(body?.error || 'ลบบัญชีไม่สำเร็จ', true);
    }
  } catch {
    showMessage('ติดต่อเซิร์ฟเวอร์ไม่ได้', true);
  }
}

loadUsers();
