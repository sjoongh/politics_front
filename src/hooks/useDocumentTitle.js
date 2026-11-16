import { useEffect } from 'react';

const BRAND = '브리핑 코리아';

/** 상세 화면의 브라우저 제목('제목 · 브리핑 코리아'). 떠날 때 기본 제목으로 되돌린다. */
export function useDocumentTitle(title) {
  useEffect(() => {
    if (!title) return undefined;
    document.title = `${title} · ${BRAND}`;
    return () => { document.title = BRAND; };
  }, [title]);
}
