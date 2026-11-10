import { useCallback, useEffect, useRef, useState } from 'react';

/** 커서 페이지 공통 훅. fetchPage(cursor) → {items, nextCursor}. key가 바뀌면 처음부터. */
export function usePaged(fetchPage, key, enabled = true) {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const seq = useRef(0);

  const load = useCallback(async (reset) => {
    if (!enabled) { setLoading(false); return; }
    const my = ++seq.current;
    setLoading(true); setError(null);
    try {
      const page = await fetchPage(reset ? null : cursor);
      if (my !== seq.current) return;
      setItems((prev) => (reset ? page.items : [...prev, ...page.items]));
      setCursor(page.nextCursor);
    } catch (e) {
      if (my !== seq.current) return;
      setError(e && e.message ? e.message : '불러오지 못했습니다');
    } finally {
      if (my === seq.current) setLoading(false);
    }
  }, [fetchPage, cursor, enabled]);

  useEffect(() => { load(true); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  return { items, loading, error, hasMore: !!cursor, loadMore: () => load(false), reload: () => load(true) };
}
