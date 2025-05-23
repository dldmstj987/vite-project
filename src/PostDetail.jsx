// PostDetail.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import './PostDetail.css';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log('🔐 로그인 유저 nickname:', parsedUser.nickname);
      setUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    axios.get(`http://localhost:5050/api/posts/${id}`)
      .then((res) => setPost(res.data))
      .catch((err) => console.error('글 불러오기 실패:', err));

    fetchComments();
  }, [id]);

  const fetchComments = async () => {
    const res = await axios.get(`http://localhost:5050/api/posts/${id}/comments`);
    setComments(res.data);
  };

  const handleCommentSubmit = async () => {
    if (!user) return alert('로그인 후 댓글을 작성할 수 있습니다.');
    if (!newComment.trim()) return;

    await axios.post(`http://localhost:5050/api/posts/${id}/comments`, {
      nickname: user.nickname,
      content: newComment,
    });

    setNewComment('');
    fetchComments();
  };

  const handleCommentEdit = (comment) => {
    setEditCommentId(comment.id);
    setEditCommentContent(comment.content);
  };

  const handleEditSubmit = async () => {
    if (!editCommentContent.trim()) return;
    await axios.put(`http://localhost:5050/api/comments/${editCommentId}`, {
      content: editCommentContent,
    });
    setEditCommentId(null);
    setEditCommentContent('');
    fetchComments();
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    await axios.delete(`http://localhost:5050/api/comments/${commentId}`);
    fetchComments();
  };

  const handleDeletePost = async () => {
    const confirmed = window.confirm('정말 이 글을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:5050/api/posts/${id}`);
      alert('삭제 완료!');
      navigate('/');
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제 중 오류 발생');
    }
  };

  if (!post) return <p style={{ textAlign: 'center' }}>로딩 중...</p>;

  return (
    <div className="post-wrapper">
      <div className="post-header">
        <h1 className="post-title">{post.title}</h1>
        {!post.is_public && <span className="post-lock">🔒 비공개</span>}
        <p className="post-date">📅 {new Date(post.created_at).toLocaleDateString()}</p>
      </div>

      <div
        className="post-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.image_url && (
        <img
          src={`http://localhost:5050${post.image_url}`}
          alt="본문 이미지"
          className="post-image"
        />
      )}

      {user?.nickname === post.nickname && (
        <div className="button-group">
          <button className="comment-button edit" onClick={() => navigate(`/edit/${id}`)}>✏ 수정</button>
          <button className="comment-button delete" onClick={handleDeletePost}>🗑 삭제</button>
        </div>
      )}

      <div className="comment-section">
        <h3>💬 댓글</h3>

        <div className="comment-list">
          {comments.map((c) => (
            <div key={c.id} className="comment-item">
              <strong>{c.nickname}</strong> · <span>{new Date(c.created_at).toLocaleDateString()}</span>
              {editCommentId === c.id ? (
                <div>
                  <textarea
                    value={editCommentContent}
                    onChange={(e) => setEditCommentContent(e.target.value)}
                  />
                  <button onClick={handleEditSubmit} className="comment-button edit">수정 완료</button>
                </div>
              ) : (
                <>
                  <p>{c.content}</p>
                  {user?.nickname === c.nickname && (
                    <>
                      <button onClick={() => handleCommentEdit(c)} className="comment-button edit">수정</button>
                      <button onClick={() => handleCommentDelete(c.id)} className="comment-button delete">삭제</button>
                    </>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요..."
          />
          <button onClick={handleCommentSubmit} className="comment-button register">등록</button>
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
