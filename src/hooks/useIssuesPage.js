import { useCallback } from 'react';
import { getIssuesPage } from './issues';
import { usePaged } from './usePaged';

export function useIssuesPage({ sort = 'rank', filter = null, limit = 50 } = {}) {
  const fetchPage = useCallback((cursor) => getIssuesPage({ sort, filter, cursor, limit }), [sort, filter, limit]);
  return usePaged(fetchPage, `${sort}|${filter || ''}|${limit}`);
}
