import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';
import './WritePage.css';

function WritePage() {
  const navigate = useNavigate();
  const editorRef = useRef();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const extractFirstImage = () => {
    const div = document.createElement('div');
    div.innerHTML = content;
    const img = div.querySelector('img');
    return img ? img.src : null;
  };

  useEffect(() => {
    const saved = localStorage.getItem('postype-draft');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (window.confirm('임시 저장된 글을 불러올까요?')) {
        setTitle(parsed.title || '');
        setSubtitle(parsed.subtitle || '');
        setContent(parsed.content || '');
        setIsPublic(parsed.isPublic !== undefined ? parsed.isPublic : true);
        setLastSavedTime(new Date(parsed.savedAt));
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const now = new Date();
      const html = editorRef.current?.getInstance().getHTML();

      const draft = {
        title,
        subtitle,
        content: html,
        isPublic,
        thumbnail: extractFirstImage(),
        savedAt: now.toISOString(),
        nickname: JSON.parse(localStorage.getItem('user') || '{}').nickname || '',
      };

      localStorage.setItem('postype-draft', JSON.stringify(draft));
      setLastSavedTime(now);

      axios.post('http://localhost:5050/api/posts/draft', draft).catch(console.error);
    }, 1500);
    return () => clearTimeout(timer);
  }, [title, subtitle, content, isPublic]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const html = editorRef.current?.getInstance().getHTML();
      await axios.post('http://localhost:5050/api/posts', {
        title,
        subtitle,
        content: html,
        is_public: isPublic,
        thumbnail: extractFirstImage(),
        nickname: JSON.parse(localStorage.getItem('user') || '{}').nickname || '',
      });
      alert('✅ 글 등록 완료!');
      localStorage.removeItem('postype-draft');
      navigate('/');
    } catch (err) {
      alert('❌ 등록 실패');
      console.error(err);
    }
  };

  return (
    <div className="write-wrapper">
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

        <Editor
          ref={editorRef}
          previewStyle="vertical"
          height="400px"
          initialEditType="wysiwyg"
          useCommandShortcut={true}
          placeholder="본문을 입력하세요..."
          onChange={() => {
            const html = editorRef.current?.getInstance().getHTML();
            setContent(html);
          }}
        />

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

        {lastSavedTime && (
          <p className="saved-time">
            ⏱ 마지막 자동 저장: {lastSavedTime.toLocaleTimeString()}
          </p>
        )}

        <div className="button-group">
          <button type="submit" className="publish-btn">✅ 발행</button>
          <button
            type="button"
            className="preview-btn"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? '미리보기 닫기' : '👀 미리보기'}
          </button>
        </div>
      </form>

      {showPreview && (
        <div className="preview-box">
          <h2>{title}</h2>
          <h4 style={{ color: '#999', fontWeight: 'normal' }}>{subtitle}</h4>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      )}
    </div>
  );
}

export default WritePage;
