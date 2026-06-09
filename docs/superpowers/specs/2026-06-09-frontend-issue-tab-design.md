# 프론트 이슈 탭 — 설계 (Design Spec)

작성일: 2026-06-09
대상: politics_front (React 19 / CRA / Modern Civic 디자인). 백엔드 `/api/issues` 소비.

## 1. 목표 & 범위
백엔드 이슈 추적 API를 프론트에 노출 — `이슈` 탭에서 이슈 목록(상태 뱃지)과 상세(타임라인 + 관련 뉴스 + 공식 링크)를 본다.
**범위:** 프론트만(백엔드 무변경), **읽기 전용**(생성/수정은 admin API로 별도). 기존 Modern Civic 토큰으로 라이트/다크·반응형 자동 적용.

## 2. 백엔드 계약 (이미 구현됨)
- `GET /api/issues?status=&category=&limit=&offset=` → `data: [issue 요약]` · 요약 = `{id, slug, title, summary, status, category, started_at, updated_at}`
- `GET /api/issues/{id}` → `data: {…전체…, events:[{id,date,headline,summary,source_url,article_ids}], articles:[ArticlePublic], official_links:[{label,url}], keywords:[...]}`
- ArticlePublic = `{id,title,ai_summary,source,source_url,image_url,category,published_at}` (기존 NewsCard가 읽는 필드).

## 3. 데이터 레이어
- `src/hooks/issues.js`: `getIssues(status)` (GET /api/issues), `getIssueDetail(id)` (GET /api/issues/{id}). 기존 `src/hooks/api.js`의 axios `api` 재사용, 응답은 `res.data.data`.
- `src/components/useIssues.jsx`: `useIssues()` → `{issues, loading, error}` (마운트 시 목록 로드); `useIssueDetail(id)` → `{detail, loading}` (id 변경 시 상세 로드, id 없으면 미동작).

## 4. 컴포넌트 (기존 bk-card / bk-modal 재사용)
- `src/components/IssueCard.jsx` — props `{issue, onClick}`. 제목 + 상태 뱃지 + 카테고리 + 요약 + 갱신일(`formatDate`). `.bk-card` 사용.
- `src/components/IssueDetail.jsx` — props `{issueId, onClose}`. `useIssueDetail(issueId)`로 로드. `.bk-modal` 패널: 헤더(제목+상태 뱃지), 요약, 공식 링크(있으면), **타임라인**(events: 날짜·헤드라인·요약), **관련 뉴스**(detail.articles → 기존 `NewsCard type="news"` 재사용; 카드 클릭은 웹뷰로 원문). 로딩 시 스켈레톤/메시지.
- 상태 뱃지 매핑(`src/components/issueStatus.js` 또는 inline): 진행중→`bk-badge`(기본/파랑), 가결→`bk-badge--success`, 부결→`bk-badge--alert`, 계류→`bk-badge--warning`, 종결/소강→중립(회색; `.bk-badge--muted` 신규 또는 인라인). 

## 5. App.jsx 배선
- `tabs` 배열에 `{ id: 'issues', label: '이슈' }` 추가(Navigation이 lucide 아이콘 매핑 — `issues` 키 아이콘 추가 필요).
- `renderTabContent`에 `case 'issues'`: `useIssues()` 목록을 `feed-grid`에 `IssueCard`로. 카드 클릭 → `selectedIssueId` 상태 set.
- `selectedIssueId`가 있으면 `<IssueDetail issueId={selectedIssueId} onClose={...}/>` 렌더(Modal과 동급 위치).
- Navigation 아이콘: `src/components/layout/Navigation.jsx`의 ICONS에 `issues: <lucide 아이콘>`(예: `Flag` 또는 `Activity`) 추가.

## 6. 스타일
- 대부분 기존 토큰/클래스 재사용. 신규 최소: `.bk-badge--muted`(회색 상태), `.issue-timeline`/`.issue-event`(타임라인 좌측 라인+점), `.issue-meta`. `src/theme/tokens.css`에 추가.

## 7. 성공 기준
- 띄워둔 개발 백엔드(이슈 2건+타임라인)로 `이슈` 탭에 목록이 뜨고, 카드 클릭 시 상세(타임라인 + 관련 뉴스)가 모달로 표시.
- 라이트/다크·모바일/데스크톱 정상. 빌드(`CI=false npm run build`) 통과 + 실행 확인.

## 8. 제외 / 후속
- 이슈 생성/수정 UI(관리자) — 후속. 무한스크롤/필터 UI — 후속(목록은 기본 20건). AI 자동분류 — 백엔드 후속 슬라이스.
