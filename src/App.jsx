import { useEffect, useState } from 'react';
import axios from 'axios';
import './MainPage.css';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Modal from './Modal';

function MainPage() {
  const [글목록, 글목록변경] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [user, setUser] = useState(null); // ✅ user 상태 추가
  const navigate = useNavigate();

  // 게시글 목록 불러오기
  useEffect(() => {
    axios.get('http://localhost:5050/api/posts')
      .then((res) => {
        글목록변경(res.data.slice(0, 5));
      })
      .catch((err) => console.error('불러오기 실패:', err));
  }, []);

  // 로그인 유지 확인
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser)); // ✅ user 세팅
    }
  }, []);

  const handleLike = (id) => {
    axios.put(`http://localhost:5050/api/posts/${id}/like`)
      .then(() => {
        글목록변경(글목록.map(p =>
          p.id === id ? { ...p, likes: p.likes + 1 } : p
        ));
      });
  };

  const extractFirstImage = (content) => {
    const div = document.createElement('div');
    div.innerHTML = content;
    const img = div.querySelector('img');
    return img ? img.src : null;
  };

  const handleLoginSuccess = () => {
    const stored = localStorage.getItem('user');
    setIsLoggedIn(true);
    if (stored) setUser(JSON.parse(stored)); // ✅ 로그인 후 user 세팅
    setModalType(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <>
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        isLoggedIn={isLoggedIn}
        openModal={(type) => setModalType(type)}
        user={user}
        onLogout={handleLogout}
      />

      {isSidebarOpen && (
        <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
      )}

      {modalType && (
        <Modal
          type={modalType}
          onClose={() => setModalType(null)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      <div className="main-container">
        {글목록.length === 0 && (
          <p className="no-posts">등록된 글이 없습니다.</p>
        )}

        <div className="post-list">
          {글목록.map(post => (
            <div
              key={post.id}
              className="post-card"
              onClick={() => navigate(`/post/${post.id}`)}
            >
              <div className="post-text">
                <h2>{post.title} {!post.is_public && '🔒'}</h2>
                <p className="post-meta">
                  {post.created_at?.substring(0, 10)} · {post.nickname || '익명'}
                </p>
                <button
                  className="like-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(post.id);
                  }}
                >
                  👍 {post.likes}
                </button>
              </div>

              {extractFirstImage(post.content) && (
                <img
                  className="post-thumbnail"
                  src={extractFirstImage(post.content)}
                  alt="썸네일"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default MainPage;
