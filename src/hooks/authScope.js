// Vercel CDN은 Authorization 헤더가 있는 요청을 캐시하지 않는다(공식 Cacheable response criteria).
// 로그인 사용자도 공개 목록을 CDN 캐시로 받도록, 공개 GET에는 토큰을 붙이지 않는다.
// 목록에 없는 GET은 안전하게 토큰을 붙인다(캐시만 못 받을 뿐 기능은 유지).
const PUBLIC_GET = [
  /^\/api\/issues(\/|$)/,
  /^\/api\/members(\/|$)/,
  /^\/api\/news\/(list|search|search\/ai|digest)$/,
  /^\/api\/news\/(?!foryou$)[^/]+$/, // 기사 상세(/api/news/{id})
  /^\/api\/politics\//,
  /^\/api\/sources$/,
  /^\/api\/today$/,
  /^\/api\/summaries\/daily$/,
  /^\/api\/comments\/[^/]+$/,
  /^\/api\/statistic\//,
];

function pathOf(url) {
  const raw = String(url || '');
  const noOrigin = raw.replace(/^https?:\/\/[^/]+/i, '');
  return noOrigin.split(/[?#]/)[0];
}

export function needsAuth(method, url) {
  if ((method || 'get').toLowerCase() !== 'get') return true;
  const path = pathOf(url);
  return !PUBLIC_GET.some((re) => re.test(path));
}
