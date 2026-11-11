import { nextBackAction, isDetailPath, listPathFor } from './backRules';

test('modal first', () => expect(nextBackAction({ modalOpen: true, historyIndex: 3, pathname: '/issues/1' })).toBe('close-modal'));
test('history back', () => expect(nextBackAction({ modalOpen: false, historyIndex: 2, pathname: '/issues/1' })).toBe('back'));
test('direct detail goes to list', () => expect(nextBackAction({ modalOpen: false, historyIndex: 0, pathname: '/issues/abc' })).toBe('to-list'));
test('direct member detail goes to list', () => expect(nextBackAction({ modalOpen: false, historyIndex: 0, pathname: '/members/x' })).toBe('to-list'));
test('root exits', () => expect(nextBackAction({ modalOpen: false, historyIndex: 0, pathname: '/' })).toBe('exit'));
test('tab root exits', () => expect(nextBackAction({ modalOpen: false, historyIndex: 0, pathname: '/issues' })).toBe('exit'));
test('helpers', () => {
  expect(isDetailPath('/issues/1')).toBe(true);
  expect(isDetailPath('/issues')).toBe(false);
  expect(listPathFor('/members/9')).toBe('/members');
  expect(listPathFor('/issues/9')).toBe('/issues');
});
