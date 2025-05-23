import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import PostDetail from './PostDetail';
import WritePage from './WritePage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import UserPage from './UserPage'; 
import Home from './Home';
import EditPost from './EditPost'; // 수정 페이지 컴포넌트 import


ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
    <Route path="/" element={<Home />} /> 
      <Route path="/" element={<App />} />
      <Route path="/post/:id" element={<PostDetail />} /> {/*글 상세 페이지 */}
      <Route path="/edit/:id" element={<EditPost />} />
      <Route path="/write" element={<WritePage />} />
      <Route path="/user/:nickname" element={<UserPage />} />
    </Routes>
  </BrowserRouter>
);
