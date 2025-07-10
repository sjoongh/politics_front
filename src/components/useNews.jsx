import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../hooks/api';

export const useNews = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.getAllData();
      setData(result);
    } catch (err) {
      setError(err.message || '데이터를 불러오는데 실패했습니다.');
      console.error('데이터 로딩 에러:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refreshData
  };
};

export const useSearch = () => {
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const search = useCallback(async (query, category = 'all') => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError(null);
      const results = await apiService.searchData(query, category);
      setSearchResults(results);
    } catch (err) {
      setSearchError(err.message || '검색에 실패했습니다.');
      console.error('검색 에러:', err);
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

export const useExport = () => {
  const [exporting, setExporting] = useState(false);

  const exportData = useCallback(async () => {
    try {
      setExporting(true);
      const result = await apiService.exportData();

      // 텍스트 파일로 다운로드
      const blob = new Blob([result.export_text], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `정치뉴스요약_${new Date().toLocaleDateString('ko-KR').replace(/\./g, '')}.txt`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      console.error('내보내기 에러:', err);
      throw err;
    } finally {
      setExporting(false);
    }
  }, []);

  return {
    exportData,
    exporting
  };
};
