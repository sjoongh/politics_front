import api from './api';

// 전체 뉴스 가져오기
export async function getAllNews(category = null, limit = 20, offset = 0) {
  try {
    const params = {};
    if (category) params.category = category;
    console.log('뉴스 카테고리:', category);
    params.limit = limit;
    params.offset = offset;
    const res = await api.get('/api/news/list', { params });
    console.log('전체 뉴스 데이터:', res.data);
    console.log('전체 뉴스 데이터:', res.data.data);
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