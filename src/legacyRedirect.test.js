import { legacyRedirect } from './legacyRedirect';

test('issue deep link redirects to detail', () => {
  expect(legacyRedirect('?issue=abc')).toEqual({ to: '/issues/abc', state: null });
});
test('article deep link goes home with state', () => {
  expect(legacyRedirect('?article=x1')).toEqual({ to: '/', state: { article: 'x1' } });
});
test('no params is null', () => {
  expect(legacyRedirect('')).toBeNull();
  expect(legacyRedirect('?foo=1')).toBeNull();
});
