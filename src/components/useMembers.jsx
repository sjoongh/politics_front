import { useState, useEffect, useCallback } from 'react';
import { getMembers, getMemberDetail } from '../hooks/members';

export function useMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setMembers(await getMembers());
    } catch (err) {
      setError(err.message || '의원을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { members, loading, error, refresh: load };
}

export function useMemberDetail(id) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) { setDetail(null); return; }
    let active = true;
    setLoading(true);
    getMemberDetail(id)
      .then((d) => { if (active) setDetail(d); })
      .catch(() => { if (active) setDetail(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  return { detail, loading };
}
