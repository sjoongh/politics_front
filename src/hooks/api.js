import axios from 'axios';

// 로컬/프로덕션 baseURL. (프로덕션 백엔드 URL은 배포 후 설정)
const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8000'
  : 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 저장된 토큰을 Authorization 헤더로 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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