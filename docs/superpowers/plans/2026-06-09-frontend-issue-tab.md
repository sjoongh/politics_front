# 프론트 이슈 탭 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 백엔드 `/api/issues`를 소비하는 `이슈` 탭(목록 + 타임라인/관련뉴스 상세 모달)을 기존 Modern Civic 디자인으로 추가한다.

**Architecture:** 기존 패턴 그대로 — `hooks/issues.js`(axios 호출) → `components/useIssues.jsx`(React 훅) → `IssueCard`/`IssueDetail`(bk-card/bk-modal 재사용). App.jsx에 탭·케이스·상세 모달 배선, Navigation에 아이콘 추가. 백엔드 무변경, 읽기 전용.

**Tech Stack:** React 19, CRA, axios, lucide-react, 기존 tokens.css 디자인 시스템.

**검증:** 테스트 인프라 없음 → `CI=false npm run build` 통과 + 띄워둔 개발 백엔드(`localhost:8000`, 이슈 2건+타임라인)로 실시간 확인. 작업 전 `git checkout -b feat/issue-tab`.

---

## 기존 코드(참고)
- `src/hooks/api.js`: axios `api` (dev면 baseURL `http://localhost:8000`). `export default api`.
- `src/components/useNews.jsx`: 훅 패턴 참고.
- `src/components/NewsCard.jsx`: `({item, type, onDetailClick})`, type="news"면 `onDetailClick('news', item)`로 웹뷰.
- `src/components/EmptyState.jsx`, `SkeletonCard.jsx`: 재사용.
- `src/utils/dateUtils.js`: `formatDate`.
- `src/components/layout/Navigation.jsx`: `ICONS` 맵(키=tab.id) + lucide.
- `src/App.jsx`: `tabs` 배열(34–41), `renderTabContent` switch, 메인 `return`(279–306, Modal/LoginForm 렌더 위치).
- `src/theme/tokens.css`: `.bk-card`, `.bk-badge`, `.bk-badge--success/--alert/--warning`, `.bk-modal*`, `.feed-grid`, `.section-title`.

## 파일 구조
| 파일 | 책임 |
|------|------|
| `src/hooks/issues.js` | getIssues/getIssueDetail (axios) |
| `src/components/useIssues.jsx` | useIssues/useIssueDetail 훅 |
| `src/components/issueStatus.js` | 상태→뱃지 클래스 매핑 |
| `src/components/IssueCard.jsx` | 이슈 요약 카드 |
| `src/components/IssueDetail.jsx` | 상세 모달(타임라인+관련뉴스) |
| `src/App.jsx` | (수정) 탭·케이스·상세 배선 |
| `src/components/layout/Navigation.jsx` | (수정) issues 아이콘 |
| `src/theme/tokens.css` | (수정) 뱃지 muted + 타임라인 스타일 |

---

## Task 1: 데이터 레이어 (API 함수 + 훅)

**Files:** Create `src/hooks/issues.js`, `src/components/useIssues.jsx`

- [ ] **Step 1: `src/hooks/issues.js` 작성**
```jsx
import api from './api';

export async function getIssues(status = null) {
  const params = {};
  if (status) params.status = status;
  const res = await api.get('/api/issues', { params });
  return res.data.data || [];
}

export async function getIssueDetail(id) {
  const res = await api.get(`/api/issues/${id}`);
  return res.data.data;
}
```

- [ ] **Step 2: `src/components/useIssues.jsx` 작성**
```jsx
import { useState, useEffect, useCallback } from 'react';
import { getIssues, getIssueDetail } from '../hooks/issues';

export function useIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setIssues(await getIssues());
    } catch (err) {
      setError(err.message || '이슈를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { issues, loading, error, refresh: load };
}

export function useIssueDetail(id) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) { setDetail(null); return; }
    let active = true;
    setLoading(true);
    getIssueDetail(id)
      .then((d) => { if (active) setDetail(d); })
      .catch(() => { if (active) setDetail(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  return { detail, loading };
}
```

- [ ] **Step 3: 빌드 확인** — Run: `cd /Users/manager/side/politics_front && CI=false npm run build 2>&1 | tail -6`
Expected: `Compiled successfully.` (아직 미사용이라 경고 없이 컴파일만 확인).

- [ ] **Step 4: Commit**
```bash
git add src/hooks/issues.js src/components/useIssues.jsx
git commit -m "feat(issues): data layer (getIssues/getIssueDetail + hooks)"
```

---

## Task 2: IssueCard + 상태 뱃지 + CSS

**Files:** Create `src/components/issueStatus.js`, `src/components/IssueCard.jsx`. Modify `src/theme/tokens.css`.

- [ ] **Step 1: `src/components/issueStatus.js` 작성**
```jsx
const STATUS_CLASS = {
  '진행중': 'bk-badge',
  '가결': 'bk-badge bk-badge--success',
  '부결': 'bk-badge bk-badge--alert',
  '계류': 'bk-badge bk-badge--warning',
  '종결': 'bk-badge bk-badge--muted',
  '소강': 'bk-badge bk-badge--muted',
};

export function statusBadgeClass(status) {
  return STATUS_CLASS[status] || 'bk-badge';
}
```

- [ ] **Step 2: `src/components/IssueCard.jsx` 작성**
```jsx
import React from 'react';
import { formatDate } from '../utils/dateUtils';
import { statusBadgeClass } from './issueStatus';

export default function IssueCard({ issue, onClick }) {
  return (
    <article className="bk-card issue-card" onClick={() => onClick(issue.id)}>
      <div className="bk-card__body">
        <span className={statusBadgeClass(issue.status)}>{issue.status}</span>
        <h3 className="bk-card__title">{issue.title}</h3>
        {issue.summary && <p className="bk-card__summary">{issue.summary}</p>}
        <div className="bk-card__meta">
          <span className="bk-card__src">{issue.category}</span>
          <span>{formatDate(issue.updated_at)}</span>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 3: `src/theme/tokens.css` 끝에 추가**
```css

/* ===== 이슈 ===== */
.issue-card { cursor: pointer; }
.bk-badge--muted { background: var(--badge-bg); color: var(--text-secondary); }
.issue-links { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
.issue-link { font-size: 12.5px; color: var(--primary-text); text-decoration: none;
  background: var(--badge-bg); padding: 6px 10px; border-radius: var(--radius-pill); }
.issue-section-title { font-weight: 800; font-size: 14px; margin: 16px 0 10px; color: var(--text); }
.issue-timeline { border-left: 2px solid var(--card-border); padding-left: 14px; margin-left: 4px; }
.issue-event { position: relative; padding: 8px 0; }
.issue-event::before { content: ''; position: absolute; left: -21px; top: 13px;
  width: 9px; height: 9px; border-radius: 50%; background: var(--primary); }
.issue-event__date { font-size: 11px; color: var(--text-secondary); }
.issue-event__headline { font-weight: 700; font-size: 14px; color: var(--text); margin: 2px 0; }
.issue-event__summary { font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; }
```

- [ ] **Step 4: 빌드 확인** — Run: `CI=false npm run build 2>&1 | tail -6` → `Compiled successfully.`

- [ ] **Step 5: Commit**
```bash
git add src/components/issueStatus.js src/components/IssueCard.jsx src/theme/tokens.css
git commit -m "feat(issues): IssueCard + status badge mapping + styles"
```

---

## Task 3: IssueDetail 모달 (타임라인 + 관련 뉴스)

**Files:** Create `src/components/IssueDetail.jsx`

- [ ] **Step 1: `src/components/IssueDetail.jsx` 작성**
```jsx
import React from 'react';
import { useIssueDetail } from './useIssues';
import { statusBadgeClass } from './issueStatus';
import { formatDate } from '../utils/dateUtils';
import NewsCard from './NewsCard';

export default function IssueDetail({ issueId, onClose, onArticleClick }) {
  const { detail, loading } = useIssueDetail(issueId);

  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="bk-modal" onClick={handleOverlay}>
      <div className="bk-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button className="bk-modal__close" onClick={onClose} aria-label="닫기">&times;</button>

        {loading && <p className="bk-card__summary">불러오는 중…</p>}
        {!loading && !detail && <p className="bk-card__summary">이슈를 불러오지 못했습니다.</p>}

        {detail && (
          <>
            <span className={statusBadgeClass(detail.status)}>{detail.status}</span>
            <h3>{detail.title}</h3>
            {detail.summary && <p>{detail.summary}</p>}

            {detail.official_links && detail.official_links.length > 0 && (
              <div className="issue-links">
                {detail.official_links.map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noreferrer" className="issue-link">🔗 {l.label}</a>
                ))}
              </div>
            )}

            {detail.events && detail.events.length > 0 && (
              <div>
                <div className="issue-section-title">타임라인</div>
                <div className="issue-timeline">
                  {detail.events.map((ev) => (
                    <div key={ev.id} className="issue-event">
                      <div className="issue-event__date">{formatDate(ev.date)}</div>
                      <div className="issue-event__headline">{ev.headline}</div>
                      {ev.summary && <div className="issue-event__summary">{ev.summary}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detail.articles && detail.articles.length > 0 && (
              <div>
                <div className="issue-section-title">관련 뉴스</div>
                <div className="feed-grid">
                  {detail.articles.map((a, idx) => (
                    <NewsCard key={a.id || idx} item={a} type="news" onDetailClick={onArticleClick} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```
> `.bk-modal`/`.bk-modal__panel`은 기존 Modal과 동일 스타일(헤더 h3/p 포함). `onArticleClick`은 App의 `handleDetailClick`을 받아 뉴스 카드 "자세히 →" 클릭 시 웹뷰로 연결.

- [ ] **Step 2: 빌드 확인** — Run: `CI=false npm run build 2>&1 | tail -6` → `Compiled successfully.`

- [ ] **Step 3: Commit**
```bash
git add src/components/IssueDetail.jsx
git commit -m "feat(issues): IssueDetail modal (timeline + related news)"
```

---

## Task 4: App.jsx 배선 + Navigation 아이콘 + 실시간 확인

**Files:** Modify `src/App.jsx`, `src/components/layout/Navigation.jsx`

- [ ] **Step 1: `src/components/layout/Navigation.jsx` — issues 아이콘 추가**

import 줄에 `Flag` 추가:
```jsx
import { LayoutGrid, Newspaper, Landmark, ScrollText, MessageSquareQuote, User, Flag } from 'lucide-react';
```
ICONS 맵에 추가:
```jsx
const ICONS = {
  all: LayoutGrid,
  news: Newspaper,
  president: Landmark,
  parliament: ScrollText,
  statements: MessageSquareQuote,
  issues: Flag,
  mypage: User,
};
```

- [ ] **Step 2: `src/App.jsx` — import 추가** (기존 import 묶음에)
```jsx
import IssueCard from './components/IssueCard';
import IssueDetail from './components/IssueDetail';
import { useIssues } from './components/useIssues';
```

- [ ] **Step 3: `src/App.jsx` — 훅·상태 추가**

`const { statements } = useStatements();` 다음 줄에 추가:
```jsx
  const { issues, loading: issuesLoading } = useIssues();
```
`const [searchValue, setSearchValue] = useState('');` 다음 줄에 추가:
```jsx
  const [selectedIssueId, setSelectedIssueId] = useState(null);
```

- [ ] **Step 4: `src/App.jsx` — tabs 배열에 이슈 탭 추가**

`tabs` 배열에서 statements 항목 다음, mypage 스프레드 앞에 추가:
```jsx
    { id: 'statements', label: '정치인 발언', icon: '💬' },
    { id: 'issues', label: '이슈', icon: '🔥' },
    ...(user ? [{ id: 'mypage', label: '마이페이지', icon: '👤' }] : [])
```

- [ ] **Step 5: `src/App.jsx` — renderTabContent에 case 'issues' 추가**

`case 'statements':` 블록 다음(= `case 'news':` 앞)에 추가:
```jsx
      case 'issues':
        return (
          <div>
            <div className="section-title">🔥 이슈</div>
            {issuesLoading ? (
              <div className="feed-grid">{[1, 2, 3].map((n) => <SkeletonCard key={n} />)}</div>
            ) : issues.length > 0 ? (
              <div className="feed-grid">
                {issues.map((iss) => (
                  <IssueCard key={iss.id} issue={iss} onClick={setSelectedIssueId} />
                ))}
              </div>
            ) : (
              <EmptyState message="등록된 이슈가 없습니다." icon="🔥" />
            )}
          </div>
        );
```

- [ ] **Step 6: `src/App.jsx` — 메인 return에 IssueDetail 렌더 추가**

`<Modal ... />` 블록 다음(= `{loginOpen && (` 앞)에 추가:
```jsx
      {selectedIssueId && (
        <IssueDetail
          issueId={selectedIssueId}
          onClose={() => setSelectedIssueId(null)}
          onArticleClick={handleDetailClick}
        />
      )}
```

- [ ] **Step 7: 빌드 확인** — Run: `CI=false npm run build 2>&1 | tail -8`
Expected: `Compiled successfully.` (또는 무해한 warnings). `grep -n "IssueCard\|IssueDetail\|useIssues" src/App.jsx` 로 배선 확인.

- [ ] **Step 8: 실시간 확인 (개발 백엔드가 떠 있어야 함)**

개발 백엔드 확인 — Run: `curl -s localhost:8000/api/issues | python3 -c "import sys,json; d=json.load(sys.stdin); print('issues:', len(d['data']))"` → `issues: 2`. (안 떠있으면: `cd /Users/manager/side/politics_backend && source .venv/bin/activate && USE_INMEMORY=true uvicorn app.main:app --port 8000 &`)
프론트 dev 서버가 떠 있으면(`localhost:3000`) 핫리로드됨 — 브라우저에서 `이슈` 탭 클릭 → 이슈 2건(추가경정예산안/가결, 선관위 재투표/진행중) 카드 표시, 카드 클릭 → 상세 모달에 타임라인 이벤트 + (있으면)관련 뉴스. 라이트/다크·모바일 폭 정상.
(프론트 dev 서버가 없으면 `cd /Users/manager/side/politics_front && BROWSER=none npm start &` 후 localhost:3000.)

- [ ] **Step 9: Commit**
```bash
git add src/App.jsx src/components/layout/Navigation.jsx
git commit -m "feat(issues): wire 이슈 tab + detail modal into App"
```

---

## Self-Review 메모 (플랜 작성자)
- 스펙 커버리지: 데이터 레이어(T1), IssueCard+뱃지(T2), IssueDetail 타임라인+관련뉴스(T3), App/Navigation 배선+실시간 확인(T4). 전부 커버.
- 플레이스홀더 없음: 모든 코드 블록 실제 코드.
- 타입 일관성: getIssues/getIssueDetail → useIssues/useIssueDetail → IssueCard(issue,onClick)/IssueDetail(issueId,onClose,onArticleClick). statusBadgeClass 공유. NewsCard(item,type,onDetailClick) 재사용 시그니처 일치. Navigation ICONS 키=tab.id('issues').
- 백엔드 무변경, 읽기 전용. 기존 bk-card/bk-modal/feed-grid 재사용으로 라이트/다크·반응형 자동.

## 다음 단계
이슈 생성/수정 관리자 UI, 무한스크롤/필터, AI 자동분류(백엔드) → 별도.
