# 브리핑 코리아 프론트엔드 개선 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 백엔드 변경 없이 검증 가능한 프론트엔드 결함(빌드 불가, 죽은 코드, React key 버그, 미연결 Modal, alert 남발, 에러/빈 상태 부재, 디자인 시스템 분열, 가짜 필터)을 전부 수정한다.

**Architecture:** CRA(React 19) + Capacitor + MUI + Firebase 구조를 유지한다. 백엔드(레포·라이브 API 모두 사용 불가)에 의존하는 기능은 이 계획에서 제외하고 별도 단계로 보류한다. 모든 작업은 `CI=false npm run build` 통과 + 수동 스모크 검증으로 확인한다(테스트 인프라 부재로 엄격 TDD 미적용).

**Tech Stack:** React 19, react-scripts 5(CRA), @mui/material 7, axios, react-hot-toast(신규), Capacitor 7.

---

## 범위 (Scope)

### 포함 (이번 계획)
- Task 0: 빌드 복구 — 누락된 `public/` 재생성 + `.gitignore` 수정
- Task 1: 죽은 코드 제거(보수적)
- Task 2: React `key` 경고 수정
- Task 3: Modal 연결 + 필드명 정합
- Task 4: alert → react-hot-toast
- Task 5: 에러/빈/로딩 상태 UI
- Task 6: 디자인 시스템 통일(MUI → 앱 라이트 테마)
- Task 7: 가짜 필터 정리 + 이미지 폴백 정리

### 제외 (백엔드 필요 — 별도 계획으로 보류)
다음은 백엔드 레포/라이브 API가 없어 계약을 확인·검증할 수 없으므로 **이번 계획에서 다루지 않는다**:
- JWT access token 저장 및 인증 세션 영속(`useAuth.js`의 "추후 추가" 주석)
- 북마크 목록(`/api/bookmarks/list`), 관심사(`/api/user/preferences`)
- 알림 토글 영속(`/api/auth/profile`)
- 서버 사이드 검색 응답 구조 정합(`searchResults.articles` vs `.results.news` 불일치)
- 실제 서버 필터링
- Dashboard 재활성화, 댓글/즐겨찾기/알림 피처 서브트리(SummaryCard, Favorites, CommentSection, FeedbackForm, NotificationList, TagChart 등) — **삭제하지 않고 보존**한다(미래 백엔드 단계의 출발점).

---

## 파일 구조 (File Structure)

| 파일 | 책임 | 작업 |
|------|------|------|
| `public/index.html` | CRA 진입 HTML(`<div id="root">`) | 생성 |
| `public/manifest.json` | PWA 매니페스트 | 생성 |
| `.gitignore` | `public` 무시 줄 제거 | 수정 |
| `src/theme.js` | 공유 MUI 라이트 테마(앱 CSS 토큰 정합) | 생성 |
| `src/components/SkeletonCard.jsx` | 로딩 스켈레톤 카드 | 생성 |
| `src/components/EmptyState.jsx` | 빈 상태 표시 | 생성 |
| `src/App.jsx` | 루트: 죽은 코드/키/Modal/에러·빈 상태/Toaster | 수정 |
| `src/components/Modal.jsx` | 상세 모달 필드명 정합 | 수정 |
| `src/components/LoginForm.jsx` | 다크테마 제거, 공유 테마 사용 | 수정 |
| `src/components/MyPage.jsx` | console 제거, 색상 토큰화, toast | 수정 |
| `src/components/SearchFilters.jsx` | 가짜 필터 제거 | 수정 |
| `src/components/NewsCard.jsx` | 이미지 폴백 정리 | 수정 |
| `src/hooks/api.js` | 죽은 `apiService` 제거 | 수정 |
| `src/hooks/useAuth.js` | console 제거, alert → toast | 수정 |
| `src/hooks/useNews.js` | console 제거 | 수정 |
| `src/old_pages/` | 구버전 전체 | 삭제 |

---

## Task 0: 빌드 복구 — public/ 재생성 + .gitignore 수정

클론본에는 `public/` 디렉토리가 없다(`.gitignore` 116번 줄이 `public`을 무시해 커밋된 적 없음). CRA는 `public/index.html`이 없으면 빌드/실행이 불가하다. 이것을 먼저 복구해야 이후 모든 검증이 가능하다.

**Files:**
- Create: `public/index.html`
- Create: `public/manifest.json`
- Modify: `.gitignore` (116번 줄 `public` 제거)

- [ ] **Step 1: 현재 빌드가 실패하는지 확인(베이스라인)**

Run: `cd /Users/manager/side/politics_front && CI=false npm run build 2>&1 | tail -5`
Expected: FAIL — `Could not find a required file. Name: index.html`

- [ ] **Step 2: `public/index.html` 생성**

Create `public/index.html`:

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#21808d" />
    <meta name="description" content="브리핑 코리아 — 실시간 정치 뉴스 수집 및 AI 요약 서비스" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <title>브리핑 코리아</title>
  </head>
  <body>
    <noscript>이 앱을 실행하려면 자바스크립트를 활성화해야 합니다.</noscript>
    <div id="root"></div>
  </body>
</html>
```

- [ ] **Step 3: `public/manifest.json` 생성**

Create `public/manifest.json`:

```json
{
  "short_name": "브리핑 코리아",
  "name": "브리핑 코리아 — 정치 뉴스 AI 요약",
  "icons": [],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#21808d",
  "background_color": "#fcfcf9"
}
```

- [ ] **Step 4: `.gitignore`에서 `public` 무시 제거**

`.gitignore` 116번 줄 `public` 을 삭제한다(정확히 `public` 한 줄만; `public/` 하위 빌드 경로가 아닌 CRA 정적 폴더이므로 추적되어야 한다).

수정 후 확인 — Run: `grep -n "^public$" .gitignore || echo "OK: public no longer ignored"`
Expected: `OK: public no longer ignored`

- [ ] **Step 5: 빌드가 성공하는지 확인**

Run: `CI=false npm run build 2>&1 | tail -8`
Expected: PASS — `Compiled successfully.` (또는 `Compiled with warnings.`) 및 `build` 폴더 생성

- [ ] **Step 6: Commit**

```bash
git add public/index.html public/manifest.json .gitignore
git commit -m "fix: restore missing public/ so the app builds (was gitignored)"
```

---

## Task 1: 죽은 코드 제거 (보수적)

App에서 도달 불가능한 명백한 죽은 코드만 제거한다. 백엔드 의존 피처 서브트리(SummaryCard 등)는 보존한다.

**Files:**
- Delete: `src/old_pages/` (전체 디렉토리)
- Modify: `src/App.jsx` (Dashboard import/주석 제거)
- Modify: `src/hooks/api.js` (사용되지 않는 `apiService` 제거)
- Modify: `src/components/MyPage.jsx:12`, `src/hooks/useAuth.js:32`, `src/hooks/useNews.js:66` (console.log 제거)

- [ ] **Step 1: `apiService`가 어디서도 import되지 않는지 재확인**

Run: `grep -rn "apiService" src/`
Expected: 정의부(`src/hooks/api.js:25`)만 나오고 import 사용처 없음

- [ ] **Step 2: `src/old_pages/` 삭제**

Run: `git rm -r src/old_pages`

- [ ] **Step 3: `src/App.jsx`에서 Dashboard 관련 죽은 코드 제거**

`src/App.jsx:6`의 `import Dashboard from './components/Dashboard';` 줄을 삭제한다.

`src/App.jsx:31`의 주석 처리된 대시보드 탭 줄을 삭제한다:
```jsx
    // { id: 'dashboard', label: '대시보드', icon: '📊' },
```

`src/App.jsx`의 `renderTabContent` 안 주석 처리된 `case 'dashboard'` 블록(아래 전체)을 삭제한다:
```jsx
      /* case 'dashboard':
        return (
          <Dashboard 
            data={data}
            searchResults={searchResults}
            onDetailClick={handleDetailClick}
          />
        );
      */
```

> 참고: `src/components/Dashboard.jsx` 파일 자체는 보존한다(백엔드 단계에서 재활성화 후보).

- [ ] **Step 4: `src/hooks/api.js`에서 `apiService` 제거**

`src/hooks/api.js`의 `export const apiService = { ... };` 블록 전체(25~75번 줄)를 삭제한다. 파일 상단의 `api` 인스턴스 정의와 인터셉터, 그리고 맨 끝 `export default api;`는 **유지**한다.

수정 후 `src/hooks/api.js`는 axios 인스턴스 생성 + 응답 인터셉터 + `export default api;` 만 남는다.

- [ ] **Step 5: console.log 3곳 제거**

- `src/components/MyPage.jsx:12` — `console.log(user);` 줄 삭제
- `src/hooks/useAuth.js:32` — `console.log("회원가입 정보:", userInfo);` 줄 삭제
- `src/hooks/useNews.js:66` — `console.log('Recent Policies:', res.data);` 줄 삭제

- [ ] **Step 6: 빌드 확인**

Run: `CI=false npm run build 2>&1 | tail -8`
Expected: `Compiled successfully.` 또는 warnings (no-undef 같은 에러 없음)

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: remove dead code (old_pages, unused apiService, commented Dashboard, console.logs)"
```

---

## Task 2: React `key` 경고 수정

`App.jsx`의 `renderTabContent`에서 president/parliament/statements/news 의 `NewsCard` map에 `key`가 없다(검색 결과 map만 key 있음).

**Files:**
- Modify: `src/App.jsx` (renderTabContent의 4개 map)

- [ ] **Step 1: president map에 key 추가**

`src/App.jsx` `case 'president'`의 map을 수정한다:
```jsx
              {(searchResults?.results?.policies || president)?.map((president, idx) => (
                <NewsCard 
                  key={president.id || idx}
                  item={president}
                  type="policy"
                  onDetailClick={handleDetailClick}
                />
              ))}
```

- [ ] **Step 2: parliament map에 key 추가**

`case 'parliament'`의 map을 수정한다:
```jsx
              {(searchResults?.results?.activities || policies)?.map((policy, idx) => (
                <NewsCard 
                  key={policy.id || idx}
                  item={policy}
                  type="parliament"
                  onDetailClick={handleDetailClick}
                />
              ))}
```

- [ ] **Step 3: statements map에 key 추가**

`case 'statements'`의 map을 수정한다:
```jsx
              {(searchResults?.results?.statements || statements)?.map((statement, idx) => (
                <NewsCard
                  key={statement.id || idx}
                  item={statement}
                  type="statement"
                  onDetailClick={handleDetailClick}
                />
              ))}
```

- [ ] **Step 4: news map에 key 추가**

`case 'news'`의 map을 수정한다:
```jsx
                newsList.map((news, idx) => (
                  <NewsCard 
                    key={news.id || idx}
                    item={news}
                    type="news"
                    onDetailClick={handleDetailClick}
                  />
                ))
```

- [ ] **Step 5: 빌드 + 콘솔 경고 확인**

Run: `CI=false npm run build 2>&1 | tail -8`
Expected: `Compiled successfully.`
수동: `npm start` 후 각 탭 전환 시 브라우저 콘솔에 `Each child in a list should have a unique "key"` 경고가 없어야 한다.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx
git commit -m "fix: add missing React keys in tab content lists"
```

---

## Task 3: Modal 연결 + 필드명 정합

`App.jsx`는 `Modal`을 import하고 `handleDetailClick`에서 뉴스가 아닌 항목(policy/parliament/statement)에 `setModal({isOpen:true,...})`를 호출하지만 **`<Modal>`을 렌더하지 않는다** → "자세히 보기" 클릭이 아무 동작도 하지 않는다. 또한 `Modal.jsx`의 필드명이 실제 데이터(NewsCard가 쓰는 필드)와 어긋난다.

**Files:**
- Modify: `src/App.jsx` (return JSX에 `<Modal>` 추가)
- Modify: `src/components/Modal.jsx` (필드명 정합)

- [ ] **Step 1: `App.jsx` return에 `<Modal>` 렌더 추가**

`src/App.jsx`의 return 안, `{loginOpen && (...)}` 블록 바로 위(또는 아래)에 다음을 추가한다:
```jsx
      <Modal
        isOpen={modal.isOpen}
        type={modal.type}
        content={modal.content}
        onClose={() => setModal({ isOpen: false, content: null, type: null })}
      />
```

- [ ] **Step 2: `Modal.jsx` statements 케이스 필드명 정합**

`src/components/Modal.jsx`의 `case 'statements'`를 NewsCard와 동일한 필드(`context`=발언 인용, `speak_reason`=맥락)로 수정한다:
```jsx
      case 'statements':
        return (
          <div>
            <h3>{content.speaker} ({content.party})</h3>
            <p><strong>날짜:</strong> {formatDate(content.date)}</p>
            <p><strong>유형:</strong> {content.type}</p>
            <div className="quote">
              "{content.context}"
            </div>
            <p><strong>발언 맥락:</strong> {content.speak_reason}</p>
          </div>
        );
```

- [ ] **Step 3: `Modal.jsx` president 케이스 필드명 정합**

`case 'president'`를 NewsCard와 동일하게(`context`, `promise_type`) 수정한다:
```jsx
      case 'president':
        return (
          <div>
            <h3>{content.title}</h3>
            <p><strong>날짜:</strong> {formatDate(content.date)}</p>
            <p>{content.context}</p>
            {content.promise_type && (
              <div>
                <strong>세부사항:</strong>
                <p>{content.promise_type}</p>
              </div>
            )}
          </div>
        );
```

- [ ] **Step 4: `Modal.jsx` parliament 케이스 필드명 정합**

`case 'parliament'`의 `content.description`을 `content.context`로 수정한다:
```jsx
            {content.context && (
              <p><strong>내용:</strong> {content.context}</p>
            )}
```

- [ ] **Step 5: 빌드 + 수동 확인**

Run: `CI=false npm run build 2>&1 | tail -8`
Expected: `Compiled successfully.`
수동: `npm start` 후 대통령/정책/발언 탭에서 "자세히 보기 →" 클릭 시 모달이 열리고, X 또는 배경 클릭으로 닫힌다(데이터가 비어 있어도 모달 골격은 표시).

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/components/Modal.jsx
git commit -m "fix: render detail Modal for non-news items and align its field names"
```

---

## Task 4: alert → react-hot-toast

라이브 코드의 `alert()`를 toast로 교체한다. 죽은 파일(SummaryCard, useComments, useFeedback, old_pages)의 alert는 범위 밖이므로 건드리지 않는다.

**Files:**
- Modify: `package.json` (react-hot-toast 추가 — npm install)
- Modify: `src/App.jsx` (Toaster 마운트 + handleExport alert 2곳)
- Modify: `src/hooks/useAuth.js` (alert 4곳)
- Modify: `src/components/MyPage.jsx` (alert 6곳)
- Modify: `src/components/LoginForm.jsx` (alert 1곳)

- [ ] **Step 1: react-hot-toast 설치**

Run: `npm install react-hot-toast --no-audit --no-fund`
Expected: `added 1 package`, `package.json`에 `"react-hot-toast"` 추가

- [ ] **Step 2: `App.jsx`에 Toaster 마운트**

`src/App.jsx` 상단 import에 추가:
```jsx
import toast, { Toaster } from 'react-hot-toast';
```

`WrappedApp`을 수정해 `<Toaster>`를 마운트한다:
```jsx
export default function WrappedApp() {
  return (
    <AppProvider>
      <App />
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </AppProvider>
  );
}
```

- [ ] **Step 3: `App.jsx` handleExport alert 교체**

`handleExport`의 두 `alert(...)`를 교체한다:
```jsx
  const handleExport = useCallback(async () => {
    try {
      await exportData();
      toast.success('데이터가 성공적으로 내보내기되었습니다!');
    } catch (error) {
      toast.error('내보내기 중 오류가 발생했습니다: ' + error.message);
    }
  }, [exportData]);
```

- [ ] **Step 4: `useAuth.js` alert 교체**

`src/hooks/useAuth.js` 상단에 `import toast from 'react-hot-toast';` 추가. 그리고 alert를 교체한다:
- `if (!email || !password) return alert("EMAIL와 PW를 입력하세요.");` → `if (!email || !password) return toast.error("이메일과 비밀번호를 입력하세요.");`
- 로그인 catch의 `alert(err.message || "로그인 실패");` → `toast.error(err.message || "로그인 실패");`
- register 검증 `return alert("ID와 PW를 입력하세요.");` → `return toast.error("모든 필수 정보를 입력하세요.");`
- register 성공 `alert("회원가입 완료. 로그인 해주세요.");` → `toast.success("회원가입 완료. 로그인 해주세요.");`
- register catch `alert(err.message || "회원가입 실패");` → `toast.error(err.message || "회원가입 실패");`

- [ ] **Step 5: `MyPage.jsx` alert 교체**

`src/components/MyPage.jsx` 상단에 `import toast from 'react-hot-toast';` 추가. alert 6곳 교체:
- 알림 변경 실패 `alert("알림 설정 변경 실패: " + err.message);` → `toast.error("알림 설정 변경 실패: " + err.message);`
- 비번 불일치 `return alert("비밀번호가 일치하지 않습니다.");` → `return toast.error("비밀번호가 일치하지 않습니다.");`
- 비번 변경 성공 `alert("비밀번호가 변경되었습니다.");` → `toast.success("비밀번호가 변경되었습니다.");`
- 비번 변경 실패 `alert("비밀번호 변경 실패: " + err.message);` → `toast.error("비밀번호 변경 실패: " + err.message);`
- 탈퇴 완료 `alert("회원 탈퇴가 완료되었습니다.");` → `toast.success("회원 탈퇴가 완료되었습니다.");`
- 탈퇴 실패 `alert("회원 탈퇴 실패: " + err.message);` → `toast.error("회원 탈퇴 실패: " + err.message);`

> `window.confirm("정말로 회원 탈퇴하시겠습니까?...")`는 파괴적 작업 가드이므로 그대로 유지한다.

- [ ] **Step 6: `LoginForm.jsx` alert 교체**

`src/components/LoginForm.jsx` 상단에 `import toast from 'react-hot-toast';` 추가. 휴대폰 검증 교체:
- `alert("휴대폰 번호는 필수입니다.");` → `toast.error("휴대폰 번호는 필수입니다.");`

- [ ] **Step 7: 빌드 + 수동 확인**

Run: `CI=false npm run build 2>&1 | tail -8`
Expected: `Compiled successfully.`
수동: `npm start` 후 빈 값으로 로그인 시도 → 상단 toast 표시(alert 팝업 아님).

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json src/App.jsx src/hooks/useAuth.js src/components/MyPage.jsx src/components/LoginForm.jsx
git commit -m "feat: replace alert() with react-hot-toast in live components"
```

---

## Task 5: 에러 / 빈 / 로딩 상태 UI

현재 에러 UI는 주석 처리돼 있고, 리스트 빈 상태는 뉴스 탭에만 있으며, 로딩은 전체 화면 텍스트뿐이다.

**Files:**
- Create: `src/components/EmptyState.jsx`
- Create: `src/components/SkeletonCard.jsx`
- Modify: `src/App.jsx` (에러 UI 복원 + 빈/로딩 상태 적용)

- [ ] **Step 1: `EmptyState.jsx` 생성**

Create `src/components/EmptyState.jsx`:
```jsx
import React from 'react';

const EmptyState = ({ message = '표시할 내용이 없습니다.', icon = '📭' }) => (
  <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '40px 16px' }}>
    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{icon}</div>
    <p>{message}</p>
  </div>
);

export default EmptyState;
```

- [ ] **Step 2: `SkeletonCard.jsx` 생성**

Create `src/components/SkeletonCard.jsx`:
```jsx
import React from 'react';

const shimmer = {
  background: 'linear-gradient(90deg, rgba(94,82,64,0.08) 25%, rgba(94,82,64,0.16) 37%, rgba(94,82,64,0.08) 63%)',
  backgroundSize: '400% 100%',
  animation: 'bk-shimmer 1.4s ease infinite',
  borderRadius: '6px',
};

const SkeletonCard = () => (
  <div className="card" style={{ padding: '16px' }}>
    <div style={{ ...shimmer, height: '20px', width: '70%', marginBottom: '12px' }} />
    <div style={{ ...shimmer, height: '14px', width: '100%', marginBottom: '8px' }} />
    <div style={{ ...shimmer, height: '14px', width: '90%' }} />
    <style>{`@keyframes bk-shimmer { 0% { background-position: 100% 0 } 100% { background-position: -100% 0 } }`}</style>
  </div>
);

export default SkeletonCard;
```

- [ ] **Step 3: `App.jsx`에 import 추가**

`src/App.jsx` 상단 import에 추가:
```jsx
import EmptyState from './components/EmptyState';
import SkeletonCard from './components/SkeletonCard';
```

- [ ] **Step 3.5: `renderAuthButton` 정의를 loading 체크 위로 이동 (TDZ 방지)**

현재 `renderAuthButton`은 `if (loading)` 블록보다 **아래**(약 275번 줄)에 `const`로 정의돼 있다. 다음 단계에서 loading/error 블록 안에서 `renderAuthButton()`을 호출하므로, 초기화 전 참조(TDZ) 에러를 막기 위해 `const renderAuthButton = () => { ... };` 정의 블록 전체를 잘라 `if (loading) {` 블록 **직전**으로 이동한다(즉 `renderTabContent` 정의 다음, loading 체크 앞).

이동 후 확인 — `renderAuthButton` 정의가 `if (loading)`보다 위에 한 번만 존재해야 한다.

- [ ] **Step 4: 전체 화면 로딩을 스켈레톤 리스트로 교체**

`src/App.jsx`의 `if (loading) { return (... '데이터를 불러오는 중...' ...) }` 블록을 다음으로 교체한다:
```jsx
  if (loading) {
    return (
      <div className="App">
        <Header>{renderAuthButton()}</Header>
        <main className="container">
          <div className="content-cards" style={{ marginTop: '24px' }}>
            {[1, 2, 3, 4].map((n) => <SkeletonCard key={n} />)}
          </div>
        </main>
      </div>
    );
  }
```

- [ ] **Step 5: 에러 상태 UI 복원**

`src/App.jsx`의 주석 처리된 `if (error)` 블록을 활성화하고 toast 대신 인라인 화면으로 표시한다(loading 블록 다음 위치):
```jsx
  if (error) {
    return (
      <div className="App">
        <Header>{renderAuthButton()}</Header>
        <main className="container">
          <EmptyState icon="⚠️" message={`데이터를 불러오지 못했습니다. (${error})`} />
          <div style={{ textAlign: 'center' }}>
            <button className="btn btn--primary" onClick={refreshData}>다시 시도</button>
          </div>
        </main>
      </div>
    );
  }
```

- [ ] **Step 6: president/parliament/statements 빈 상태 추가**

`renderTabContent`의 president/parliament/statements 각 케이스에서 `content-cards` 안 map을 빈 배열 가드로 감싼다. 예시(president):
```jsx
            <div className="content-cards">
              {((searchResults?.results?.policies || president) || []).length > 0 ? (
                (searchResults?.results?.policies || president).map((president, idx) => (
                  <NewsCard key={president.id || idx} item={president} type="policy" onDetailClick={handleDetailClick} />
                ))
              ) : (
                <EmptyState message="대통령 정책 정보가 없습니다." />
              )}
            </div>
```
parliament(`activities || policies`, "정책 활동이 없습니다."), statements(`statements`, "정치인 발언이 없습니다.")도 동일 패턴으로 적용한다.

- [ ] **Step 7: 뉴스 탭 빈 상태를 EmptyState로 교체**

`case 'news'`의 `<p style={{ textAlign: "center", color: "#888" }}>뉴스가 없습니다.</p>`를 `<EmptyState message="뉴스가 없습니다." icon="📰" />`로 교체한다.

- [ ] **Step 8: 빌드 + 수동 확인**

Run: `CI=false npm run build 2>&1 | tail -8`
Expected: `Compiled successfully.`
수동: 백엔드가 죽어 있으므로 데이터 로드가 실패/빈 상태가 되며, 전체 화면 텍스트 대신 스켈레톤 → (에러 시) 재시도 버튼/빈 상태가 보인다.

- [ ] **Step 9: Commit**

```bash
git add src/components/EmptyState.jsx src/components/SkeletonCard.jsx src/App.jsx
git commit -m "feat: add error, empty, and skeleton loading states"
```

---

## Task 6: 디자인 시스템 통일 (MUI → 앱 라이트 테마)

LoginForm/MyPage만 MUI **다크 테마**를 강제해 나머지 라이트 톤과 충돌한다. 공유 MUI 라이트 테마를 만들어 앱 CSS 토큰(primary `#21808d`, 배경 `#fcfcf9`)과 정합시킨다. (전면 MUI 마이그레이션은 하지 않는다 — 정렬만.)

**Files:**
- Create: `src/theme.js`
- Modify: `src/App.jsx` (루트 ThemeProvider)
- Modify: `src/components/LoginForm.jsx` (로컬 darkTheme 제거)
- Modify: `src/components/MyPage.jsx` (하드코딩 색상 → 테마)

- [ ] **Step 1: `src/theme.js` 생성**

Create `src/theme.js`:
```jsx
import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#21808d' },
    background: { default: '#fcfcf9', paper: '#fffffd' },
    text: { primary: '#13343b', secondary: '#626c71' },
  },
  typography: {
    fontFamily: `'Noto Sans KR', sans-serif`,
  },
  shape: { borderRadius: 8 },
});

export default theme;
```

- [ ] **Step 2: `App.jsx` 루트에 ThemeProvider 적용**

`src/App.jsx` 상단 import에 추가:
```jsx
import { ThemeProvider } from '@mui/material';
import theme from './theme';
```
`WrappedApp`을 감싼다:
```jsx
export default function WrappedApp() {
  return (
    <ThemeProvider theme={theme}>
      <AppProvider>
        <App />
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      </AppProvider>
    </ThemeProvider>
  );
}
```

- [ ] **Step 3: `LoginForm.jsx`에서 로컬 darkTheme 제거**

`src/components/LoginForm.jsx`에서:
- `createTheme`, `ThemeProvider` import 제거(`@mui/material` import 목록에서 삭제)
- 파일 상단의 `const darkTheme = createTheme({ ... });` 블록 전체 삭제
- return의 최상위 `<ThemeProvider theme={darkTheme}>` 래퍼 제거(이제 루트 테마 상속). 즉 `<Box ...>`가 최상위가 된다.
- 오버레이 배경(`bgcolor: 'rgba(0,0,0,0.6)'`)은 모달 딤드 처리이므로 유지하되, 카드(`<Paper>`)는 테마 paper(라이트)를 쓰도록 `bgcolor="background.paper"` 유지 → 자동으로 라이트가 된다.
- X 아이콘 버튼 색상 `color: "white"` → `color: "text.secondary"` 로 변경(라이트 배경 대비).

- [ ] **Step 4: `MyPage.jsx` 하드코딩 색상 토큰화**

`src/components/MyPage.jsx`의 `<Avatar sx={{ width: 64, height: 64, bgcolor: "#21808d", mr: 2 }}>`를 `bgcolor: "primary.main"`으로 변경한다:
```jsx
          <Avatar sx={{ width: 64, height: 64, bgcolor: "primary.main", mr: 2 }}>
```

- [ ] **Step 5: 빌드 + 수동 확인**

Run: `CI=false npm run build 2>&1 | tail -8`
Expected: `Compiled successfully.`
수동: `npm start` 후 로그인 모달이 더 이상 검은 화면이 아니라 앱과 같은 라이트 톤 카드로 뜬다. 마이페이지 아바타가 teal 유지.

- [ ] **Step 6: Commit**

```bash
git add src/theme.js src/App.jsx src/components/LoginForm.jsx src/components/MyPage.jsx
git commit -m "refactor: unify MUI surfaces to a shared light theme matching app tokens"
```

---

## Task 7: 가짜 필터 제거 + 이미지 폴백 정리

`SearchFilters`의 날짜/주제/정당 드롭다운은 하드코딩 값이며 `onFilter={() => {}}`로 아무 동작도 안 한다(서버 필터링은 백엔드 단계로 보류). 사용자를 오도하므로 비기능 필터를 제거하고 검색창만 남긴다.

**Files:**
- Modify: `src/components/SearchFilters.jsx` (필터 드롭다운 제거)
- Modify: `src/App.jsx` (사용되지 않는 `onFilter` prop 정리)
- Modify: `src/components/NewsCard.jsx` (이미지 폴백 정리)

- [ ] **Step 1: `SearchFilters.jsx`를 검색창만 남기도록 단순화**

`src/components/SearchFilters.jsx` 전체를 다음으로 교체한다:
```jsx
import React from 'react';

const SearchFilters = React.forwardRef(({ searchValue, onSearchValueChange, onSearch, searchLoading }, ref) => {
  const handleSearch = () => {
    onSearch(searchValue, {});
  };

  return (
    <div className="search-container">
      <div className="search-box">
        <input
          ref={ref}
          type="text"
          className="form-control"
          placeholder="정책, 법안, 정치인, 뉴스 검색..."
          value={searchValue}
          onChange={(e) => onSearchValueChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          className="btn btn--primary"
          onClick={handleSearch}
          disabled={searchLoading}
        >
          {searchLoading ? '검색 중...' : '🔍 검색'}
        </button>
      </div>
    </div>
  );
});

export default SearchFilters;
```
> 변경점: 비기능 date/topic/party `<select>` 및 `clearFilters` 제거, `onKeyPress`(deprecated) → `onKeyDown`, `ref`를 input에 실제 연결.

- [ ] **Step 2: `App.jsx`에서 `onFilter` prop 제거**

`src/App.jsx`의 `<SearchFilters ... onFilter={() => {}} ... />`에서 `onFilter={() => {}}` 줄을 삭제한다(이제 사용되지 않음).

- [ ] **Step 3: `NewsCard.jsx` 이미지 폴백 정리**

`src/components/NewsCard.jsx`의 `isIconLikeImage`를 더 안전하게 정리하고, 폴백 이미지에 일관된 스타일을 적용한다. `isIconLikeImage` 함수를 다음으로 교체:
```jsx
  function isIconLikeImage(url) {
    if (!url || typeof url !== 'string') return true;
    return /btn_textview\.gif$|\/icon|btn.*\.gif$/.test(url);
  }
```
그리고 `renderNewsUpdate`의 `<img ... onError={...} />`에서 주석 처리된 style 블록을 제거하고 인라인 style을 명시한다:
```jsx
          <img
            src={news.image_url && !isIconLikeImage(news.image_url) ? news.image_url : FALLBACK_IMAGE}
            alt={news.title}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = FALLBACK_IMAGE;
              e.target.style.objectFit = 'contain';
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#ededed' }}
          />
```

- [ ] **Step 4: 빌드 + 수동 확인**

Run: `CI=false npm run build 2>&1 | tail -8`
Expected: `Compiled successfully.`
수동: `npm start` 후 검색 영역에 가짜 필터가 사라지고 검색창만 보인다. 검색 입력에 ref 포커스가 정상 동작.

- [ ] **Step 5: Commit**

```bash
git add src/components/SearchFilters.jsx src/App.jsx src/components/NewsCard.jsx
git commit -m "fix: remove non-functional filters and tidy image fallback"
```

---

## 최종 검증 (전체)

- [ ] **Step 1: 클린 빌드**

Run: `CI=false npm run build 2>&1 | tail -8`
Expected: `Compiled successfully.` (또는 무해한 warnings만)

- [ ] **Step 2: 개발 서버 스모크**

Run: `npm start` (별도 터미널)
확인 목록:
- 앱이 로드되고 헤더/탭/검색창/푸터가 라이트 톤으로 일관됨
- 탭 전환 시 콘솔에 key 경고 없음
- 로그인 모달이 라이트 카드로 표시(다크 아님)
- 데이터 로드 실패 시 스켈레톤 → 에러/빈 상태 + 재시도 버튼
- 잘못된 입력 시 alert 팝업이 아닌 상단 toast

- [ ] **Step 3: git 로그 확인**

Run: `git log --oneline -9`
Expected: Task 0~7의 커밋이 순서대로 존재

---

## 비고: 다음 단계(백엔드 확보 후 별도 계획)
백엔드 레포 접근 또는 Render 재가동 후 다음을 별도 spec→plan으로 진행:
1. 로그인 응답의 JWT access token 저장 + axios Authorization 헤더 인터셉터 + 세션 영속/만료 처리
2. 북마크(`/api/bookmarks/list`)·관심사(`/api/user/preferences`) 연결 및 MyPage 주석 UI 복원
3. 알림 토글 영속(`/api/auth/profile`) + FCM
4. 검색 응답 구조 정합(`articles`/`results.news` 통일) 및 실제 서버 필터링
5. Dashboard 재활성화, 댓글/즐겨찾기/알림 피처 서브트리 재통합
