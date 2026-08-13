// 공유 링크가 찍힐 베이스. env로 분리해 커스텀 도메인 교체를 쉽게.
export const SHARE_BASE =
  process.env.REACT_APP_SHARE_BASE_URL || 'https://politicsbackend-ruby.vercel.app';

export const issueShareUrl = (id) => `${SHARE_BASE}/share/issue/${id}`;
export const articleShareUrl = (id) => `${SHARE_BASE}/share/article/${id}`;
