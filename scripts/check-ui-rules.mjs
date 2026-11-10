// UI 규칙 게이트: 금지 값(인디고 프라이머리, 그라데이션, 카드 그림자, 이모지, 슬로건)이 src/에 남아 있으면 실패.
// 사용: node scripts/check-ui-rules.mjs  (exit 1 = 위반 있음)
// import.meta를 쓰지 않는다(CRA jest 호환).
import fs from 'fs';
import path from 'path';

const RULES = [
  { rule: 'indigo', re: /#3354ff|#5b78ff|#7e97ff/i },
  { rule: 'primary-var', re: /var\(--primary(-text)?\)/ },
  { rule: 'gradient', re: /linear-gradient|radial-gradient/ },
  { rule: 'card-shadow', re: /--shadow-card|box-shadow\s*:\s*0\s+\d+px\s+\d+px/ },
  // 이모지: 보조 평면(이모티콘·픽토그램) + 기타 기호 블록 일부. 텍스트 구두점(·‘’…)은 제외.
  { rule: 'emoji', re: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B06}\u{2705}\u{274C}]/u },
  { rule: 'slogan', re: /실시간 정치 브리핑/ },
  // JSX 텍스트의 설명·권유문(…합니다/하세요/해요/세요로 끝나는 문장). 고지·제약 문구는 allow-ui-rule 마커로 예외.
  { rule: 'filler', re: />[^<>{}]{4,}(니다|세요|어요|아요|해요|드려요|주세요)[.…!?]?\s*</ },
];

const SKIP_LINE = /focus-visible|focus-ring|\/\*\s*allow-ui-rule/;

export function findViolations(files) {
  const out = [];
  for (const { path: p, text } of files) {
    const lines = String(text || '').split('\n');
    lines.forEach((line, i) => {
      if (SKIP_LINE.test(line)) return;
      for (const { rule, re } of RULES) {
        if (re.test(line)) out.push({ path: p, line: i + 1, rule });
      }
    });
  }
  return out;
}

export function collectFiles(root) {
  const exts = new Set(['.js', '.jsx', '.css']);
  const files = [];
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else if (exts.has(path.extname(name)) && !/\.test\.jsx?$/.test(name)) files.push({ path: full, text: fs.readFileSync(full, 'utf8') });
    }
  };
  walk(root);
  return files;
}

function main() {
  const root = path.resolve(process.cwd(), 'src');
  const violations = findViolations(collectFiles(root));
  if (violations.length === 0) {
    console.log('ui-rules: 0 violations');
    return 0;
  }
  const byRule = {};
  for (const v of violations) byRule[v.rule] = (byRule[v.rule] || 0) + 1;
  console.log(`ui-rules: ${violations.length} violations`, byRule);
  for (const v of violations.slice(0, 200)) console.log(`  ${path.relative(process.cwd(), v.path)}:${v.line} ${v.rule}`);
  return 1;
}

if (process.argv[1] && /check-ui-rules\.mjs$/.test(process.argv[1])) {
  process.exit(main());
}
