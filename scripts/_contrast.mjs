// 토큰 쌍 명암 대비(WCAG) 점검. 사용: node scripts/_contrast.mjs  (AA 미달이 있으면 exit 1)
import fs from 'fs';
const css = fs.readFileSync(new URL('../src/theme/tokens.css', import.meta.url), 'utf8');
function block(sel) {
  const i = css.indexOf(sel); const a = css.indexOf('{', i); const b = css.indexOf('}', a);
  const out = {};
  for (const m of css.slice(a + 1, b).matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)) out[m[1]] = m[2];
  return out;
}
const light = block(':root'); const dark = { ...light, ...block('[data-theme="dark"]') };
const lum = (hex) => { const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const PAIRS = [
  ['text', 'surface', 4.5], ['text-2', 'surface', 4.5], ['text-3', 'surface', 3.0], ['text', 'canvas', 4.5], ['text-2', 'surface-2', 4.5],
  ['on-action', 'action', 4.5], ['pos-yes', 'surface', 3.0], ['pos-no', 'surface', 3.0], ['pos-crit', 'surface', 3.0],
  ['status-pass-fg', 'status-pass-bg', 4.5], ['status-live-fg', 'status-live-bg', 4.5], ['status-fail-fg', 'status-fail-bg', 4.5], ['status-etc-fg', 'status-etc-bg', 4.5],
];
let bad = 0;
for (const [name, t] of [['light', light], ['dark', dark]]) {
  for (const [fg, bg, min] of PAIRS) {
    const r = ratio(t[fg], t[bg]);
    const ok = r >= min;
    if (!ok) bad += 1;
    console.log(`${ok ? 'ok  ' : 'LOW '} ${name} ${fg}/${bg} ${r.toFixed(2)} (min ${min})`);
  }
}
process.exit(bad ? 1 : 0);
