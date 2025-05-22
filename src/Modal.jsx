import { useState } from 'react';
import './Modal.css';
import axios from 'axios';

function Modal({ type, onClose, onLoginSuccess }) {
  const [formData, setFormData] = useState({ email: '', password: '', nickname: '' });
  const [error, setError] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCheckingEmail(true);

    try {
      if (type === 'signup') {
        // ✅ 이메일 중복 체크
        const dupRes = await axios.post('http://localhost:5050/api/users/check-email', {
          email: formData.email
        });
        if (!dupRes.data.available) {
          setError('이미 사용 중인 이메일입니다.');
          setCheckingEmail(false);
          return;
        }

        // ✅ 회원가입 요청
        const res = await axios.post('http://localhost:5050/api/users/signup', {
          email: formData.email,
          password: formData.password,
          nickname: formData.nickname
        });

        localStorage.setItem('user', JSON.stringify({
          id: res.data.id,
          email: res.data.email,
          nickname: res.data.nickname,
          name: res.data.name
        }));

        onLoginSuccess();

      } else {
        // ✅ 로그인 요청
        const res = await axios.post('http://localhost:5050/api/users/login', {
          email: formData.email,
          password: formData.password
        });

        localStorage.setItem('user', JSON.stringify({
          id: res.data.id,
          email: res.data.email,
          nickname: res.data.nickname,
          name: res.data.name
        }));

        onLoginSuccess();
      }

    } catch (err) {
      setError(err.response?.data?.message || '문제가 발생했습니다.');
    } finally {
      setCheckingEmail(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{type === 'login' ? '글방 열기' : '글방 만들기'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {type === 'signup' && (
            <input
              type="text"
              name="nickname"
              placeholder="닉네임"
              value={formData.nickname}
              onChange={handleChange}
              required
            />
          )}
          <button type="submit" disabled={checkingEmail}>
            {type === 'login' ? '로그인' : '회원가입'}
          </button>
          {error && <p className="error-text">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Modal;
