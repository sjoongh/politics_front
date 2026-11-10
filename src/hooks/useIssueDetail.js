import { useCallback, useEffect, useState } from 'react';
import { getIssueDetail } from './issues';

/** 상세는 요청한 id에 묶어 보관한다. id가 바뀐 렌더에서 이전 상세가 보이지 않으므로
 *  "응답 id ≠ URL id → replace" 효과가 stale 상세로 오작동하지 않는다(분할 화면 두 번째 선택). */
export function useIssueDetail(id) {
  const [state, setState] = useState({ forId: null, detail: null, error: null });
  const [loading, setLoading] = useState(!!id);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!id) { setLoading(false); return undefined; }
    let active = true;
    setLoading(true);
    getIssueDetail(id)
      .then((d) => { if (active) setState({ forId: id, detail: d, error: null }); })
      .catch((e) => { if (active) setState({ forId: id, detail: null, error: (e && e.message) || '불러오지 못했습니다' }); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, tick]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  const current = state.forId === id;
  return { detail: current ? state.detail : null, error: current ? state.error : null, loading: loading || !current, reload };
}
