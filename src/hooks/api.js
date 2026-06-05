import axios from 'axios';

// 로컬 환경과 프로덕션 환경에 맞게 baseURL 설정
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000' 
  : 'https://politics-backend-9vp2.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API 요청 에러:', error);
    return Promise.reject(error);
  }
);


export default api;