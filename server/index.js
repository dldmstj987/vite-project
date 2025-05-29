const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// MySQL 연결
let db;
(async () => {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'eunseo',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'vite_blog',
    });
    console.log('✅ MySQL 연결 성공');
  } catch (err) {
    console.error('❌ DB 연결 실패:', err);
  }
})();

// 📌 게시글 API
app.get('/api/posts', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM posts ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: '글 없음' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post('/api/posts', async (req, res) => {
  const { title, content, is_public, thumbnail, nickname } = req.body;
  try {
    const sql = 'INSERT INTO posts (title, content, is_public, thumbnail, nickname) VALUES (?, ?, ?, ?, ?)';
    const values = [title, content, is_public === true, thumbnail, nickname];
    const [result] = await db.query(sql, values);
    res.json({ id: result.insertId, title, content, is_public, thumbnail, nickname });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.put('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, is_public } = req.body;
  try {
    await db.query('UPDATE posts SET title = ?, content = ?, is_public = ? WHERE id = ?', [title, content, is_public, id]);
    res.status(200).json({ message: '게시글 수정 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM posts WHERE id = ?', [id]);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post('/api/posts/:id/like', async (req, res) => {
  const postId = req.params.id;
  try {
    await db.query('UPDATE posts SET likes = likes + 1 WHERE id = ?', [postId]);
    const [rows] = await db.query('SELECT likes FROM posts WHERE id = ?', [postId]);
    res.json({ likes: rows[0].likes });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// 📌 댓글 API
app.get('/api/posts/:id/comments', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC', [id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post('/api/posts/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { nickname, content } = req.body;
  try {
    await db.query('INSERT INTO comments (post_id, nickname, content) VALUES (?, ?, ?)', [id, nickname, content]);
    res.sendStatus(201);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.put('/api/comments/:id', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  try {
    await db.query('UPDATE comments SET content = ? WHERE id = ?', [content, id]);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.delete('/api/comments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM comments WHERE id = ?', [id]);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 📌 유저 관련 API
app.post('/api/check-email', async (req, res) => {
  const { email } = req.body;
  try {
    const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    res.json({ exists: rows.length > 0 });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post('/api/signup', async (req, res) => {
  const { email, password, nickname } = req.body;
  try {
    const [emailRows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (emailRows.length > 0) return res.status(409).json({ message: '이미 등록된 이메일입니다.' });

    const [nickRows] = await db.query('SELECT id FROM users WHERE nickname = ?', [nickname]);
    if (nickRows.length > 0) return res.status(409).json({ message: '이미 사용 중인 닉네임입니다.' });

    const hashed = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (email, password, nickname) VALUES (?, ?, ?)', [email, hashed, nickname]);

    res.status(200).json({ message: '회원가입 완료', nickname });
  } catch (err) {
    res.status(500).json({ message: '회원가입 중 오류 발생' });
  }
});

app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ message: '이메일 또는 비밀번호가 틀렸습니다.' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: '이메일 또는 비밀번호가 틀렸습니다.' });

    res.json({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      name: user.name,
      bio: user.bio,
      profile_img: user.profile_img,
    });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err });
  }
});

app.get('/api/users/:nickname', async (req, res) => {
  const { nickname } = req.params;
  try {
    const [rows] = await db.query('SELECT nickname, IFNULL(bio, "") AS bio, IFNULL(profile_img, "") AS profile_img FROM users WHERE nickname = ?', [nickname]);
    if (rows.length === 0) return res.status(404).json({ message: '사용자 없음' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err });
  }
});

// 🧩 프론트엔드 정적 파일 제공
app.use(express.static(path.join(__dirname, '../dist')));

// 🎯 SPA 라우팅 지원
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 서버 시작
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
