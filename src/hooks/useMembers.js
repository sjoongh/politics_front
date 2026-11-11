import { useState, useEffect, useCallback } from 'react';
import { getMembers, getMemberDetail } from './members';

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
  const [state, setState] = useState({ forId: null, detail: null, error: null });
  const [loading, setLoading] = useState(!!id);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!id) { setLoading(false); return undefined; }
    let active = true;
    setLoading(true);
    getMemberDetail(id)
      .then((d) => { if (active) setState({ forId: id, detail: d || null, error: d ? null : '의원 정보를 불러오지 못했습니다' }); })
      .catch((e) => { if (active) setState({ forId: id, detail: null, error: (e && e.message) || '의원 정보를 불러오지 못했습니다' }); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const current = state.forId === id;
  return { detail: current ? state.detail : null, error: current ? state.error : null, loading: loading || !current, reload };
}
