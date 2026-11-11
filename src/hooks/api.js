import axios from 'axios';
import { needsAuth } from './authScope';
import { withSnapshots } from './snapshot';

// 로컬/프로덕션 baseURL. 프로덕션은 개인 Vercel 백엔드.
const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8000'
  : 'https://politicsbackend-ruby.vercel.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  // 프로덕션: 공개 목록(오늘 판·이슈 랭킹·검색 카탈로그·의원)은 GitHub Pages 정적 스냅샷을 먼저 쓴다.
  // 개발(로컬 백엔드)에서는 끈다.
  ...(process.env.NODE_ENV === 'production'
    ? { adapter: withSnapshots(axios.getAdapter(axios.defaults.adapter)) }
    : {}),
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 저장된 토큰을 Authorization 헤더로 첨부.
// 공개 GET에는 붙이지 않는다(Authorization 있는 요청은 Vercel CDN 캐시 대상에서 빠짐).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && needsAuth(config.method, config.url)) {
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