import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import WriteModal from './WriteModal';

function App() {
  const [글목록, 글목록변경] = useState([]);
  const [modal, setModal] = useState(false);
  const [modalTilte, setModalTitle] = useState(0);
  const [showModal, setshowModal] = useState(false);

  // 글 목록 불러오기
  const fetchPosts = () => {
    axios.get('http://localhost:5050/api/posts')
      .then((res) => {
        const sliced = res.data.slice(0, 5);
        글목록변경(sliced);
      })
      .catch((err) => console.error('불러오기 실패:', err));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 좋아요 +1
  const handleLike = (id, index) => {
    axios.put(`http://localhost:5050/api/posts/${id}/like`)
      .then(() => {
        const updated = [...글목록];
        updated[index].likes += 1;
        글목록변경(updated);
      })
      .catch((err) => console.error('좋아요 실패:', err));
  };

  // 글 삭제
  const handleDelete = (id) => {
    axios.delete(`http://localhost:5050/api/posts/${id}`)
      .then(() => {
        글목록변경(글목록.filter(post => post.id !== id));
      })
      .catch((err) => console.error('삭제 실패:', err));
  };

  return (
    <div className="App">
      <div className="black-nav">
        <h4>LES_Blog</h4>
      </div>

      <button onClick={() => setshowModal(true)}>글쓰기</button>

      {글목록.length === 0 && (
        <p style={{ textAlign: "center" }}>등록된 글이 없습니다.</p>
      )}

      {글목록.map((post, i) => (
        <div className="list" key={post.id}>
          <h4
            onClick={() => {
              setModal(true);
              setModalTitle(i);
            }}
          >
            <h4>
              {post.title} {!post.is_public && "🔒"}
            </h4>
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleLike(post.id, i);
              }}
            >
              {" "}
              👍
            </span>{" "}
            {post.likes}
          </h4>
          <p>{post.created_at?.substring(0, 10)} 발행</p>
          <button onClick={() => handleDelete(post.id)}>삭제</button>
        </div>
      ))}

      {modal && <Modal post={글목록[modalTilte]} />}

      {showModal && (
        <WriteModal
          onClose={() => setshowModal(false)}
          onPostSuccess={fetchPosts}
        />
      )}
    </div>
  );
}

// 상세 모달
function Modal({ post }) {
  if (!post) return null;

  return (
    <div className="modal">
      <h4>{post.title}</h4>
      <p>{post.created_at?.substring(0, 10)}</p>
      <p>{post.content}</p>
      {post.image_url && (
        <img
          src={`http://localhost:5050${post.image_url}`}
          alt="첨부 이미지"
          style={{ width: '100%' }}
        />
      )}
      <button>글수정</button>
    </div>
  );
}

export default App;
