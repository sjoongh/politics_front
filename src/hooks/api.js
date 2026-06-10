import axios from 'axios';

// 프로덕션은 Firebase Hosting 같은 오리진(/api/** → Cloud Run rewrite)으로 호출.
// 호스팅이 바뀌어도 이 URL은 고정이라 앱 재배포가 불필요.
const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8000'
  : 'https://koreanpolitical.web.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
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