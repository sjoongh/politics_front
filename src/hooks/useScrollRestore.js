import { useEffect } from 'react';

/** 목록 스크롤 위치를 세션에 저장·복원(목록 → 상세 → 뒤로가기). */
export function useScrollRestore(key, ready = true) {
  useEffect(() => {
    if (!ready) return undefined;
    const k = `scroll:${key}`;
    const saved = Number(sessionStorage.getItem(k) || 0);
    if (saved) window.scrollTo(0, saved);
    const save = () => sessionStorage.setItem(k, String(window.scrollY));
    window.addEventListener('scroll', save, { passive: true });
    return () => { save(); window.removeEventListener('scroll', save); };
  }, [key, ready]);
}
