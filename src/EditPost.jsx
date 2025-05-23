// EditPost.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';
import './PostDetail.css';

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef();

  const [post, setPost] = useState(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [content, setContent] = useState('');
  const [isEditorReady, setIsEditorReady] = useState(false);

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

  const addDeleteButtonsToImages = () => {
    const editorInstance = editorRef.current?.getInstance();
    if (!editorInstance) return;

    const editorContainer = document.querySelector('.toastui-editor-contents');
    if (!editorContainer) return;

    const images = editorContainer.querySelectorAll('img');

    images.forEach((img) => {
      if (img.parentNode?.classList?.contains('image-wrapper')) return;

      const wrapper = document.createElement('span');
      wrapper.className = 'image-wrapper';
      wrapper.style.position = 'relative';
      wrapper.style.display = 'inline-block';

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'image-delete-btn';
      deleteBtn.innerText = '✕';
      deleteBtn.style.position = 'absolute';
      deleteBtn.style.top = '0';
      deleteBtn.style.right = '0';
      deleteBtn.style.background = '#dc3545';
      deleteBtn.style.color = 'white';
      deleteBtn.style.border = 'none';
      deleteBtn.style.borderRadius = '50%';
      deleteBtn.style.width = '20px';
      deleteBtn.style.height = '20px';
      deleteBtn.style.cursor = 'pointer';

      deleteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        wrapper.remove();
      });

      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);
      wrapper.appendChild(deleteBtn);
    });
  };

  useEffect(() => {
    if (isEditorReady) {
      const timer = setTimeout(() => addDeleteButtonsToImages(), 300);
      return () => clearTimeout(timer);
    }
  }, [isEditorReady, content]);

  return (
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
                reader.onloadend = () => {
                  callback(reader.result, '업로드 이미지');
                  setTimeout(() => addDeleteButtonsToImages(), 100);
                };
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
  );
}

export default EditPost;
