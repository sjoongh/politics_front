// 뒤로가기 규칙(순수): 모달 닫기 → 내부 이력 back → 상세 직접 진입이면 목록으로 → 탭 루트면 종료
const DETAIL_RE = /^\/(issues|members)\/[^/]+$/;

export function isDetailPath(pathname) {
  return DETAIL_RE.test(pathname || '');
}

export function listPathFor(pathname) {
  const m = (pathname || '').match(/^\/(issues|members)\//);
  return m ? `/${m[1]}` : '/';
}

export function nextBackAction({ modalOpen, historyIndex, pathname }) {
  if (modalOpen) return 'close-modal';
  if ((historyIndex || 0) > 0) return 'back';
  if (isDetailPath(pathname)) return 'to-list';
  return 'exit';
}

/** 상세 닫기: 모바일에서 내부 이력이 있으면 back(이력을 늘리지 않음), 아니면 목록으로 replace. 데스크톱 분할은 항상 replace. */
export function goBackToList(navigate, listPath, desktop) {
  const idx = (typeof window !== 'undefined' && window.history.state && window.history.state.idx) || 0;
  if (!desktop && idx > 0) navigate(-1);
  else navigate(listPath, { replace: true });
}
