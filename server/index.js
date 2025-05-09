const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 이미지 업로드 저장 위치 및 파일명 지정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // uploads 폴더에 저장
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName); // ex) 1715253949098-image.jpg
  }
});

// multer 인스턴스
const upload = multer({ storage });

// 업로드된 이미지 정적 폴더로 공개
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB 연결
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

// 전체 게시글 가져오기
app.get('/api/posts', (req, res) => {
  db.query('SELECT * FROM posts ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// 게시글 등록 (제목, 내용, 이미지, 공개여부)
app.post('/api/posts', upload.single('image'), (req, res) => {
  const { title, content, is_public } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const sql = `INSERT INTO posts (title, content, image_url, is_public) VALUES (?, ?, ?, ?)`;
  const values = [
    title,
    content,
    imageUrl,
    is_public === 'true' // 문자열 → 불리언 변환
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({
      id: result.insertId,
      title,
      content,
      image_url: imageUrl,
      is_public: is_public === 'true',
      likes: 0
    });
  });
});

// 좋아요 +1
app.put('/api/posts/:id/like', (req, res) => {
  const { id } = req.params;
  db.query('UPDATE posts SET likes = likes + 1 WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json(err);
    res.sendStatus(200);
  });
});

// 게시글 삭제
app.delete('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM posts WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json(err);
    res.sendStatus(200);
  });
});

// 서버 실행
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
