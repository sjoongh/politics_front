import api from './api';

// 전체 뉴스 가져오기
export async function getAllNews(category = null, limit = 20, offset = 0) {
  try {
    const params = {};
    if (category) params.category = category;
    params.limit = limit;
    params.offset = offset;
    const res = await api.get('/api/news/list', { params });
    return res.data.data || [];
  } catch (err) {
    throw new Error(err.response?.data?.detail || '뉴스 데이터를 불러오는데 실패했습니다.');
  }
}

// 뉴스 검색
export async function searchNews(query, category = '') {
  try {
    const res = await api.get('/api/news/search', {
      params: { q: query, category },
    });
    
    return res.data.data || [];
  } catch (err) {
    throw new Error(err.response?.data?.detail || '검색 실패');
  }
}

// AI 자연어 검색 (구조화 파싱 + 랭킹, 옵션 브리핑). 키 없으면 백엔드가 폴백.
export async function aiSearchNews(query, { includeBriefing = false, limit = 20 } = {}) {
  try {
    const res = await api.get('/api/news/search/ai', {
      params: { q: query, include_briefing: includeBriefing, limit },
    });
    return res.data.data; // {query, mode, ai, parsed, items, count, briefing}
  } catch (err) {
    throw new Error(err.response?.data?.detail || 'AI 검색 실패');
  }
}

// 개인 맞춤 'For You' 피드 (로그인 필요 — 인터셉터가 토큰 첨부)
export async function getForYou(limit = 30) {
  try {
    const res = await api.get('/api/news/foryou', { params: { limit } });
    return res.data.data; // {mode, profile, items, count}
  } catch (err) {
    throw new Error(err.response?.data?.detail || '맞춤 피드 조회 실패');
  }
}

// 뉴스 상세 조회
export async function getNewsDetail(articleId) {
  try {
    const res = await api.get(`/api/news/${articleId}`);
    return res.data.data;
  } catch (err) {
    throw new Error(err.response?.data?.detail || '뉴스 상세 조회 실패');
  }
}

// 뉴스 내보내기
export async function exportNewsData() {
  try {
    const res = await api.get('/api/news/list');
    const text = res.data?.data?.map(news => `- ${news.title}`).join('\n') || '데이터 없음';
    // 파일 다운로드 로직은 필요에 따라 추가
    return text;
  } catch (err) {
    throw new Error('내보내기 실패');
  }
}

// 대통령 정보 조회
export async function getPresidentInfo() {
  try {
    const res = await api.get('/api/politics/president');
  return res.data.data.president;
  } catch (err) {
    throw new Error(err.response?.data?.detail || '대통령 정보를 불러오는 중 오류 발생');
  }
}

// 최근 정책 조회
export async function getRecentPolicies() {
  try {
    const res = await api.get('/api/politics/policies');
    return res.data.data.policies;
  } catch (err) {
    throw new Error(err.response?.data?.detail || '정책 정보를 불러오는 중 오류 발생');
  }
}

// 정치인 발언 조회
export async function getPoliticalStatements() {
  try {
    const res = await api.get('/api/politics/statements');
    return res.data.data.statements;
  } catch (err) {
    throw new Error(err.response?.data?.detail || '정치인 발언 정보를 불러오는 중 오류 발생');
  }
}