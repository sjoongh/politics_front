
import { useState, useEffect, useCallback } from 'react';
import { getAllNews, searchNews, aiSearchNews, getForYou, getNewsDetail, exportNewsData, getPresidentInfo, getRecentPolicies, getPoliticalStatements } from '../hooks/useNews'; // ✅ news.js의 함수들 사용

// 개인 맞춤 'For You' 피드 훅
export const useForYou = (enabled) => {
  const [result, setResult] = useState(null); // {mode, profile, items, count}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getForYou(30);
      setResult(data);
    } catch (err) {
      setError(err.message || '맞춤 피드 조회 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) refresh();
  }, [enabled, refresh]);

  return { result, loading, error, refresh };
};

// AI 자연어 검색 훅
export const useAiSearch = () => {
  const [result, setResult] = useState(null); // {query, mode, ai, parsed, items, count, briefing}
  const [loading, setLoading] = useState(false);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (query) => {
    if (!query.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const data = await aiSearchNews(query, { includeBriefing: false });
      setResult(data);
    } catch (err) {
      setError(err.message || 'AI 검색 실패');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 브리핑 별도 생성(비용/지연 제어 — 사용자가 명시적으로 요청)
  const runBriefing = useCallback(async (query) => {
    if (!query?.trim()) return;
    try {
      setBriefingLoading(true);
      const data = await aiSearchNews(query, { includeBriefing: true });
      setResult(data);
    } catch (err) {
      setError(err.message || 'AI 브리핑 실패');
    } finally {
      setBriefingLoading(false);
    }
  }, []);

  const clear = useCallback(() => { setResult(null); setError(null); }, []);

  return { result, loading, briefingLoading, error, run, runBriefing, clear };
};

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

export function usePresident() {
  const [president, setPresident] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPresident = async () => {
      try {
        const data = await getPresidentInfo();
        setPresident(data);
      } catch (err) {
        console.error('대통령 정보 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPresident();
  }, []);
  return { president, loading };
}

export function usePolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const data = await getRecentPolicies();
        setPolicies(data);
      } catch (err) {
        console.error('정책 정보 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  return { policies, loading };
}

export function useStatements() {
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatements = async () => {
      try {
        const data = await getPoliticalStatements();
        setStatements(data);
      } catch (err) {
        console.error('정치인 발언 정보 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatements();
  }, []);

  return { statements, loading };
}