import './Header.css';
import { FaBars, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Header({ onMenuClick, isLoggedIn, openModal, user, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="brunch-header">
      <div className="left">
        <FaBars className="icon" onClick={onMenuClick} />
        <div className="logo-wrap" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="logo">
            Free<span className="underline">Log</span>
          </span>
          <span className="slogan">당신의 기록이 이야기가 되는 곳</span>
        </div>
      </div>

      <div className="right">
        {isLoggedIn ? (
          <>
            {/* ✍️ 글쓰기 버튼 */}
            <button className="write-button" onClick={() => navigate('/write')}>
              ✍️ 글쓰기
            </button>

            <span className="nickname">{user?.nickname} 님</span>
            <button className="mypage-button" onClick={() => navigate(`/user/${user.nickname}`)}>
              내 책방
            </button>
            <button className="logout-button" onClick={onLogout}>
              글방 닫기
            </button>
          </>
        ) : (
          <>
            <button className="login-button" onClick={() => openModal('login')}>
              글방 열기
            </button>
            <button className="signup-button" onClick={() => openModal('signup')}>
              글방 만들기
            </button>
          </>
        )}
        <FaSearch className="icon" />
      </div>
    </header>
  );
}

export default Header;
