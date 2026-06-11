import { useState, useEffect } from 'react';
import { getDailySummary } from '../hooks/summary';

export function useDailySummary() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let active = true;
    getDailySummary()
      .then((s) => { if (active) setSummary(s); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  return summary;
}
