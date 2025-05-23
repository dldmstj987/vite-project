// EditPost.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';
import './PostDetail.css';
import Header from './Header';

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef();

  const [post, setPost] = useState(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [content, setContent] = useState('');
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    axios.get(`http://localhost:5050/api/posts/${id}`)
      .then((res) => {
        setPost(res.data);
        setTitle(res.data.title);
        setSubtitle(res.data.subtitle || '');
        setIsPublic(res.data.is_public === 1);
        setContent(res.data.content);
        setIsEditorReady(true);
      })
      .catch((err) => console.error('글 불러오기 실패:', err));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const html = editorRef.current?.getInstance().getHTML();
      await axios.put(`http://localhost:5050/api/posts/${id}`, {
        title,
        subtitle,
        content: html,
        is_public: isPublic,
      });
      alert('✅ 수정 완료!');
      navigate(`/post/${id}`);
    } catch (err) {
      alert('❌ 수정 실패');
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <>
      <Header
        onMenuClick={() => setSidebarOpen(!isSidebarOpen)}
        isLoggedIn={!!user}
        openModal={() => alert('모달 열기 구현 필요')}
        user={user}
        onLogout={handleLogout}
      />
      <div className="post-wrapper">
        <form onSubmit={handleSubmit} className="write-form">
          <input
            type="text"
            placeholder="제목을 입력하세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="title-input"
          />

          <input
            type="text"
            placeholder="부제목을 입력하세요. (선택)"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="subtitle-input"
          />

          {isEditorReady && (
            <Editor
              ref={editorRef}
              initialValue={content}
              previewStyle="vertical"
              height="400px"
              initialEditType="wysiwyg"
              useCommandShortcut={true}
              toolbarItems={[
                ['heading', 'bold', 'italic', 'strike'],
                ['hr', 'quote'],
                ['ul', 'ol', 'task', 'indent', 'outdent'],
                ['table', 'image', 'link'],
                ['code', 'codeblock']
              ]}
              hooks={{
                addImageBlobHook: (blob, callback) => {
                  const reader = new FileReader();
                  reader.onloadend = () => callback(reader.result, '업로드 이미지');
                  reader.readAsDataURL(blob);
                },
              }}
              onChange={() => {
                const html = editorRef.current?.getInstance().getHTML();
                setContent(html);
              }}
            />
          )}

          <div className="toggle-wrapper">
            <span className="toggle-label">공개 여부</span>
            <div className="toggle-box" onClick={() => setIsPublic(!isPublic)}>
              <div
                className="toggle-circle"
                style={{
                  transform: isPublic ? 'translateX(0)' : 'translateX(24px)',
                  backgroundColor: isPublic ? '#007bff' : '#ccc',
                }}
              />
            </div>
            <span className="toggle-text">{isPublic ? '공개 글' : '비공개 글'}</span>
          </div>

          <div className="button-group">
            <button type="submit" className="publish-btn">✅ 수정 완료</button>
            <button type="button" className="preview-btn" onClick={() => navigate(-1)}>취소</button>
          </div>
        </form>
      </div>
    </>
  );
}

export default EditPost;
