import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Sidebar from './Sidebar';
import './UserPage.css';

function UserPage() {
  const { nickname } = useParams();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // 로그인 정보 불러오기
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
  }, []);

  // 유저 정보 불러오기
  useEffect(() => {
    axios
      .get(`http://localhost:5050/api/users/${nickname}`)
      .then((res) => setUserInfo(res.data))
      .catch((err) => {
        console.error('사용자 정보 불러오기 실패:', err);
        setUserInfo(null);
      });
  }, [nickname]);

  // 글 목록 불러오기
  useEffect(() => {
    axios
      .get('http://localhost:5050/api/posts')
      .then((res) => {
        const filtered = res.data.filter((post) => post.nickname === nickname);
        setUserPosts(filtered);
      })
      .catch((err) => {
        console.error('작성자 글 불러오기 실패:', err);
        setUserPosts([]);
      });
  }, [nickname]);

  // 로그아웃
  const handleLogout = () => {
    const confirmed = window.confirm('글방을 닫으시겠습니까?');
    if (!confirmed) return;
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
  };

  // 본문에서 첫 이미지 추출
  const extractFirstImage = (content) => {
    const div = document.createElement('div');
    div.innerHTML = content;
    const img = div.querySelector('img');
    return img ? img.src : null;
  };

  // 👍 추천 기능
  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`http://localhost:5050/api/posts/${postId}/like`);
      const updatedLikes = res.data.likes;

      // 추천 수 갱신
      setUserPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, likes: updatedLikes } : post
        )
      );
    } catch (err) {
      console.error('추천 실패:', err);
    }
  };

  return (
    <>
      <Header
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={handleLogout}
        openModal={() => {}}
        onMenuClick={() => setSidebarOpen(true)}
      />

      {isSidebarOpen && (
        <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
      )}

      <div className="UserPage">
        {/* 프로필 */}
        <div className="user-info">
          <img
            className="user-profile"
            src={userInfo?.profile_img || '/default-profile.png'}
            alt="프로필"
          />
          <h2>{nickname} 님의 책방</h2>
          <p className="user-bio">{userInfo?.bio || '소개가 아직 없습니다.'}</p>
        </div>

        {/* 글 목록 */}
        {userPosts.length === 0 ? (
          <p className="no-posts">아직 글이 없습니다. 당신의 이야기를 시작해보세요 ✨</p>
        ) : (
          <div className="card-container">
            {userPosts.map((post) => (
              <div
                className="card"
                key={post.id}
                onClick={() => navigate(`/post/${post.id}`)}
              >
                <div className="card-left">
                  <h4>{post.title} {!post.is_public && '🔒'}</h4>
                  <p className="post-preview">
                    {post.content?.replace(/<[^>]+>/g, '').slice(0, 60)}...
                  </p>
                  <p
                    className="post-meta"
                    onClick={(e) => e.stopPropagation()} // 카드 클릭 방지
                  >
                    {post.created_at?.substring(0, 10)}
                    <button
                      onClick={() => handleLike(post.id)}
                      style={{
                        marginLeft: '12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                      }}
                      aria-label="추천하기"
                    >
                      👍 {post.likes}
                    </button>
                  </p>
                </div>

                {extractFirstImage(post.content) && (
                  <img
                    className="card-thumb"
                    src={extractFirstImage(post.content)}
                    alt="썸네일"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default UserPage;
