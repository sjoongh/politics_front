import { useState, useEffect } from 'react';
import { getDigest } from '../hooks/digest';

export function useDigest(interests) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const list = interests || [];
    if (list.length === 0) { setArticles([]); return; }
    let active = true;
    setLoading(true);
    getDigest(list)
      .then((a) => { if (active) setArticles(a); })
      .catch(() => { if (active) setArticles([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [JSON.stringify(interests)]);

  return { articles, loading };
}
