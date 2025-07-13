
import { useState, useEffect, useCallback } from 'react';
import { getAllNews, searchNews, getNewsDetail, exportNewsData } from '../hooks/useNews'; // ✅ news.js의 함수들 사용

// 뉴스 전체 데이터 대시보드용
export const useNews = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAllNews();
      setData(result);
    } catch (err) {
      setError(err.message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refreshData: fetchData };
};

// 뉴스 검색 기능
export const useSearch = () => {
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const search = useCallback(async (query, category = '') => {
    if (!query.trim()) return;
    try {
      setSearchLoading(true);
      const results = await searchNews(query, category);
      setSearchResults(results);
    } catch (err) {
      setSearchError(err.message || '검색에 실패했습니다.');
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults(null);
    setSearchError(null);
  }, []);

  return {
    searchResults,
    searchLoading,
    searchError,
    search,
    clearSearch
  };
};

// 뉴스 전체 API (카테고리, 페이지 지원)
export const useAllNews = (category = null, limit = 20, offset = 0) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllNews = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAllNews(category, limit, offset);
      setNews(result || []);
    } catch (err) {
      setError(err.message || '뉴스를 불러오는 중 오류 발생');
    } finally {
      setLoading(false);
    }
  }, [category, limit, offset]);

  useEffect(() => {
    fetchAllNews();
  }, [fetchAllNews]);

  return { news, loading, error, refreshNews: fetchAllNews };
};

// 뉴스 상세조회
export const useNewsDetail = (articleId) => {
  const [newsDetail, setNewsDetail] = useState(null);
  const [loading, setLoading] = useState(!!articleId);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!articleId) return;
      try {
        const result = await getNewsDetail(articleId);
        setNewsDetail(result);
      } catch (err) {
        setError(err.message || '뉴스 상세 조회 실패');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [articleId]);

  return { newsDetail, loading, error };
};

// 뉴스 내보내기 기능
export const useExport = () => {
  const [exporting, setExporting] = useState(false);

  const exportData = useCallback(async () => {
    try {
      setExporting(true);
      await exportNewsData();
    } catch (err) {
      console.error('내보내기 실패:', err);
      throw err;
    } finally {
      setExporting(false);
    }
  }, []);

  return { exportData, exporting };
};
