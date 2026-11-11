import { pushModal, topModalClose, modalCount } from './modalStack';

test('stack closes the top modal first and pops on cleanup', () => {
  const calls = [];
  const popA = pushModal(() => calls.push('A'));
  const popB = pushModal(() => calls.push('B'));
  expect(modalCount()).toBe(2);
  topModalClose()();
  expect(calls).toEqual(['B']);
  popB(); popA();
  expect(modalCount()).toBe(0);
  expect(topModalClose()).toBeNull();
});
