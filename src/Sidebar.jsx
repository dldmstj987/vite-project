import './Sidebar.css';

function Sidebar({ user, onClose }) {
  return (
    <>
      <div className="sidebar-overlay" onClick={onClose}></div>
      <aside className="sidebar">
        <button className="close-btn" onClick={onClose}>×</button>

        <img
          src={user?.profileImg || '/default-profile.png'}
          alt="프로필"
          className="profile-img"
        />

        <h2 className="user-name">{user?.nickname || '사용자'}</h2>
        <p className="user-link">{user?.email}</p>

        <div className="sidebar-buttons">
          <button>글쓰기</button>
          <button>내 책방</button>
        </div>

        <hr className="sidebar-divider" />

        <ul className="sidebar-menu">
          <li>내 브런치스토리</li>
          <li>작가의 서랍</li>
          <li>브런치스토리 홈</li>
          <li>글 읽는 서재</li>
          <li>피드</li>
        </ul>
      </aside>
    </>
  );
}

export default Sidebar;
