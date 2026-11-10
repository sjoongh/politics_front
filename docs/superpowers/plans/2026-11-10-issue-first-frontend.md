# 이슈 중심 개편 — 프론트 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 브리핑 코리아 웹·앱을 오늘·이슈·의원·검색 4탭, 이슈 피드 홈, 전체 페이지/분할 상세 구조로 재구성하고, 인디고 카드 UI를 헤어라인·의미색 중심의 가독성 우선 토큰으로 교체한다.

**Architecture:** `react-router` v7로 라우트별 페이지(`src/pages/*`)를 두고, 데이터 훅은 기존 `hooks/`·`components/use*.jsx` 로직을 옮겨 쓴다. 공용 UI는 `src/ui/*`, 이슈 전용은 `src/issue/*`. 토큰은 `src/theme/tokens.css` 하나이고 금지 값 검사 스크립트가 게이트다. 백엔드 v2 API(`?v=2` 목록, `/api/today`, `/api/sources`, `/articles` 페이지)가 없거나 필드가 비어 있어도 해당 줄만 생략하고 깨지지 않는다.

**Tech Stack:** React 19, CRA(react-scripts 5), react-router 7, lucide-react, Pretendard, Capacitor 7(`@capacitor/app` 추가), Playwright(검증), jest(순수 로직).

**Spec:** `docs/superpowers/specs/2026-11-10-issue-first-redesign-design.md` §4, §5, §7, §8

## Global Constraints

- 하단 탭 4개 고정: 오늘 `/` · 이슈 `/issues` · 의원 `/members` · 검색 `/search`. 로그인 여부와 무관. `/me`는 상단 바 아이콘.
- 금지 값(빌드 전 `node scripts/check-ui-rules.mjs`가 0건): `#3354ff`, `var(--primary)`, `linear-gradient`, 카드 `box-shadow`(토큰 `--shadow-card` 포함), 이모지 문자, 문자열 "실시간 정치 브리핑", "~합니다"로 끝나는 설명문 상수.
- 토큰(라이트): 본문 `#111418`, 보조 `#5c6470`, 3차 `#8a919c`, 헤어라인 `#e6e8ec`, 데스크톱 캔버스 `#f6f7f9`, 액션 `#111418`. 의미색 찬성 `#1f8a4c`, 반대 `#c92a2a`, 중립 `#5c6470`, 비판 `#b7791f`. 성향 진보 `#2563eb` 중도 `#6b7280` 보수 `#dc2626` 외신 `#7c3aed` 미분류 `#d1d5db`. 다크는 `[data-theme="dark"]`에서만 재정의.
- 폰트 크기 토큰 7단계 `--fs-12 … --fs-24`(12/13/14/15/17/20/24). 12px 미만 금지. 수치는 `font-variant-numeric: tabular-nums`.
- 간격 4px 그리드, 행 상하 12px, 섹션 24px, 좌우 16px(모바일)/24px(데스크톱). 터치 대상 44px.
- 모서리: 배지·칩 4px, 입력·패널 8px, 필터 칩만 알약.
- 아이콘 lucide만. 이모지 금지. 소스 유형은 텍스트 라벨 "정부·법안·표결·보도".
- 문구: 라벨·값·행동·오류·제약만. 소개문·부제·슬로건·빈 상태 위로 문구 금지. 데이터 없는 섹션은 생략.
- 상태 3분: 로딩(스켈레톤) / 오류(재시도 버튼) / 빈 결과(섹션 생략).
- MUI 신규 사용 금지. 기존 로그인·마이페이지·알림만 `makeTheme` 팔레트 조정.
- 테스트: 순수 로직은 `CI=true npx react-scripts test --watchAll=false`, UI는 Playwright 스크린샷 판독. 빌드 `CI=false npm run build`.
- 커밋은 작업 단위, 브랜치 `feat/issue-first-ui`(worktree). PR마다 codex 리뷰 1회.

## Review Focus

1. `digest`가 없는 구 이슈 문서(backfill 전·실패) → 이슈 행이 소스 줄 없이 렌더되고 크래시하지 않는다. (Task 4 테스트: `sourceLine(null)`)
2. `/issues/<병합된 id>` 진입 → 응답 `id`가 다르면 URL을 `replace`하고 뒤로가기가 목록으로 간다. (Task 5 Playwright 단계)
3. 상세 직접 진입(공유 링크) 후 Android 뒤로가기 → 앱 종료가 아니라 `/issues`로. (Task 1 테스트: `nextBackAction`)
4. 보도 수 0, 표결 수치 0:0:0인 이슈 → "공식 기록 없음" 표기와 막대 미표시가 정확히 갈린다. (Task 4·3 테스트)
5. 200% 확대·390px 폭에서 입장 칩·소스 줄이 넘치지 않고 줄바꿈된다. (Task 10 오버플로 측정)

---

### Task 0: 토큰 교체·금지 값 게이트·죽은 코드 제거

**Files:**
- Modify: `src/theme/tokens.css`(전면 교체), `src/theme/muiTheme.js`(팔레트), `src/App.css`(미사용 규칙 삭제), `src/components/layout/Header.jsx:9-10`(부제 삭제)
- Delete: `src/components/BriefingHero.jsx`, `DailySummaryCard.jsx`, `Tabs.jsx`, `Dashboard.jsx`, `SummaryCard.jsx`, `TagChart.jsx`, `Favorites.jsx`, `CommentSection.jsx`, `FeedbackForm.jsx`, `NotificationList.jsx`, `src/hooks/useComments.js`, `useFeedback.js`, `useFetchData.js`
- Create: `scripts/check-ui-rules.mjs`, `scripts/check-ui-rules.test.js`(jest, `src/` 밖이므로 `src/__tests__/checkUiRules.test.js`로 두고 함수만 import)

**Interfaces:**
- Produces: CSS 변수 `--text`, `--text-2`, `--text-3`, `--hairline`, `--canvas`, `--surface`, `--action`, `--pos-yes`, `--pos-no`, `--pos-neutral`, `--pos-crit`, `--lean-left/center/right/foreign/unknown`, `--status-pass-bg/fg`, `--status-live-bg/fg`, `--status-fail-bg/fg`, `--status-etc-bg/fg`, `--fs-12…--fs-24`, `--sp-1…--sp-6`(4·8·12·16·24·32), `--r-badge: 4px`, `--r-panel: 8px`, `--font-base`.
- Produces: `scripts/check-ui-rules.mjs` — `export function findViolations(files: {path, text}[]): {path, line, rule}[]`; CLI는 `src/**/*.{js,jsx,css}`를 읽어 위반 출력, 위반 있으면 exit 1. `package.json`에 `"lint:ui": "node scripts/check-ui-rules.mjs"`, `prebuild`에 포함하지 않고 Task 10에서 게이트로 실행.

- [ ] **Step 1: 실패 테스트**

```js
// src/__tests__/checkUiRules.test.js
import { findViolations } from '../../scripts/check-ui-rules.mjs';
test('flags indigo and gradient and emoji', () => {
  const v = findViolations([{ path: 'a.css', text: '.x{color:#3354ff;background:linear-gradient(red,blue)}' }, { path: 'b.jsx', text: 'const t = "🔥 이슈";' }]);
  expect(v.map((x) => x.rule).sort()).toEqual(['emoji', 'gradient', 'indigo']);
});
test('clean file passes', () => {
  expect(findViolations([{ path: 'c.css', text: '.x{color:var(--text)}' }])).toEqual([]);
});
```

- [ ] **Step 2: 실패 확인** — Run: `CI=true npx react-scripts test --watchAll=false src/__tests__/checkUiRules.test.js` → 모듈 없음
- [ ] **Step 3: `scripts/check-ui-rules.mjs` 구현**(규칙: indigo `#3354ff|#5b78ff|#7e97ff`, primary `var(--primary)`, gradient, shadow `--shadow-card|box-shadow:.*rgba`(단 `focus` 줄 제외), emoji 유니코드 범위, slogan 문자열)
- [ ] **Step 4: 통과 확인**
- [ ] **Step 5: `tokens.css` 교체** — 변수 정의 + 전역 리셋 + 포커스 링 + 다크 블록만 남기고, 컴포넌트 규칙(`.bk-card`, `.bk-modal`, `.topnav`, `.bottomnav`, `.persp-*`, `.src-*` 등)은 삭제한다(Task 2~8에서 새 컴포넌트가 각자 CSS를 가진다). `reduced-motion` 규칙 유지.
- [ ] **Step 6: 죽은 컴포넌트·훅 삭제, `Header.jsx` 부제 제거, `muiTheme.js` primary를 `#111418`/다크 `#eef1f7`로.**
- [ ] **Step 7: 빌드 확인** — Run: `CI=false npm run build` → 성공(삭제된 import가 App.jsx에 남아 있으면 여기서 함께 제거). Run: `node scripts/check-ui-rules.mjs` → 위반 목록 출력(아직 App.jsx 등에 남아 있는 것은 Task 1~8에서 사라진다; 이 단계 기준선 수치를 커밋 메시지에 기록)
- [ ] **Step 8: 커밋** `refactor(theme): readability tokens, ui-rules gate, remove dead components`

### Task 1: 라우터·AppFrame·뒤로가기·분석

**Files:**
- Create: `src/router.jsx`, `src/layout/AppFrame.jsx`, `src/layout/AppFrame.css`, `src/layout/TopBar.jsx`, `src/layout/BottomTabs.jsx`, `src/hooks/useBackHandler.js`, `src/hooks/backRules.js`, `src/hooks/backRules.test.js`, `src/pages/*.jsx`(7개 빈 페이지: Today, Issues, IssueDetail, Members, MemberDetail, Search, Me)
- Modify: `src/App.jsx`(라우터 마운트로 축소), `src/index.js`, `src/analytics/index.js:71`(`trackPageView(pathname)` 추가), `package.json`(deps)

**Interfaces:**
- Produces: `npm i react-router@^7 @capacitor/app@^7`.
- Produces: `nextBackAction({ modalOpen, historyIndex, pathname }) -> "close-modal" | "back" | "to-list" | "exit"` (순수, `src/hooks/backRules.js`). 규칙: 모달 → `close-modal`; `historyIndex > 0` → `back`; `/issues/:id`·`/members/:id` 직접 진입 → `to-list`; 그 외 → `exit`.
- Produces: `useBackHandler({ modalOpen, closeModal })` — Capacitor `App.addListener('backButton')`과 `popstate`를 `nextBackAction`으로 처리. `to-list`는 `navigate('/issues'|'/members', { replace: true })`, `exit`는 네이티브에서 `App.exitApp()`.
- Produces: `AppFrame` — `<TopBar/>` + `<main>` + `<BottomTabs/>`; `useLocation`으로 활성 탭. 데스크톱(≥1024px)은 탭이 상단 바 안으로, 하단 탭 숨김(CSS). `TopBar` 우측: 검색 입력(데스크톱만), `ThemeToggle`, `/me` 아이콘 버튼.
- Produces: 라우트와 레거시 리다이렉트 — `/?issue=<id>` → `/issues/<id>`(replace), `/?article=<id>` → `/` + `state.article`(기사 리더 열기).
- Produces: `trackPageView(pathname: string)` — `page_view` with `page_location = origin + pathname`. 라우트 변경 effect에서 호출.

- [ ] **Step 1: 실패 테스트**

```js
// src/hooks/backRules.test.js
import { nextBackAction } from './backRules';
test('modal first', () => expect(nextBackAction({ modalOpen: true, historyIndex: 3, pathname: '/issues/1' })).toBe('close-modal'));
test('history back', () => expect(nextBackAction({ modalOpen: false, historyIndex: 2, pathname: '/issues/1' })).toBe('back'));
test('direct detail goes to list', () => expect(nextBackAction({ modalOpen: false, historyIndex: 0, pathname: '/issues/abc' })).toBe('to-list'));
test('root exits', () => expect(nextBackAction({ modalOpen: false, historyIndex: 0, pathname: '/' })).toBe('exit'));
```

- [ ] **Step 2: 실패 확인** → **Step 3: `backRules.js` 구현** → **Step 4: 통과 확인**
- [ ] **Step 5: 의존성 설치, `router.jsx`(BrowserRouter + Routes + 레거시 리다이렉트 컴포넌트), `AppFrame`·`TopBar`·`BottomTabs`, 빈 페이지 7개, `App.jsx`를 Provider + Router로 축소.** 기존 `renderTabContent` 코드는 Task 4~8에서 페이지로 옮길 때까지 `src/legacy/App.legacy.jsx`로 이동(참조용, 라우트에 연결하지 않음).
- [ ] **Step 6: `useBackHandler` 구현, `AppFrame`에 연결(`historyIndex`는 `window.history.state?.idx`, react-router가 기록).**
- [ ] **Step 7: 빌드·수동 확인** — Run: `CI=false npm run build && npx serve -s build -l 5055 &` → 브라우저 `http://localhost:5055/?issue=609c190844a5417c87695945e7bef25e`가 `/issues/609c…`로 바뀌는지 Playwright로 확인(`page.url()` 단언 스크립트 `scripts/_route-check.mjs`).
- [ ] **Step 8: 커밋** `feat(router): routes, app frame, back handling, page_view tracking`

### Task 2: API 계층 v2

**Files:**
- Modify: `src/hooks/issues.js`, `src/hooks/members.js`
- Create: `src/hooks/today.js`, `src/hooks/sources.js`, `src/hooks/useIssuesPage.js`, `src/hooks/useToday.js`, `src/hooks/useSources.js`, `src/hooks/issueShape.js`, `src/hooks/issueShape.test.js`
- Move: `src/components/useIssues.jsx` → `src/hooks/useIssueDetail.js`(detail만), `useMembers.jsx` → `src/hooks/useMembers.js`, `useNews.jsx` → `src/hooks/useNewsHooks.js`(`useAiSearch`, `useForYou`, `useNews`만 유지; `usePresident`/`usePolicies`/`useStatements`/`useSearch`/`useAllNews`/`useExport` 삭제)

**Interfaces:**
- Produces: `getIssuesPage({ sort = 'rank', filter = null, cursor = null, limit = 50 }) -> Promise<{ items: Issue[], nextCursor: string|null }>` — `GET /api/issues?v=2&...`. 응답이 배열(구 서버)이면 `{ items: arr, nextCursor: null }`로 정규화.
- Produces: `getIssueDetail(id) -> Promise<IssueDetail>`, `getIssueArticles(id, cursor) -> Promise<{ items, nextCursor }>`.
- Produces: `getToday(date?: string) -> Promise<{ edition: Edition|null, otherIssues: Issue[] }>`.
- Produces: `getSources({ type, cursor }) -> Promise<{ items, nextCursor }>`.
- Produces: `getMemberDetail(id)` 그대로(응답에 `votes[].issue_id` 포함).
- Produces: 순수 `issueShape.js`: `normalizeIssue(raw) -> Issue` — `digest` 없으면 `digest: null`; `counts(issue) -> {gov,bill,vote,media}|null`; `hasOfficial(issue) -> boolean`; `officialStance(issue) -> Stance[]`(basis official|vote만); `voteLabel(vote) -> "182:61"|null`.
- Produces: 훅 `useIssuesPage({sort, filter})` → `{ items, loading, error, loadMore, hasMore, reload }`(커서 누적); `useToday(date)`; `useSources(type)`.

- [ ] **Step 1: 실패 테스트**

```js
// src/hooks/issueShape.test.js
import { normalizeIssue, counts, hasOfficial, officialStance, voteLabel } from './issueShape';
test('no digest is null', () => { const i = normalizeIssue({ id: 'a', title: 't' }); expect(i.digest).toBeNull(); expect(counts(i)).toBeNull(); expect(hasOfficial(i)).toBe(false); });
test('counts and official', () => { const i = normalizeIssue({ id: 'a', digest: { counts: { gov: 1, bill: 0, vote: 0, media: 5 } } }); expect(hasOfficial(i)).toBe(true); });
test('zero counts not official', () => expect(hasOfficial(normalizeIssue({ digest: { counts: { gov: 0, bill: 0, vote: 0, media: 3 } } }))).toBe(false));
test('vote label', () => { expect(voteLabel({ yes: 182, no: 61 })).toBe('182:61'); expect(voteLabel({ yes: 0, no: 0, abstain: 0 })).toBeNull(); expect(voteLabel(null)).toBeNull(); });
test('official stance filters press', () => expect(officialStance(normalizeIssue({ digest: { stance: [{ basis: 'press' }, { basis: 'vote' }] } }))).toHaveLength(1));
```

- [ ] **Step 2: 실패 확인** → **Step 3: 구현** → **Step 4: 통과 확인**
- [ ] **Step 5: API 함수·훅 구현, 훅 파일 이동과 import 경로 갱신, 삭제 대상 훅 제거.** 빌드 확인.
- [ ] **Step 6: 커밋** `feat(api): v2 issue paging, today, sources, issue shape helpers`

### Task 3: UI 프리미티브

**Files:**
- Create: `src/ui/Badge.jsx`, `src/ui/FilterChips.jsx`, `src/ui/SegmentedSort.jsx`, `src/ui/AnchorTabs.jsx`, `src/ui/Collapsible.jsx`, `src/ui/Skeleton.jsx`, `src/ui/ErrorRetry.jsx`, `src/ui/ui.css`, `src/issue/VoteTally.jsx`, `src/issue/BiasBar.jsx`, `src/issue/StanceChip.jsx`, `src/issue/issue.css`, `src/issue/format.js`, `src/issue/format.test.js`

**Interfaces:**
- Produces: `<Badge kind="status"|"category" value />` — status는 `가결→pass`, `부결→fail`, `진행중|계류→live`, 그 외 `etc` 토큰 매핑(`statusKind(status)` in `format.js`).
- Produces: `<FilterChips options=[{id,label}] value onChange />`(단일 선택, 가로 스크롤), `<SegmentedSort options value onChange />`, `<AnchorTabs tabs=[{id,label,count}] active onSelect />`(count 0 비활성), `<Collapsible summary>children</Collapsible>`, `<Skeleton lines />`, `<ErrorRetry message onRetry />`.
- Produces: `<VoteTally yes no abstain result size="sm"|"md" />` — 합계 0이면 `null` 렌더. `<BiasBar counts={{left,center,right,foreign,unknown}} total />` — total < 4면 `null`. `<StanceChip actor position basis />` — `position`이 객체(vote)이면 "찬성 N·반대 M" 텍스트, 문자열이면 라벨 매핑 `positionLabel(position)`.
- Produces: `format.js`: `statusKind`, `positionLabel`(`support→찬성, oppose→반대, criticize→비판, propose→제안, explain→설명, neutral→중립`), `tallyWidths({yes,no,abstain}) -> {yes,no,abstain}` 백분율(합 100, 0은 0), `shortDate(iso|'YYYY-MM-DD') -> 'M.D'`, `basisLabel(basis)`(`official→공식 발표, vote→표결, press→보도`).

- [ ] **Step 1: 실패 테스트**

```js
// src/issue/format.test.js
import { statusKind, positionLabel, tallyWidths, shortDate, basisLabel } from './format';
test('status kinds', () => { expect(statusKind('가결')).toBe('pass'); expect(statusKind('진행중')).toBe('live'); expect(statusKind('부결')).toBe('fail'); expect(statusKind('소강')).toBe('etc'); });
test('tally widths sum 100', () => { const w = tallyWidths({ yes: 182, no: 61, abstain: 9 }); expect(w.yes + w.no + w.abstain).toBe(100); expect(tallyWidths({ yes: 0, no: 0, abstain: 0 })).toEqual({ yes: 0, no: 0, abstain: 0 }); });
test('short date', () => { expect(shortDate('2026-11-10T01:00:00Z')).toBe('11.10'); expect(shortDate('2026-11-08')).toBe('11.8'); expect(shortDate('')).toBe(''); });
test('labels', () => { expect(positionLabel('oppose')).toBe('반대'); expect(basisLabel('vote')).toBe('표결'); });
```

- [ ] **Step 2: 실패 확인** → **Step 3: `format.js` 구현** → **Step 4: 통과 확인**
- [ ] **Step 5: 컴포넌트와 CSS 구현**(토큰만 참조, 44px 터치, 포커스 링).
- [ ] **Step 6: 빌드 확인, `node scripts/check-ui-rules.mjs`로 신규 파일 위반 0 확인.**
- [ ] **Step 7: 커밋** `feat(ui): primitives, vote tally, bias bar, stance chip`

### Task 4: 이슈 행과 이슈 피드 페이지

**Files:**
- Create: `src/issue/IssueRow.jsx`, `src/issue/sourceLine.js`, `src/issue/sourceLine.test.js`, `src/pages/Issues.jsx`, `src/pages/Issues.css`, `src/hooks/useScrollRestore.js`

**Interfaces:**
- Produces: `sourceLine(issue) -> { parts: string[], none: boolean, media: number }` — `parts` 예 `["정부 2","법안 1","표결 182:61","보도 52"]`, 0인 항목 제외, 정부·법안·표결 모두 0이면 `none: true`에 `parts = ["보도 52"]`. `digest` 없으면 `{ parts: [], none: false, media: 0 }`.
- Produces: `<IssueRow issue onSelect selected />` — 4줄 구조(배지 줄 / 제목 / 요약 2줄 클램프 / 소스 줄 + 우측 `shortDate(digest.last_activity_at || updated_at)`), 공식 근거 입장 2개 이상일 때만 `StanceChip` 최대 2개. 법안 이슈는 제목 `law_name`, 보조줄 원제목. `role="link"`, Enter/Space.
- Produces: `Issues` 페이지 — `FilterChips`(전체/공식 기록 있음→`has_official`/표결 있음→`has_vote`/정부 발표 있음→`has_gov`/진행중→`status:진행중`/가결→`status:가결`) + `SegmentedSort`(주목도순 `rank`/갱신순 `updated`/보도 많은 순 `media`) + `useIssuesPage` + "더 보기" 버튼 + 스켈레톤/오류. 필터·정렬은 URL 쿼리(`?f=&s=`)에 저장. 행 선택 → 모바일 `navigate('/issues/:id')`, 데스크톱(≥1024px) 분할(`Issues`가 `<Outlet/>`로 `IssueDetail`을 우측에 렌더, 선택은 `navigate(..., { replace: true })`).
- Produces: `useScrollRestore(key)` — 세션 스토리지에 스크롤 저장·복원.

- [ ] **Step 1: 실패 테스트**

```js
// src/issue/sourceLine.test.js
import { sourceLine } from './sourceLine';
test('null digest', () => expect(sourceLine({ digest: null })).toEqual({ parts: [], none: false, media: 0 }));
test('full line', () => expect(sourceLine({ digest: { counts: { gov: 2, bill: 1, vote: 1, media: 52 }, vote: { yes: 182, no: 61 } } }).parts).toEqual(['정부 2', '법안 1', '표결 182:61', '보도 52']));
test('no official', () => { const l = sourceLine({ digest: { counts: { gov: 0, bill: 0, vote: 0, media: 7 } } }); expect(l.none).toBe(true); expect(l.parts).toEqual(['보도 7']); });
```

- [ ] **Step 2: 실패 확인** → **Step 3: `sourceLine.js` 구현** → **Step 4: 통과 확인**
- [ ] **Step 5: `IssueRow`, `Issues` 페이지, `useScrollRestore` 구현. 라우트에 `/issues` 연결(중첩 `/issues/:id`는 Task 5).**
- [ ] **Step 6: 빌드 후 Playwright 캡처** — `scripts/shots-v2.mjs`(Task 10에서 완성, 여기서는 `/issues` 모바일·데스크톱 2컷) → 판독: 4줄 구조, 카드 그림자 없음, 입장 칩 조건부.
- [ ] **Step 7: 커밋** `feat(issues): issue row and feed page with server filters and cursor paging`

### Task 5: 이슈 상세 페이지

**Files:**
- Create: `src/pages/IssueDetail.jsx`, `src/pages/IssueDetail.css`, `src/issue/OfficialRecordList.jsx`, `src/issue/StanceTable.jsx`, `src/issue/Timeline.jsx`, `src/issue/PressSection.jsx`, `src/issue/ProposerChips.jsx`, `src/issue/detailModel.js`, `src/issue/detailModel.test.js`
- Modify: `src/components/IssueDetail.jsx` → 삭제(페이지로 대체), `src/components/NewsReaderModal.jsx`(props 유지, 호출처만 변경), `src/router.jsx`

**Interfaces:**
- Produces: `detailModel.js`: `officialRecords(detail) -> Record[]` — `source_panels.{assembly_vote, assembly_bill, government}`를 `{kind:'vote'|'bill'|'gov', date, title, ...}`로 합쳐 날짜 역순; `timelineItems(detail) -> {date, label}[]` — `events` + 공식 기록 날짜(발의·표결·발표), 2개 미만이면 `[]`; `stanceRows(detail) -> Stance[]` — `digest.stance` 전부(상세는 press 포함), 없으면 `[]`; `pressModel(detail) -> { counts, total, blindspotText|null, groups }` — `perspectives.breakdown`에서 `official`을 `unknown`에 합산, `blindspot`이 있으면 `"수집된 보도 중 ${진보|보수} 성향 매체 없음"`; `proposerChips(detail, members) -> {id,name}[]` — 법안 `bill.proposers` 이름과 의원 목록 이름 일치, 최대 8.
- Produces: `IssueDetail` 페이지 — 헤더(뒤로·공유) → `OfficialRecordList`(0이면 "공식 기록 없음" 한 줄) → `StanceTable`(0이면 생략) → `AnchorTabs`(공식 기록·입장·타임라인·보도) → `Timeline` → `PressSection`(`BiasBar` + 범례 + 성향별 기사 행, `getIssueArticles`로 더 보기, 행 탭 → `NewsReaderModal`) → `ProposerChips`. 응답 `data.id !== params.id`면 `navigate('/issues/'+data.id, { replace: true })`. 표시 시 `trackSelectContent('issue', id)`. 공유는 기존 `issueShareUrl` 로직 유지.
- Produces: 데스크톱 분할에서 상세 닫기 버튼 → `navigate('/issues', { replace: true })`.

- [ ] **Step 1: 실패 테스트**

```js
// src/issue/detailModel.test.js
import { officialRecords, timelineItems, pressModel } from './detailModel';
const D = { events: [], source_panels: { assembly_vote: [{ id: 'v', title: '표결: X', published_at: '2026-11-10', vote: { yes: 1, no: 0, abstain: 0, result: '가결' } }], assembly_bill: [{ id: 'b', title: 'X 개정안', published_at: '2026-10-01', bill: { proposers: ['김의원'] } }], government: [] }, perspectives: { breakdown: { counts: { left: 2, center: 0, right: 0, foreign: 0, official: 1, unknown: 0 }, total: 3, blindspot: 'right' } } };
test('records merged desc', () => expect(officialRecords(D).map((r) => r.kind)).toEqual(['vote', 'bill']));
test('timeline from records', () => expect(timelineItems(D)).toHaveLength(2));
test('timeline needs two', () => expect(timelineItems({ events: [], source_panels: { assembly_vote: [], assembly_bill: [], government: [] } })).toEqual([]));
test('press model folds official and words blindspot', () => { const p = pressModel(D); expect(p.counts.unknown).toBe(1); expect(p.blindspotText).toBe('수집된 보도 중 보수 성향 매체 없음'); });
test('press model without perspectives', () => expect(pressModel({}).total).toBe(0));
```

- [ ] **Step 2: 실패 확인** → **Step 3: `detailModel.js` 구현** → **Step 4: 통과 확인**
- [ ] **Step 5: 컴포넌트와 페이지 구현, 라우트 중첩(`/issues` 안에 `:id`), 구 `IssueDetail.jsx` 삭제.**
- [ ] **Step 6: Playwright 확인** — `/issues/609c190844a5417c87695945e7bef25e` 모바일·데스크톱 캡처 + `/?issue=<id>` 리다이렉트 후 `history.back()`이 `/issues`인지 단언(`scripts/_route-check.mjs` 확장).
- [ ] **Step 7: 커밋** `feat(issues): full-page detail with official records, stance table, timeline, press`

### Task 6: 오늘 페이지

**Files:**
- Create: `src/pages/Today.jsx`, `src/pages/Today.css`, `src/today/TopIssueBlock.jsx`, `src/today/DaySection.jsx`, `src/today/dateNav.js`, `src/today/dateNav.test.js`

**Interfaces:**
- Produces: `dateNav.js`: `kstToday() -> 'YYYY-MM-DD'`, `shiftDate(date, delta) -> 'YYYY-MM-DD'`, `formatHeader(date) -> '11월 10일 월요일'`, `isFuture(date) -> boolean`.
- Produces: `Today` 페이지 — 날짜 헤더(이전/다음, 다음은 오늘이면 비활성) → `overview` 한 줄(있을 때) → `TopIssueBlock` ×≤3(배지 → 제목 → 요약 → 공식 근거 입장 ≤3 → 공식 기록 한 줄) → `DaySection`("국회 오늘": `Collapsible` 요약 "본회의 표결 N건 · 발의 M건", 펼치면 `VoteTally` 행과 법안 행, 절차성은 "그 밖 K건"으로 접힘; "정부 오늘": "정책브리핑 N건") → 이슈 피드(`IssueRow` 목록 = `otherIssues`, 오늘이면 `useIssuesPage` 첫 페이지에서 상위 3개 제외). 판이 없으면 헤더 아래 바로 피드. 건수 0인 섹션 생략. `/today/:date`도 같은 컴포넌트.

- [ ] **Step 1: 실패 테스트**

```js
import { shiftDate, formatHeader, isFuture } from './dateNav';
test('shift', () => expect(shiftDate('2026-11-10', -1)).toBe('2026-11-09'));
test('header', () => expect(formatHeader('2026-11-10')).toBe('11월 10일 화요일'));
test('future', () => expect(isFuture('2999-01-01')).toBe(true));
```

(2026-11-10은 화요일이다. 요일 계산은 `Date`에 KST 고정 오프셋을 쓴다.)

- [ ] **Step 2: 실패 확인** → **Step 3: 구현** → **Step 4: 통과 확인**
- [ ] **Step 5: 페이지·컴포넌트 구현, `/`와 `/today/:date` 연결. `?article=` 레거시 진입 시 `NewsReaderModal` 열기(Task 1의 `state.article`).**
- [ ] **Step 6: Playwright 캡처 `/` 모바일·데스크톱, 판 없는 날짜(`/today/2026-01-01`) 캡처 → 피드만 보이는지 판독.**
- [ ] **Step 7: 커밋** `feat(today): daily edition page`

### Task 7: 의원 목록·상세

**Files:**
- Create: `src/pages/Members.jsx`, `src/pages/MemberDetail.jsx`, `src/pages/Members.css`, `src/member/MemberRow.jsx`, `src/member/VoteSummary.jsx`, `src/member/memberModel.js`, `src/member/memberModel.test.js`
- Delete: `src/components/MemberCard.jsx`, `src/components/MemberDetail.jsx`, `src/components/ListToolbar.jsx`(기능은 `FilterChips`+검색 입력으로)

**Interfaces:**
- Produces: `memberModel.js`: `filterMembers(members, { query, party, sort }) -> Member[]`(기존 `App.jsx:66-87` 로직 이동: 이름·지역구 포함, 정당, `name|criminal|term` 정렬), `termCount(term) -> number`, `voteRows(detail) -> {bill, vote, issueId|null, link}[]`.
- Produces: `Members` 페이지 — 검색 입력 + 정당 `FilterChips` + `SegmentedSort`(이름순/전과순/선수순) + `MemberRow` 목록(좌측 2px 정당 띠, 36px 사진, 이름·정당, 지역구·위원회, "전과 N · M선" 텍스트). 데스크톱 분할은 Task 4와 같은 패턴(`<Outlet/>`).
- Produces: `MemberDetail` 페이지 — 프로필 줄 → `VoteSummary`(찬/반/기권/불참 수 + 막대) → 주요 표결(법안명 + 본인 표 + `issueId` 있으면 `/issues/:id` 링크) → 발의 법안 → 전과. 섹션은 데이터 있을 때만. `trackSelectContent('member', id)`.

- [ ] **Step 1: 실패 테스트**

```js
import { filterMembers, termCount, voteRows } from './memberModel';
const M = [{ id: '1', name: '김가', district: '서울', party: 'A', criminal_count: 2, term: '제21대, 제22대' }, { id: '2', name: '이나', district: '부산', party: 'B', criminal_count: 0, term: '제22대' }];
test('term count', () => expect(termCount('제21대, 제22대')).toBe(2));
test('filter query and party', () => expect(filterMembers(M, { query: '부산', party: '전체', sort: 'name' }).map((m) => m.id)).toEqual(['2']));
test('sort criminal', () => expect(filterMembers(M, { query: '', party: '전체', sort: 'criminal' })[0].id).toBe('1'));
test('vote rows carry issue id', () => expect(voteRows({ votes: [{ bill: 'X', vote: '찬성', issue_id: 'issue_bill_1' }] })[0].issueId).toBe('issue_bill_1'));
```

- [ ] **Step 2: 실패 확인** → **Step 3: 구현** → **Step 4: 통과 확인** → **Step 5: 페이지 구현, 구 컴포넌트 삭제, 라우트 연결** → **Step 6: Playwright 캡처 `/members`, `/members/:id`** → **Step 7: 커밋** `feat(members): row list and detail with vote-to-issue links`

### Task 8: 검색·둘러보기, 내 정보

**Files:**
- Create: `src/pages/Search.jsx`, `src/pages/Search.css`, `src/search/catalogMatch.js`, `src/search/catalogMatch.test.js`, `src/search/SourceBrowser.jsx`, `src/pages/Me.jsx`
- Modify: `src/components/AiSearchResults.jsx`(스타일 토큰화, 이모지 제거), `src/components/SearchFilters.jsx` → 삭제(입력은 `Search` 페이지 내장), `src/components/ForYouFeed.jsx`(`/me` 섹션으로), `src/components/LoginForm.jsx`·`MyPage.jsx`(토큰 색 조정만)

**Interfaces:**
- Produces: `catalogMatch.js`: `matchIssues(issues, q) -> Issue[]`(제목·요약·keywords 포함, 최대 10), `matchMembers(members, q) -> Member[]`(이름·지역구, 최대 10), `normalizeQuery(q) -> string`(공백 정리, 2자 미만이면 `''`).
- Produces: `Search` 페이지 — 입력(상단 바 데스크톱 입력과 같은 URL `?q=`) → 결과 묶음 순서 이슈(`IssueRow`) · 의원(`MemberRow`) · 기사(`AiSearchResults`, `useAiSearch`, 브리핑 버튼 유지). `q`가 비면 `SourceBrowser`: "법안·표결"(`assembly_vote`/`assembly_bill` 토글) · "정부 발표"(`gov_policy`) 목록(`useSources`, 제목·날짜·연결 이슈 링크, 더 보기).
- Produces: `Me` 페이지 — 비로그인: `LoginForm` 인라인; 로그인: `MyPage` + `ForYouFeed` 섹션 + 로그아웃.

- [ ] **Step 1: 실패 테스트**

```js
import { matchIssues, matchMembers, normalizeQuery } from './catalogMatch';
test('short query is empty', () => expect(normalizeQuery(' 가 ')).toBe(''));
test('match issues by keyword', () => expect(matchIssues([{ id: '1', title: 'x', summary: '', keywords: ['추경'] }, { id: '2', title: 'y', summary: '', keywords: [] }], '추경').map((i) => i.id)).toEqual(['1']));
test('match members by district', () => expect(matchMembers([{ id: 'a', name: '김', district: '수원' }], '수원')).toHaveLength(1));
```

- [ ] **Step 2: 실패 확인** → **Step 3: 구현** → **Step 4: 통과 확인** → **Step 5: 페이지 구현, 라우트 연결, `legacy/App.legacy.jsx` 삭제(남은 참조 없음 확인)** → **Step 6: 빌드 + `node scripts/check-ui-rules.mjs` 0건** → **Step 7: 커밋** `feat(search,me): search with catalog match and source browser; me page`

### Task 9: 다크 모드·접근성 마감

**Files:**
- Modify: `src/theme/tokens.css`(다크 블록 값 확정), 각 컴포넌트 CSS(포커스·대비 수정)

- [ ] **Step 1: 다크 토큰 확정** — 배경 `#0f1115`, 표면 `#151821`, 헤어라인 `#262a33`, 본문 `#eef1f7`, 보조 `#9aa3b5`, 3차 `#6f7784`, 액션 `#eef1f7`; 의미색은 라이트 값에서 밝기만 +10%(찬성 `#34a866`, 반대 `#e05252`, 비판 `#d6a040`), 성향색 유지.
- [ ] **Step 2: 포커스 복귀** — 상세 닫기(데스크톱) 후 선택했던 `IssueRow`로 `focus()`(id 기반 `ref` 맵).
- [ ] **Step 3: 대비 점검 스크립트** — `scripts/_contrast.mjs`: 토큰 쌍(본문/배경, 보조/배경, 상태 fg/bg, 칩 fg/bg) WCAG 비율 계산, AA(4.5:1, 큰 글자 3:1) 미달 0건 출력.
- [ ] **Step 4: 커밋** `feat(theme): dark tokens, focus return, contrast check`

### Task 10: 시각·성능 검증 게이트

**Files:**
- Create: `scripts/shots-v2.mjs`, `scripts/_font-histogram.mjs`, `scripts/_overflow.mjs`
- Modify: `package.json`(`"verify:ui": "node scripts/check-ui-rules.mjs && node scripts/_font-histogram.mjs && node scripts/_overflow.mjs"`)

**Interfaces:**
- Produces: `shots-v2.mjs` — `SHOT_BASE`(기본 `http://localhost:5055`)에서 라우트 7개(`/`, `/issues`, `/issues/<id>`, `/members`, `/members/<id>`, `/search`, `/search?q=추경`) × 뷰포트(390×844 모바일, 1280×900 데스크톱) × 테마(라이트/다크, `localStorage bk-theme`) 캡처 + 데스크톱 `/issues/<id>` 분할 상태. 출력 `/tmp/shots/v2-<route>-<vp>-<theme>.png`.
- Produces: `_font-histogram.mjs` — 각 라우트에서 텍스트를 가진 가시 요소의 computed `font-size` 분포 출력, 허용 집합 `{12,13,14,15,17,20,24}` 밖 또는 12 미만이 있으면 exit 1.
- Produces: `_overflow.mjs` — 뷰포트 390·768·1280과 390×zoom 2(`deviceScaleFactor` 대신 CSS `zoom: 2`)에서 `document.scrollingElement.scrollWidth - clientWidth`가 0인지, 아니면 exit 1.

- [ ] **Step 1: 스크립트 작성, 빌드·서브(`npx serve -s build -l 5055`) 후 실행** — Run: `npm run verify:ui` → 통과. 실패 항목은 해당 컴포넌트 CSS 수정 후 재실행.
- [ ] **Step 2: 스크린샷 전수 판독** — 28컷 + 분할 2컷을 열어 §5 기준(헤어라인·카드 없음·이모지 없음·부제 없음·입장 칩 조건부·"공식 기록 없음" 표기·다크 의미색 유지)으로 판독, 문제는 목록화해 수정 후 재촬영.
- [ ] **Step 3: 키보드 경로 확인** — Playwright로 `/issues`에서 Tab → Enter(상세 열림) → Escape 또는 닫기 → 포커스가 같은 행에 있는지 단언(`scripts/_route-check.mjs`에 추가).
- [ ] **Step 4: 공유 링크 회귀** — `/?issue=<id>`와 `/?article=<id>` 동작 단언(Task 1 스크립트 재실행).
- [ ] **Step 5: 커밋** `test(ui): screenshot matrix, font histogram, overflow gates`

### Task 11: 배포와 Android

- [ ] **Step 1: 백엔드 2차 배포 완료 확인**(백엔드 플랜 Task 14 Step 6). 미완이면 대기.
- [ ] **Step 2: 프론트 배포** — PR 머지 후 `CI=false npm run build && firebase deploy --only hosting`. 라이브에서 `shots-v2.mjs`를 `SHOT_BASE=https://koreanpolitical.web.app`로 재실행해 2컷(홈 모바일·이슈 상세 데스크톱) 판독.
- [ ] **Step 3: Android** — `android/app/build.gradle` versionCode 14 / versionName 1.2.0 → `npx cap sync android` → `JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home ./android/gradlew -p android bundleRelease` → 서명·검증(메모리 `briefingkorea-ui-overhaul`의 명령) → AAB 경로 보고. Play 업로드는 사용자.
- [ ] **Step 4: 에뮬레이터 또는 실기기에서 뒤로가기 4단계 규칙 확인**(상세 직접 진입 → 목록, 루트 → 종료). 결과를 PR 설명에 기록.
- [ ] **Step 5: 커밋** `chore(android): 1.2.0 (versionCode 14)`
