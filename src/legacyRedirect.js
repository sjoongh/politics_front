/** 공유 딥링크 호환(순수): /?issue=<id> → /issues/<id>, /?article=<id> → / + 리더 state. 둘 다 replace. */
export function legacyRedirect(search) {
  const params = new URLSearchParams(search || '');
  const issue = params.get('issue');
  if (issue) return { to: `/issues/${encodeURIComponent(issue)}`, state: null };
  const article = params.get('article');
  if (article) return { to: '/', state: { article } };
  return null;
}
