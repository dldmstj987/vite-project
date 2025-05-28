import { useEffect, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import './HomePage.css';
import Modal from './Modal'


function HomePage() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
      setIsLoggedIn(true);
    }
  }, []);

  const sampleSerialPosts = [
    {
      category: 'tripleS',
      title: '깨워(Are You Alice) 쇼! 음악중심 움짤 모음',
      author: 'by 병기야 정신차려',
    },
    {
      category: 'Day6 ',
      title: 'Fourever 앨범 깡 후기',
      author: 'by 멜로드 공식 내놔',
    },
    {
      category: '우주소녀',
      title: '재계약은 했는데 왜 활동 안해줘 스타쉽아',
      author: 'by 스타쉽 창문 내꺼',
    },
    {
      category: '몬스타엑스',
      title: '기현 솔로 내놔',
      author: 'by 솔로찷여와라',
    },
  ];
  

  const handleLogout = () => {
    const confirmed = window.confirm('글방을 닫으시겠습니까?');
    if (!confirmed) return;
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <>
      {/* ✅ Header 삽입 */}
      <Header
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={handleLogout}
        onMenuClick={() => setSidebarOpen(true)}
        openModal={(type) => setModalType(type)}
      />

      {/* ✅ Sidebar 연결 */}
      {isSidebarOpen && (
        <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
      )}

      {/* ✅ 조건부 모달 렌더링 */}
    {modalType && (
      <Modal
        type={modalType}
        onClose={() => setModalType(null)}
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          setUser(JSON.parse(localStorage.getItem('user')));
          setModalType(null);
        }}
      />
    )}

      {/* ✅ 본문 - 키워드/요일 연재 등 */}
      <div className="home-wrapper">
        <section className="keyword-section">
          <h2 className="keyword-title"> F R E E L O G &nbsp; K E Y W O R D</h2>
          <p className="keyword-subtitle">키워드로 분류된 다양한 글 모음</p>
          <div className="keyword-grid">
            {[
              "tripleS", "DAY6", "우주소녀", "에스파", "엔믹스", "라이즈",
              "NCT", "몬스타엑스", "환승연애", "런닝맨", "김고은", "이도현",
              "오마이걸", "비비지", "드라마", "야구", "트와이스", "아이브"
            ].map((keyword, i) => (
              <div className="keyword-item" key={i}>{keyword}</div>
            ))}
          </div>
        </section>

        <section className="serial-section">
          <h2>카테고리별 인기글</h2>
          <p className="serial-subtitle">FreeLog의 인기글을 만나보세요</p>

          <div className="day-tabs">
            {['전체', 'tripleS', 'Day6', '우주소녀', '아이브', '몬스타엑스', '라이즈'].map((d, i) => (
              <button key={i} className="day-tab">{d}</button>
            ))}
          </div>

          <div className="sort-tabs">
            <button className="active">최신순</button>
            <button>응원순</button>
            <button>라이킷순</button>
          </div>

          <div className="serial-grid">
            {sampleSerialPosts.map((post, i) => (
                <div className="serial-card" key={i}>
                    <p className="serial-category">{post.category}</p>
                    <h3 className="serial-title">{post.title}</h3>
                    <p className="serial-author">{post.author}</p>
                </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export default HomePage;
