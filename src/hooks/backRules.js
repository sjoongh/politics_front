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
