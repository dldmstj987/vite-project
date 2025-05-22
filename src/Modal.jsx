import './Modal.css';
import { useState } from 'react';
import axios from 'axios';

function Modal({ type, onClose, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nickname: ''
  });
  const [error, setError] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (type === 'signup') {
        // ✅ 1. 이메일 중복 확인
        setCheckingEmail(true);
        const checkRes = await axios.post('http://localhost:5050/api/check-email', {
          email: formData.email
        });
        if (checkRes.data.exists) {
          setError('이미 사용 중인 이메일입니다.');
          setCheckingEmail(false);
          return;
        }

        // ✅ 2. 회원가입
        const res = await axios.post('http://localhost:5050/api/signup', {
          email: formData.email,
          password: formData.password,
          nickname: formData.nickname
        });

        // ✅ 3. 자동 로그인 상태 처리 + localStorage 저장
        localStorage.setItem('user', JSON.stringify({
          nickname: res.data.nickname || formData.nickname,
          email: formData.email
        }));

        onLoginSuccess();
      } else {
        // ✅ 로그인
        const res = await axios.post('http://localhost:5050/api/login', {
          email: formData.email,
          password: formData.password
        });

        localStorage.setItem('user', JSON.stringify({
          name: res.data.name,
          email: formData.email
        }));

        onLoginSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || '문제가 발생했습니다.');
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{type === 'login' ? '글방 열기' : '글방 만들기'}</h2>

        <form onSubmit={handleSubmit}>
          {type === 'signup' && (
            <input
              type="text"
              name="nickname"
              placeholder="닉네임"
              required
              value={formData.name}
              onChange={handleChange}
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="이메일"
            required
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            required
            value={formData.password}
            onChange={handleChange}
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={checkingEmail}>
            {checkingEmail ? '확인 중...' : (type === 'login' ? '로그인' : '회원가입')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Modal;
