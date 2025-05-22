import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5050/api/posts/${id}`)
      .then((res) => setPost(res.data))
      .catch((err) => console.error('글 불러오기 실패:', err));
  }, [id]);

  if (!post) return <p style={{ textAlign: 'center' }}>로딩 중...</p>;

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>{post.title} {!post.is_public && <span style={styles.lock}>🔒</span>}</h1>
      <p style={styles.date}>📅 {new Date(post.created_at).toLocaleDateString()}</p>

      <div
        style={styles.content}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.image_url && (
        <img
          src={`http://localhost:5050${post.image_url}`}
          alt="첨부 이미지"
          style={styles.image}
        />
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '60px 16px 120px',
    fontFamily: `'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif`,
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  lock: {
    fontSize: '1.5rem',
    color: '#e00',
  },
  date: {
    fontSize: '0.95rem',
    color: '#999',
    marginBottom: '40px',
  },
  content: {
    fontSize: '1.1rem',
    lineHeight: '1.8',
    whiteSpace: 'pre-wrap',
  },
  image: {
    width: '100%',
    marginTop: '40px',
    borderRadius: '12px',
  },
};

export default PostDetail;
