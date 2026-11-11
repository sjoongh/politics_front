
import { useState, useEffect, useCallback } from 'react';
import { trackSearch } from '../analytics';
import { getAllNews, aiSearchNews, getForYou } from './useNews';

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
      // 검색어 원문은 보내지 않음(PII) — 모드/길이/결과수만
      trackSearch({ mode: data?.mode, queryLength: query.trim().length, resultCount: data?.count ?? data?.items?.length ?? 0 });
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