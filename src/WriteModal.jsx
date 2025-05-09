import React, { useState } from 'react';
import './Modal.css'; // 원하는 스타일 지정 가능

function WriteModal({ onClose, onPostSuccess }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 서버로 보낼 FormData 구성
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('is_public', isPublic);
    if (image) formData.append('image', image);

    try {
      const res = await fetch('http://localhost:5050/api/posts', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      console.log('등록 성공:', result);
      onPostSuccess(); // App에서 글 목록 새로고침
      onClose(); // 모달 닫기
    } catch (err) {
      console.error('등록 실패:', err);
    }
  };

  return (
    <div className="modal-bg">
      <div className="modal-box">
        <h2>✍️ 새 글 작성</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <input
            type="text"
            placeholder="제목 입력"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="내용 입력"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <label>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            공개 글로 설정
          </label>
          <div style={{ marginTop: '10px' }}>
            <button type="submit">작성 완료</button>
            <button type="button" onClick={onClose} style={{ marginLeft: '10px' }}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WriteModal;
