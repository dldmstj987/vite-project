const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'eunseo',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'vite_blog'
});

db.connect((err) => {
  if (err) return console.error('❌ DB 연결 실패:', err);
  console.log('✅ MySQL 연결 성공');
});

app.get('/api/posts', (req, res) => {
  db.query('SELECT * FROM posts ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.get('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM posts WHERE id = ?', [id], (err, rows) => {
    if (err) return res.status(500).json(err);
    if (rows.length === 0) return res.status(404).json({ message: '글 없음' });
    res.json(rows[0]);
  });
});

app.post('/api/posts', (req, res) => {
  const { title, content, is_public, thumbnail } = req.body;
  const sql = 'INSERT INTO posts (title, content, is_public, thumbnail) VALUES (?, ?, ?, ?)';
  const values = [title, content, is_public === true, thumbnail];
  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, title, content, is_public, thumbnail });
  });
});

{/* 이메일 중복 체크 API */}
app.post('/api/check-email', (req, res) => {
  const { email } = req.body;

  const sql = 'SELECT id FROM users WHERE email = ?';
  db.query(sql, [email], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json({ exists: rows.length > 0 });
  });
});

{/*회원가입 API */}
app.post('/api/signup', async (req, res) => {
  const { email, password, nickname } = req.body;

  try {
    // 중복 이메일
    db.query('SELECT id FROM users WHERE email = ?', [email], async (err, emailRows) => {
      if (err) return res.status(500).json(err);
      if (emailRows.length > 0) return res.status(409).json({ message: '이미 등록된 이메일입니다.' });

      // 중복 닉네임
      db.query('SELECT id FROM users WHERE nickname = ?', [nickname], async (err, nickRows) => {
        if (err) return res.status(500).json(err);
        if (nickRows.length > 0) return res.status(409).json({ message: '이미 사용 중인 닉네임입니다.' });

        const hashed = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (email, password, nickname) VALUES (?, ?, ?)';
        db.query(sql, [email, hashed, nickname], (err, result) => {
          if (err) return res.status(500).json(err);
          res.status(200).json({ message: '회원가입 완료', nickname });
        });
      });
    });
  } catch (err) {
    console.error('회원가입 실패:', err);
    res.status(500).json({ message: '회원가입 중 오류 발생' });
  }
});

// GET /api/users/:nickname
app.get('/api/users/:nickname', (req, res) => {
  const { nickname } = req.params;
  const sql = 'SELECT nickname, bio, profile_img FROM users WHERE nickname = ?';
  db.query(sql, [nickname], (err, rows) => {
    if (err) return res.status(500).json(err);
    if (rows.length === 0) return res.status(404).json({ message: '사용자 없음' });
    res.json(rows[0]);
  });
});


app.delete('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM posts WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json(err);
    res.sendStatus(200);
  });
});

app.put('/api/posts/:id/like', (req, res) => {
  const { id } = req.params;
  db.query('UPDATE posts SET likes = likes + 1 WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json(err);
    res.sendStatus(200);
  });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
