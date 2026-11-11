import { needsAuth } from './authScope';

describe('needsAuth', () => {
  test('public GETs go without a token so the CDN can cache them', () => {
    for (const url of [
      '/api/issues', '/api/issues?v=2&limit=20', '/api/issues/abc', '/api/issues/abc/articles',
      '/api/members', '/api/members/m1', '/api/news/list', '/api/news/search',
      '/api/news/search/ai', '/api/news/digest', '/api/news/art123', '/api/politics/president',
      '/api/sources', '/api/today', '/api/summaries/daily', '/api/comments/s1', '/api/statistic/stats',
    ]) {
      expect(needsAuth('get', url)).toBe(false);
    }
  });

  test('personal GETs keep the token', () => {
    for (const url of ['/api/news/foryou', '/api/news/foryou?limit=30', '/api/auth/me',
      '/api/bookmarks/list', '/api/notifications/user']) {
      expect(needsAuth('get', url)).toBe(true);
    }
  });

  test('every non-GET request keeps the token', () => {
    expect(needsAuth('post', '/api/comments')).toBe(true);
    expect(needsAuth('put', '/api/auth/profile')).toBe(true);
    expect(needsAuth('delete', '/api/auth/delete')).toBe(true);
  });

  test('unknown GET endpoints default to sending the token', () => {
    expect(needsAuth('get', '/api/new-feature')).toBe(true);
    expect(needsAuth(undefined, '/api/issues')).toBe(false);
  });

  test('absolute URLs are matched by path', () => {
    expect(needsAuth('get', 'https://politicsbackend-ruby.vercel.app/api/issues')).toBe(false);
    expect(needsAuth('get', 'https://politicsbackend-ruby.vercel.app/api/news/foryou')).toBe(true);
  });
});
