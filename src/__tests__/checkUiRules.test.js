import { findViolations } from '../../scripts/check-ui-rules.mjs';

test('flags indigo and gradient and emoji', () => {
  const v = findViolations([
    { path: 'a.css', text: '.x{color:#3354ff;background:linear-gradient(red,blue)}' },
    { path: 'b.jsx', text: 'const t = "🔥 이슈";' },
  ]);
  expect(v.map((x) => x.rule).sort()).toEqual(['emoji', 'gradient', 'indigo']);
});

test('flags primary var, card shadow and slogan', () => {
  const v = findViolations([{ path: 'c.css', text: '.a{color:var(--primary)}\n.b{box-shadow: var(--shadow-card)}\n' },
                            { path: 'd.jsx', text: '<span>실시간 정치 브리핑</span>' }]);
  expect(v.map((x) => x.rule).sort()).toEqual(['card-shadow', 'primary-var', 'slogan']);
});

test('clean file passes and focus ring line is exempt', () => {
  expect(findViolations([{ path: 'c.css', text: '.x{color:var(--text)}\n:focus-visible{box-shadow:0 0 0 2px red}' }])).toEqual([]);
});

test('korean punctuation is not emoji', () => {
  expect(findViolations([{ path: 'e.jsx', text: '정부 2 · 법안 1 · ‘인용’ … ' }])).toEqual([]);
});
