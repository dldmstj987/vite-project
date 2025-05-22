import { useEffect, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import './HomePage.css';

function HomePage() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
      setIsLoggedIn(true);
    }
  }, []);

  const sampleSerialPosts = [
    {
      category: '스타트업',
      title: '회사를 관두고 나서야 깨달은 것들',
      author: 'by 정재헌',
    },
    {
      category: '영화 리뷰',
      title: '범죄도시4, 웃음과 액션의 균형',
      author: 'by 무비덕후',
    },
    {
      category: '요리·레시피',
      title: '비 오는 날엔 감자전이 딱이야',
      author: 'by 요리연구가 민수',
    },
    {
      category: '세계여행',
      title: '혼자 떠난 페루 마추픽추 트래킹',
      author: 'by 지구인수정',
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
        openModal={() => {}}
      />

      {/* ✅ Sidebar 연결 */}
      {isSidebarOpen && (
        <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
      )}

      {/* ✅ 본문 - 키워드/요일 연재 등 */}
      <div className="home-wrapper">
        <section className="keyword-section">
          <h2 className="keyword-title">B R U N C H &nbsp; K E Y W O R D</h2>
          <p className="keyword-subtitle">키워드로 분류된 다양한 글 모음</p>
          <div className="keyword-grid">
            {[
              "지구한바퀴 세계여행", "그림·웹툰", "IT 트렌드", "사진·촬영", "영화 리뷰", "이런 책",
              "글쓰기 코치", "직장인 조언", "스타트업", "요리·레시피", "건강·운동", "멘탈·심리",
              "문화·예술", "건축·설계", "인문학·철학", "역사", "사랑·이별", "감성 에세이"
            ].map((keyword, i) => (
              <div className="keyword-item" key={i}>{keyword}</div>
            ))}
          </div>
        </section>

        <section className="serial-section">
          <h2>요일별 연재</h2>
          <p className="serial-subtitle">FreeLog 오리지널 연재를 만나보세요.</p>

          <div className="day-tabs">
            {['월', '화', '수', '목', '금', '토', '일'].map((d, i) => (
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
