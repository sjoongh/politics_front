import { useCallback } from 'react';
import { getSources } from './sources';
import { usePaged } from './usePaged';

export function useSources(type) {
  const fetchPage = useCallback((cursor) => (type ? getSources({ type, cursor }) : Promise.resolve({ items: [], nextCursor: null })), [type]);
  return usePaged(fetchPage, type || '');
}
