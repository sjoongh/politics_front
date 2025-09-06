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

export const apiService = {
  // 모든 데이터 가져오기
  // getAllData: async () => {
  //   const response = await api.get('/api/data');
  //   return response.data;
  // },

  // 대통령 정보
  getPresident: async () => {
    const response = await api.get('/api/president');
    return response.data;
  },

  // 정책 정보
  getPolicies: async () => {
    const response = await api.get('/api/policies');
    return response.data;
  },

  // 국회 활동
  getParliament: async () => {
    const response = await api.get('/api/parliament');
    return response.data;
  },

  // 정치인 발언
  getStatements: async () => {
    const response = await api.get('/api/statements');
    return response.data;
  },

  // 뉴스 업데이트
  getNews: async () => {
    const response = await api.get('/api/news');
    return response.data;
  },

  // 검색
  searchData: async (query, category = 'all') => {
    const response = await api.get('/api/search', {
      params: { q: query, category }
    });
    return response.data;
  },

  // 데이터 내보내기
  exportData: async () => {
    const response = await api.get('/api/export');
    return response.data;
  }
};

export default api;