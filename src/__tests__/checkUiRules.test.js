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

test('flags filler sentences in JSX text', () => {
  const v = findViolations([{ path: 'f.jsx', text: '<p>맞춤 피드를 준비하고 있어요…</p>\n<span>다른 표현으로 검색해 보세요.</span>\n<b>저장</b>' }]);
  expect(v.map((x) => x.rule)).toEqual(['filler', 'filler']);
});
test('notices and constraints are allowed with a marker', () => {
  expect(findViolations([{ path: 'g.jsx', text: '<p>{/* allow-ui-rule */}AI 요약은 원문을 대체하지 않습니다.</p>' }])).toEqual([]);
});
