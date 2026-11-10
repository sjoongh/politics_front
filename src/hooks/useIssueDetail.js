import { useEffect, useState } from 'react';
import { getIssueDetail } from './issues';

export function useIssueDetail(id) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!id) { setDetail(null); return undefined; }
    let active = true;
    setLoading(true); setError(null);
    getIssueDetail(id)
      .then((d) => { if (active) setDetail(d); })
      .catch((e) => { if (active) { setDetail(null); setError((e && e.message) || '오류'); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  return { detail, loading, error };
}
