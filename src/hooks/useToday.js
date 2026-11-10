import { useEffect, useState } from 'react';
import { getToday } from './today';

export function useToday(date) {
  const [state, setState] = useState({ edition: null, otherIssues: [], loading: true, error: null });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    getToday(date)
      .then((d) => { if (active) setState({ ...d, loading: false, error: null }); })
      .catch((e) => { if (active) setState({ edition: null, otherIssues: [], loading: false, error: (e && e.message) || '오류' }); });
    return () => { active = false; };
  }, [date, tick]);
  return { ...state, reload: () => setTick((t) => t + 1) };
}
