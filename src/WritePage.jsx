import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function WritePage() {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [nickname, setNickname] = useState(localStorage.getItem('nickname') || '');
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [thumbnail, setThumbnail] = useState(null);
  const contentRef = useRef();
  const navigate = useNavigate();

  const getCurrentContent = () => contentRef.current?.innerHTML || '';

  const extractFirstImage = () => {
    const div = document.createElement('div');
    div.innerHTML = getCurrentContent();
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
        if (parsed.content && contentRef.current) {
          contentRef.current.innerHTML = parsed.content;
        }
        if (parsed.savedAt) setLastSavedTime(new Date(parsed.savedAt));
        if (parsed.isPublic !== undefined) setIsPublic(parsed.isPublic);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const now = new Date();
      const currentContent = getCurrentContent();
      const thumb = extractFirstImage();
      setThumbnail(thumb);

      const draft = {
        title,
        subtitle,
        content: currentContent,
        isPublic,
        thumbnail: thumb,
        nickname,
        savedAt: now.toISOString(),
      };
      localStorage.setItem('postype-draft', JSON.stringify(draft));
      localStorage.setItem('nickname', nickname);
      setLastSavedTime(now);

      axios.post('http://localhost:5050/api/posts/draft', draft).catch(console.error);
    }, 1500);
    return () => clearTimeout(timer);
  }, [title, subtitle, isPublic, nickname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalContent = getCurrentContent();
      const thumb = extractFirstImage();
      await axios.post('http://localhost:5050/api/posts', {
        title,
        subtitle,
        content: `${subtitle ? `<h3>${subtitle}</h3>` : ''}${finalContent}`,
        is_public: isPublic,
        thumbnail: thumb,
        nickname,
      });
      alert('✅ 글 등록 완료!');
      localStorage.removeItem('postype-draft');
      navigate('/');
    } catch (err) {
      alert('❌ 등록 실패');
      console.error(err);
    }
  };

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = document.createElement("img");
        img.src = reader.result;
        img.style.maxWidth = "100%";
        img.style.borderRadius = "12px";

        const p = document.createElement("p");
        p.style.textAlign = "center";
        p.appendChild(img);

        contentRef.current?.appendChild(p);
      };
      reader.readAsDataURL(file);
    };
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="제목을 입력하세요."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.titleInput}
        />

        <div style={styles.editorContainer}>
          <div
            contentEditable
            ref={contentRef}
            style={styles.editor}
            suppressContentEditableWarning={true}
          >
            <div><br /></div>
          </div>
        </div>

        <button type="button" onClick={handleImageUpload} style={styles.uploadBtn}>
          📷 이미지 추가
        </button>

        <button type="button" onClick={() => setShowPreview(!showPreview)} style={styles.previewBtn}>
          {showPreview ? '미리보기 닫기' : '👀 미리보기'}
        </button>

        <div style={styles.toggleWrapper}>
          <span style={styles.toggleLabel}>공개 여부</span>
          <div style={styles.toggleBox} onClick={() => setIsPublic(!isPublic)}>
            <div style={{
              ...styles.toggleCircle,
              transform: isPublic ? 'translateX(0)' : 'translateX(24px)',
              backgroundColor: isPublic ? '#007bff' : '#ccc',
            }} />
          </div>
          <span style={styles.toggleText}>{isPublic ? '공개 글' : '비공개 글'}</span>
        </div>

        {lastSavedTime && (
          <p style={styles.savedTime}>
            ⏱ 마지막 자동 저장: {lastSavedTime.toLocaleTimeString()}
          </p>
        )}

        <div style={styles.buttonGroup}>
          <button type="submit" style={styles.publishBtn}>✅ 발행</button>
        </div>
      </form>

      {showPreview && (
        <div style={styles.previewBox}>
          <h2>{title}</h2>
          <h4 style={{ color: '#999', fontWeight: 'normal' }}>{subtitle}</h4>
          <div dangerouslySetInnerHTML={{ __html: getCurrentContent() }} />
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '80px 16px 160px',
    fontFamily: `'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif`,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  nicknameInput: {
    fontSize: '1.1rem',
    marginBottom: '20px',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '6px',
  },
  titleInput: {
    fontSize: '2.5rem',
    fontWeight: '700',
    border: 'none',
    outline: 'none',
    marginBottom: '10px',
    width: '100%',
  },
  subtitleInput: {
    fontSize: '1.2rem',
    color: '#999',
    border: 'none',
    outline: 'none',
    marginBottom: '40px',
    width: '100%',
  },
  editorContainer: {
    minHeight: '200px',
  },
  editor: {
    minHeight: '400px',
    fontSize: '1.15rem',
    lineHeight: '2',
    outline: 'none',
    border: 'none',
    padding: '0',
    whiteSpace: 'pre-wrap',
  },
  uploadBtn: {
    marginTop: '20px',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ccc',
    padding: '10px 16px',
    borderRadius: '6px',
    fontSize: '1rem',
    cursor: 'pointer',
    alignSelf: 'flex-start'
  },
  previewBtn: {
    marginTop: '12px',
    backgroundColor: '#e1e1e1',
    border: '1px solid #bbb',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '0.95rem',
    cursor: 'pointer',
    alignSelf: 'flex-start'
  },
  toggleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '20px',
  },
  toggleLabel: {
    fontSize: '0.95rem',
    color: '#444',
  },
  toggleBox: {
    width: '48px',
    height: '24px',
    backgroundColor: '#ddd',
    borderRadius: '9999px',
    position: 'relative',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  toggleCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    position: 'absolute',
    top: 0,
    left: 0,
    transition: 'transform 0.3s ease, background-color 0.3s ease',
  },
  toggleText: {
    fontSize: '0.95rem',
    color: '#444',
  },
  savedTime: {
    fontSize: '0.9rem',
    color: '#aaa',
    marginTop: '24px',
    textAlign: 'right',
  },
  buttonGroup: {
    marginTop: '24px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  publishBtn: {
    backgroundColor: '#111',
    color: '#fff',
    border: 'none',
    padding: '14px 26px',
    fontSize: '1.1rem',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  previewBox: {
    marginTop: '60px',
    padding: '40px',
    border: '1px solid #eee',
    borderRadius: '12px',
    backgroundColor: '#fafafa',
  },
};

export default WritePage;
