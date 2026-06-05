# 브리핑 코리아 UI 전면 리디자인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 브리핑 코리아 프론트엔드를 "Modern Civic(B)" 디자인 + Pretendard + 반응형 적응 내비게이션(모바일 하단 탭바 / 데스크톱 상단 탭) + 라이트·다크 모드로 전면 리디자인한다.

**Architecture:** 단일 디자인 토큰 세트(CSS 변수, `[data-theme]`)를 진실의 원천으로 두고, `ThemeContext`가 모드(light/dark/system)를 관리·영속한다. MUI 테마도 같은 팔레트에서 파생해 동기화한다. 레이아웃은 `AppShell` 하나가 헤더·적응 내비·콘텐츠·푸터를 조합하고, 내비는 CSS 브레이크포인트(768px)로 분기한다. 데이터 계층·죽은 서브트리는 변경하지 않는다.

**Tech Stack:** React 19, react-scripts(CRA), @mui/material 7, react-hot-toast, lucide-react, pretendard(신규), CSS custom properties.

**검증 방식:** 엄격 TDD 미적용(테스트 인프라 부재). 각 태스크는 `CI=false npm run build` 통과 + 수동 스모크(라이트/다크 × 모바일/데스크톱 폭)로 검증하고 개별 커밋한다.

**브랜치:** 작업 전 `git checkout -b redesign/modern-civic` (main 직접 작업 금지).

---

## 참고: 디자인 토큰 (모든 태스크 공통)

| 토큰 | 라이트 | 다크 |
|------|--------|------|
| `--bg` | `#f4f6fb` | `#0f1218` |
| `--surface` | `#ffffff` | `#181c24` |
| `--surface-2` | `#ffffff` | `#161a22` |
| `--text` | `#1a2233` | `#eef1f7` |
| `--text-secondary` | `#5b6580` | `#9aa3b5` |
| `--primary` | `#3354ff` | `#5b78ff` |
| `--primary-text` | `#3354ff` | `#7e97ff` |
| `--on-primary` | `#ffffff` | `#ffffff` |
| `--border` | `#e8ecf4` | `#232834` |
| `--card-border` | `#eef1f7` | `#242a36` |
| `--badge-bg` | `#eef1fb` | `#222a44` |
| `--badge-text` | `#3354ff` | `#9fb4ff` |
| `--accent-red` | `#e11d6b` | `#ff7da6` |
| `--accent-red-bg` | `#fdeaf0` | `#3a1f2c` |
| `--success` | `#1c9c6b` | `#39c08a` |
| `--warning` | `#c07f1a` | `#e6a23c` |
| `--shadow-card` | `0 6px 18px rgba(26,34,51,.06)` | `0 6px 18px rgba(0,0,0,.30)` |

라운드: `--radius-sm:8px --radius-md:12px --radius-lg:16px --radius-pill:999px`. 브레이크포인트 768px.

---

# Phase 0 — 파운데이션 (토큰 · 폰트 · 테마 컨텍스트)

## Task 1: Pretendard 설치 + 디자인 토큰 CSS

**Files:**
- Modify: `package.json` (pretendard 추가)
- Create: `src/theme/tokens.css`
- Modify: `src/index.js` (import)

- [ ] **Step 1: Pretendard 설치**

Run: `npm install pretendard --no-audit --no-fund`
Expected: package.json dependencies에 `pretendard` 추가.

- [ ] **Step 2: `src/theme/tokens.css` 생성**

```css
@import "pretendard/dist/web/static/pretendard.css";

:root {
  --font-base: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  --bg: #f4f6fb;
  --surface: #ffffff;
  --surface-2: #ffffff;
  --text: #1a2233;
  --text-secondary: #5b6580;
  --primary: #3354ff;
  --primary-text: #3354ff;
  --on-primary: #ffffff;
  --border: #e8ecf4;
  --card-border: #eef1f7;
  --badge-bg: #eef1fb;
  --badge-text: #3354ff;
  --accent-red: #e11d6b;
  --accent-red-bg: #fdeaf0;
  --success: #1c9c6b;
  --warning: #c07f1a;
  --shadow-card: 0 6px 18px rgba(26,34,51,.06);

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-pill: 999px;
}

[data-theme="dark"] {
  --bg: #0f1218;
  --surface: #181c24;
  --surface-2: #161a22;
  --text: #eef1f7;
  --text-secondary: #9aa3b5;
  --primary: #5b78ff;
  --primary-text: #7e97ff;
  --on-primary: #ffffff;
  --border: #232834;
  --card-border: #242a36;
  --badge-bg: #222a44;
  --badge-text: #9fb4ff;
  --accent-red: #ff7da6;
  --accent-red-bg: #3a1f2c;
  --success: #39c08a;
  --warning: #e6a23c;
  --shadow-card: 0 6px 18px rgba(0,0,0,.30);
}

/* data-theme 미지정 시 OS 설정 추종 */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0f1218; --surface: #181c24; --surface-2: #161a22;
    --text: #eef1f7; --text-secondary: #9aa3b5;
    --primary: #5b78ff; --primary-text: #7e97ff;
    --border: #232834; --card-border: #242a36;
    --badge-bg: #222a44; --badge-text: #9fb4ff;
    --accent-red: #ff7da6; --accent-red-bg: #3a1f2c;
    --success: #39c08a; --warning: #e6a23c;
    --shadow-card: 0 6px 18px rgba(0,0,0,.30);
  }
}

html, body { background: var(--bg); color: var(--text); }
body { font-family: var(--font-base); -webkit-font-smoothing: antialiased; }
```

- [ ] **Step 3: `src/index.js`에서 토큰 CSS를 가장 먼저 import**

`src/index.js` 상단(다른 CSS import보다 위)에 추가:
```jsx
import './theme/tokens.css';
```

- [ ] **Step 4: 빌드 확인**

Run: `CI=false npm run build 2>&1 | tail -6`
Expected: `Compiled successfully.` (pretendard import 경로 에러 없어야 함)

- [ ] **Step 5: Commit**
```bash
git add package.json package-lock.json src/theme/tokens.css src/index.js
git commit -m "feat(theme): add Pretendard + light/dark design tokens"
```

---

## Task 2: ThemeContext (모드 상태·영속·data-theme·system 추종)

**Files:**
- Create: `src/theme/ThemeContext.jsx`

- [ ] **Step 1: `src/theme/ThemeContext.jsx` 생성**

```jsx
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

const ThemeModeContext = createContext(null);
const STORAGE_KEY = 'bk-theme'; // 'light' | 'dark' | 'system'

function getSystemDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem(STORAGE_KEY) || 'system');

  const resolved = useMemo(
    () => (mode === 'system' ? (getSystemDark() ? 'dark' : 'light') : mode),
    [mode]
  );

  // data-theme 적용 (system이면 속성 제거 → CSS의 prefers-color-scheme가 처리)
  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', mode);
    }
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  // system일 때 OS 변경 구독 → 리렌더 유발
  const [, force] = useState(0);
  useEffect(() => {
    if (mode !== 'system' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => force((n) => n + 1);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  const toggle = useCallback(() => {
    setMode((m) => {
      const eff = m === 'system' ? (getSystemDark() ? 'dark' : 'light') : m;
      return eff === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const value = useMemo(() => ({ mode, resolved, setMode, toggle }), [mode, resolved, toggle]);
  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
}
```

- [ ] **Step 2: 빌드 확인** — Run: `CI=false npm run build 2>&1 | tail -6` → Expected: `Compiled successfully.`

- [ ] **Step 3: Commit**
```bash
git add src/theme/ThemeContext.jsx
git commit -m "feat(theme): add ThemeContext (light/dark/system, persisted)"
```

---

## Task 3: MUI 테마 동기화 + 루트 Provider 배선

**Files:**
- Create: `src/theme/muiTheme.js`
- Delete: `src/theme.js` (기존, Task에서 대체)
- Modify: `src/App.jsx` (WrappedApp: ThemeModeProvider + MUI ThemeProvider를 resolved 모드로)

배경: 현재 `src/App.jsx`의 `WrappedApp`은 `import { ThemeProvider } from '@mui/material'; import theme from './theme';` 로 단일 라이트 MUI 테마를 감싼다. 이를 모드 반응형으로 교체한다.

- [ ] **Step 1: `src/theme/muiTheme.js` 생성**

```jsx
import { createTheme } from '@mui/material';

const palettes = {
  light: {
    primary: '#3354ff', bgDefault: '#f4f6fb', bgPaper: '#ffffff',
    textPrimary: '#1a2233', textSecondary: '#5b6580',
  },
  dark: {
    primary: '#5b78ff', bgDefault: '#0f1218', bgPaper: '#181c24',
    textPrimary: '#eef1f7', textSecondary: '#9aa3b5',
  },
};

export function makeTheme(mode) {
  const p = palettes[mode] || palettes.light;
  return createTheme({
    palette: {
      mode,
      primary: { main: p.primary },
      background: { default: p.bgDefault, paper: p.bgPaper },
      text: { primary: p.textPrimary, secondary: p.textSecondary },
    },
    typography: { fontFamily: `'Pretendard', -apple-system, sans-serif` },
    shape: { borderRadius: 12 },
  });
}
```

- [ ] **Step 2: 기존 `src/theme.js` 삭제**

Run: `git rm src/theme.js`

- [ ] **Step 3: `src/App.jsx` WrappedApp 교체**

기존 import 라인 `import { ThemeProvider } from '@mui/material';` 와 `import theme from './theme';` 를 다음으로 교체:
```jsx
import { ThemeProvider } from '@mui/material';
import { makeTheme } from './theme/muiTheme';
import { ThemeModeProvider, useThemeMode } from './theme/ThemeContext';
```

`WrappedApp`을 다음으로 교체(내부에 resolved 모드를 읽는 브리지 컴포넌트 추가):
```jsx
function ThemedRoot() {
  const { resolved } = useThemeMode();
  const muiTheme = React.useMemo(() => makeTheme(resolved), [resolved]);
  return (
    <ThemeProvider theme={muiTheme}>
      <AppProvider>
        <App />
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      </AppProvider>
    </ThemeProvider>
  );
}

export default function WrappedApp() {
  return (
    <ThemeModeProvider>
      <ThemedRoot />
    </ThemeModeProvider>
  );
}
```
(`React`는 이미 App.jsx 상단에서 import됨. `AppProvider`, `App`, `Toaster`는 기존 그대로 사용.)

- [ ] **Step 4: 빌드 확인** — Run: `CI=false npm run build 2>&1 | tail -6` → Expected: `Compiled successfully.` (`./theme` 참조 잔존 에러 없어야 함; `grep -rn "from './theme'" src/` → 결과 없어야 함)

- [ ] **Step 5: Commit**
```bash
git add src/theme/muiTheme.js src/App.jsx
git commit -m "feat(theme): mode-reactive MUI theme synced to design tokens"
```

---

## Task 4: ThemeToggle 컴포넌트

**Files:**
- Create: `src/components/ThemeToggle.jsx`

- [ ] **Step 1: `src/components/ThemeToggle.jsx` 생성**

```jsx
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeMode } from '../theme/ThemeContext';

export default function ThemeToggle() {
  const { resolved, toggle } = useThemeMode();
  const isDark = resolved === 'dark';
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      title={isDark ? '라이트 모드' : '다크 모드'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
```

- [ ] **Step 2: 토글 스타일을 `src/theme/tokens.css` 끝에 추가**

```css
.theme-toggle {
  width: 36px; height: 36px; border-radius: var(--radius-sm);
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--badge-bg); color: var(--text-secondary);
  border: 1px solid var(--card-border); cursor: pointer;
}
.theme-toggle:hover { color: var(--primary-text); }
```

- [ ] **Step 3: 빌드 확인** — Run: `CI=false npm run build 2>&1 | tail -6` → Expected: `Compiled successfully.`

- [ ] **Step 4: Commit**
```bash
git add src/components/ThemeToggle.jsx src/theme/tokens.css
git commit -m "feat(theme): add ThemeToggle button (lucide icons)"
```

---

# Phase 1 — 레이아웃 & 적응 내비게이션

## Task 5: 적응 내비게이션 (상단 탭 + 하단 탭바)

**Files:**
- Create: `src/components/layout/Navigation.jsx`
- Modify: `src/theme/tokens.css` (내비 스타일 추가)

배경: 탭 목록은 App.jsx에서 내려준다(전체/뉴스/대통령/정책/발언 + 로그인 시 마이페이지). 두 내비를 모두 렌더하고 CSS로 폭에 따라 토글한다.

- [ ] **Step 1: `src/components/layout/Navigation.jsx` 생성**

```jsx
import React from 'react';
import { LayoutGrid, Newspaper, Landmark, ScrollText, MessageSquareQuote, User } from 'lucide-react';

const ICONS = {
  all: LayoutGrid,
  news: Newspaper,
  president: Landmark,
  parliament: ScrollText,
  statements: MessageSquareQuote,
  mypage: User,
};

export default function Navigation({ tabs, activeTab, onTabChange }) {
  const renderItem = (tab, variant) => {
    const Icon = ICONS[tab.id] || LayoutGrid;
    const active = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        className={`${variant}-item ${active ? 'active' : ''}`}
        onClick={() => onTabChange(tab.id)}
        aria-current={active ? 'page' : undefined}
      >
        <Icon size={variant === 'bottomnav' ? 20 : 16} />
        <span>{tab.label}</span>
      </button>
    );
  };

  return (
    <>
      <nav className="topnav">{tabs.map((t) => renderItem(t, 'topnav'))}</nav>
      <nav className="bottomnav">{tabs.map((t) => renderItem(t, 'bottomnav'))}</nav>
    </>
  );
}
```

- [ ] **Step 2: 내비 스타일을 `src/theme/tokens.css` 끝에 추가**

```css
/* ===== 적응 내비게이션 ===== */
.topnav { display: none; gap: 6px; }
.topnav-item {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 600; padding: 8px 14px;
  border-radius: var(--radius-pill); border: 1px solid var(--border);
  background: var(--surface); color: var(--text-secondary); cursor: pointer;
}
.topnav-item.active {
  background: var(--primary); color: var(--on-primary); border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(51,84,255,.30);
}

.bottomnav {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
  display: flex; justify-content: space-around;
  background: var(--surface); border-top: 1px solid var(--border);
  padding: 8px 6px calc(8px + env(safe-area-inset-bottom));
}
.bottomnav-item {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
  font-size: 10.5px; font-weight: 600; background: none; border: none;
  color: var(--text-secondary); cursor: pointer;
}
.bottomnav-item.active { color: var(--primary-text); }

@media (min-width: 768px) {
  .topnav { display: inline-flex; }
  .bottomnav { display: none; }
}
```

- [ ] **Step 3: 빌드 확인** — Run: `CI=false npm run build 2>&1 | tail -6` → Expected: `Compiled successfully.`

- [ ] **Step 4: Commit**
```bash
git add src/components/layout/Navigation.jsx src/theme/tokens.css
git commit -m "feat(nav): adaptive navigation (top tabs desktop / bottom bar mobile)"
```

---

## Task 6: Header 신규 (브랜드 · 검색 · 토글 · 인증)

**Files:**
- Create: `src/components/layout/Header.jsx`
- Modify: `src/theme/tokens.css` (헤더 스타일)

배경: 기존 `src/components/Header.jsx`는 이모지 타이틀("🏛️ 정치 뉴스 추적기") + 날짜/업데이트 표시. 새 헤더는 워드마크 + 검색(데스크톱 인라인 / 모바일 stacked) + 테마 토글 + 인증 버튼. **이 헤더는 내비를 포함하지 않는다**(내비는 Task 8의 AppShell이 헤더 아래 strip에서 1회 렌더). 기존 `Header.jsx` 삭제와 App.jsx 전환은 Task 8에서 일괄 처리하므로, 이 태스크는 새 파일 생성 + CSS만 한다(빌드 영향 없음).

- [ ] **Step 1: `src/components/layout/Header.jsx` 생성 (최종형)**

```jsx
import React from 'react';
import ThemeToggle from '../ThemeToggle';

export default function Header({ search, authButton }) {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__brand">
          <span className="brandmark">브리핑 코리아</span>
          <span className="brandsub">실시간 정치 브리핑</span>
        </div>
        <div className="app-header__search-inline">{search}</div>
        <div className="app-header__actions">
          <ThemeToggle />
          {authButton}
        </div>
      </div>
      <div className="app-header__search-stacked">{search}</div>
    </header>
  );
}
```

- [ ] **Step 2: 헤더 스타일을 `src/theme/tokens.css` 끝에 추가**

```css
/* ===== 헤더 ===== */
.app-header { background: var(--surface); border-bottom: 1px solid var(--border); }
.app-header__inner {
  max-width: 1080px; margin: 0 auto;
  display: flex; align-items: center; gap: 16px; padding: 12px 16px;
}
.app-header__brand { display: flex; flex-direction: column; line-height: 1.15; }
.brandmark { font-weight: 800; font-size: 17px; color: var(--primary-text); letter-spacing: -.3px; }
.brandsub { font-size: 10.5px; color: var(--text-secondary); font-weight: 500; }
.app-header__search-inline { display: none; flex: 1; max-width: 360px; margin: 0 auto; }
.app-header__actions { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.app-header__search-stacked { max-width: 1080px; margin: 0 auto; padding: 0 16px 12px; }
.app-header__nav-strip { background: var(--surface); border-bottom: 1px solid var(--border); }
.app-header__nav-strip-inner { max-width: 1080px; margin: 0 auto; padding: 8px 16px; display: flex; justify-content: center; }
@media (min-width: 768px) {
  .app-header__search-inline { display: block; }
  .app-header__search-stacked { display: none; }
}
```

- [ ] **Step 3: 빌드 확인** — Run: `CI=false npm run build 2>&1 | tail -6` → Expected: `Compiled successfully.` (새 파일은 아직 어디서도 import 안 되므로 빌드 영향 없음. 옛 `components/Header.jsx`는 Task 8에서 삭제.)

- [ ] **Step 4: Commit**
```bash
git add src/components/layout/Header.jsx src/theme/tokens.css
git commit -m "feat(layout): new Header (brandmark, inline/stacked search, toggle, auth)"
```

---

## Task 7: Footer 추출

**Files:**
- Create: `src/components/layout/Footer.jsx`
- Modify: `src/theme/tokens.css` (푸터 스타일)

배경: 현재 푸터는 App.jsx 내부 인라인(`<footer className="main-footer">…© 브리핑 코리아…`).

- [ ] **Step 1: `src/components/layout/Footer.jsx` 생성**

```jsx
import React from 'react';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        <p>© 브리핑 코리아. 모든 권리 보유.</p>
        <p>뉴스 출처: 각 언론사 및 공식 보도자료</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: 푸터 스타일을 `src/theme/tokens.css` 끝에 추가**

```css
/* ===== 푸터 ===== */
.app-footer { border-top: 1px solid var(--border); margin-top: 32px; }
.app-footer__inner {
  max-width: 1080px; margin: 0 auto; padding: 20px 16px calc(80px + env(safe-area-inset-bottom));
  color: var(--text-secondary); font-size: 12px; line-height: 1.7;
}
@media (min-width: 768px) { .app-footer__inner { padding-bottom: 24px; } }
```
(모바일은 하단 탭바와 겹치지 않도록 하단 패딩 확보.)

- [ ] **Step 3: 빌드 확인** — Run: `CI=false npm run build 2>&1 | tail -6` → Expected: `Compiled successfully.`

- [ ] **Step 4: Commit**
```bash
git add src/components/layout/Footer.jsx src/theme/tokens.css
git commit -m "feat(layout): extract Footer component"
```

---

## Task 8: AppShell 조합 + App.jsx 전환 (콘텐츠 그리드)

**Files:**
- Create: `src/components/layout/AppShell.jsx`
- Delete: `src/components/Header.jsx` (옛 Header)
- Modify: `src/App.jsx` (AppShell 사용, Header/Tabs/Footer 교체, 콘텐츠 그리드)
- Modify: `src/theme/tokens.css` (셸/그리드 스타일)

구조 결정(최종, 모호성 없음): `Header`는 브랜드+검색+토글+인증만 담는다(Task 6 최종형). `Navigation`은 `.topnav`(데스크톱) + `.bottomnav`(모바일 fixed)를 **동시에** 포함하므로 **AppShell에서 1회만** 렌더한다 — 헤더 바로 아래 nav-strip 안. `.topnav`는 데스크톱에서만, `.bottomnav`는 fixed라 위치 무관하게 모바일 하단에 표시된다.

- [ ] **Step 1: `src/components/layout/AppShell.jsx` 생성 (최종형)**

```jsx
import React from 'react';
import Header from './Header';
import Footer from './Footer';

export default function AppShell({ nav, search, authButton, children }) {
  return (
    <div className="app-shell">
      <Header search={search} authButton={authButton} />
      {nav && (
        <div className="app-header__nav-strip">
          <div className="app-header__nav-strip-inner">{nav}</div>
        </div>
      )}
      <main className="app-main">{children}</main>
      <Footer />
    </div>
  );
}
```
(`nav`가 falsy(로딩/에러 화면)면 nav-strip을 렌더하지 않는다. `.app-header__nav-strip*` CSS는 Task 6에서 이미 추가됨.)

- [ ] **Step 2: 셸/그리드 스타일을 `src/theme/tokens.css` 끝에 추가**

```css
/* ===== 셸 / 콘텐츠 ===== */
.app-shell { min-height: 100vh; background: var(--bg); }
.app-main { max-width: 1080px; margin: 0 auto; padding: 16px; }
.feed-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
@media (min-width: 768px) {
  .feed-grid { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
}
.section-title { font-size: 18px; font-weight: 800; color: var(--text); margin: 4px 0 14px; letter-spacing: -.3px; }
```

- [ ] **Step 3: 옛 Header 삭제** — Run: `git rm src/components/Header.jsx`

- [ ] **Step 4: `src/App.jsx` import 교체**

- 제거: `import Header from './components/Header';` 와 `import Tabs from './components/Tabs';`
- 추가:
```jsx
import AppShell from './components/layout/AppShell';
import Navigation from './components/layout/Navigation';
```
(`Tabs.jsx` 파일 자체는 보존하되 미사용으로 둔다.)

- [ ] **Step 5: `renderTabContent`의 카드 컨테이너 클래스 변경**

president/parliament/statements/news 각 케이스와 검색결과 래퍼의 `className="content-cards"` → `className="feed-grid"`로 변경. 그 안의 map/빈상태/key 로직은 그대로 유지.

- [ ] **Step 6: loading / error 조기 반환 블록 교체**

기존 두 블록(`if (loading) {...}`, `if (error) {...}`)을 다음으로 교체:
```jsx
  if (loading) {
    return (
      <AppShell nav={null} search={null} authButton={renderAuthButton()}>
        <div className="feed-grid">{[1, 2, 3, 4].map((n) => <SkeletonCard key={n} />)}</div>
      </AppShell>
    );
  }
  if (error) {
    return (
      <AppShell nav={null} search={null} authButton={renderAuthButton()}>
        <EmptyState icon="⚠️" message={`데이터를 불러오지 못했습니다. (${error})`} />
        <div style={{ textAlign: 'center' }}>
          <button className="btn btn--primary" onClick={refreshData}>다시 시도</button>
        </div>
      </AppShell>
    );
  }
```

- [ ] **Step 7: 메인 return 교체**

기존 메인 `return ( <div className="App"> <Header>…</Header> <main className="container"> <SearchFilters/> <Tabs/> <div className="tab-content"> {renderTabContent()} </div> </main> {webViewUrl && …} <Modal …/> {loginOpen && …} <footer className="main-footer">…</footer> </div> )` 를 다음으로 교체:
```jsx
  const navEl = (
    <Navigation tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
  );
  const searchEl = (
    <SearchFilters
      ref={searchInputRef}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      onSearch={handleSearch}
      searchLoading={searchLoading}
    />
  );

  return (
    <>
      <AppShell nav={navEl} search={searchEl} authButton={renderAuthButton()}>
        {renderTabContent()}
      </AppShell>

      {webViewUrl && (
        <div className="webviewModal">
          <div className="webviewModalContent">
            <button className="webviewClose" onClick={() => setWebViewUrl(null)}>×</button>
            <iframe src={webViewUrl} title="뉴스 원문" frameBorder="0"
              style={{ width: '100%', height: '80vh', border: 'none' }} allowFullScreen />
          </div>
        </div>
      )}

      <Modal
        isOpen={modal.isOpen}
        type={modal.type}
        content={modal.content}
        onClose={() => setModal({ isOpen: false, content: null, type: null })}
      />

      {loginOpen && (
        <LoginForm onSuccess={handleLoginSuccess} onClose={handleLoginClose} />
      )}
    </>
  );
```
(옛 인라인 `<footer className="main-footer">`는 제거됨 — Footer는 AppShell이 렌더. webview 모달은 기존 마크업 그대로 유지.)

- [ ] **Step 8: 빌드 확인** — Run: `CI=false npm run build 2>&1 | tail -8`
Expected: `Compiled successfully.` 그리고 `grep -rn "components/Header'" src/` → 결과 없음(옛 Header 참조 제거 확인), `grep -rn "import Tabs" src/App.jsx` → 결과 없음.

- [ ] **Step 9: 수동 스모크** — `npm start`. 데스크톱 폭(≥768px): 헤더(브랜드+인라인검색+토글+인증) 아래 상단 탭 strip, 콘텐츠 그리드. 모바일 폭(<768px): 검색 stacked, 하단 탭바 고정, 1열. 탭 전환·테마 토글 동작.

- [ ] **Step 10: Commit**
```bash
git add src/components/layout/AppShell.jsx src/App.jsx src/theme/tokens.css
git commit -m "feat(layout): AppShell + adaptive nav wired into App, responsive feed grid"
```

---

# Phase 2 — 컴포넌트 리스타일

## Task 9: NewsCard 리스타일 (4변형 통일 카드)

**Files:**
- Modify: `src/components/NewsCard.jsx` (마크업 클래스 정리)
- Modify: `src/theme/tokens.css` (카드 스타일)

배경: NewsCard는 type별 4 렌더러(policy/parliament/statement/news). 데이터 필드는 유지하고 클래스/구조를 통일 카드 디자인으로 바꾼다. 기존 `.card`, `.newsCardHorizontal` 등 혼재 → 통일 `.bk-card` 체계.

- [ ] **Step 1: 카드 스타일을 `src/theme/tokens.css` 끝에 추가**

```css
/* ===== 통일 카드 ===== */
.bk-card {
  background: var(--surface); border: 1px solid var(--card-border);
  border-radius: var(--radius-lg); box-shadow: var(--shadow-card);
  overflow: hidden; display: flex; flex-direction: column;
}
.bk-card__thumb {
  height: 140px; background: linear-gradient(135deg,#7aa2ff,var(--primary));
  background-size: cover; background-position: center;
}
.bk-card__body { padding: 14px 15px; display: flex; flex-direction: column; gap: 8px; }
.bk-badge {
  align-self: flex-start; font-size: 10.5px; font-weight: 700;
  padding: 3px 9px; border-radius: var(--radius-pill);
  background: var(--badge-bg); color: var(--badge-text);
}
.bk-badge--alert { background: var(--accent-red-bg); color: var(--accent-red); }
.bk-badge--success { background: color-mix(in srgb, var(--success) 14%, transparent); color: var(--success); }
.bk-badge--warning { background: color-mix(in srgb, var(--warning) 16%, transparent); color: var(--warning); }
.bk-card__title { font-size: 15px; font-weight: 700; line-height: 1.42; color: var(--text); }
.bk-card__summary { font-size: 12.5px; line-height: 1.55; color: var(--text-secondary); }
.bk-card__quote {
  font-size: 13px; line-height: 1.5; color: var(--text);
  border-left: 3px solid var(--primary); padding-left: 10px; margin: 2px 0;
}
.bk-card__meta {
  margin-top: 4px; padding-top: 10px; border-top: 1px solid var(--card-border);
  display: flex; align-items: center; justify-content: space-between;
  font-size: 11px; color: var(--text-secondary);
}
.bk-card__src { font-weight: 700; color: var(--primary-text); }
.bk-card__more { background: none; border: none; color: var(--primary-text); font-weight: 600; font-size: 12px; cursor: pointer; }
```

- [ ] **Step 2: `src/components/NewsCard.jsx` 렌더러 클래스 교체**

각 렌더러를 `.bk-card` 체계로 바꾼다. 데이터 필드는 동일하게 유지하고 클래스만 교체한다.

`renderNewsUpdate(news)` (뉴스):
```jsx
  const renderNewsUpdate = (news) => (
    <article className="bk-card">
      {news.image_url && !isIconLikeImage(news.image_url) && (
        <div className="bk-card__thumb" style={{ backgroundImage: `url(${news.image_url})` }} />
      )}
      <div className="bk-card__body">
        <span className="bk-badge bk-badge--alert">{news.category || '뉴스'}</span>
        <h3 className="bk-card__title">{news.title}</h3>
        <p className="bk-card__summary">{news.ai_summary}</p>
        <div className="bk-card__meta">
          <span className="bk-card__src">{news.source}</span>
          <button className="bk-card__more" onClick={() => onDetailClick('news', news)}>자세히 →</button>
        </div>
      </div>
    </article>
  );
```

`renderPresidentPolicy(policy)`:
```jsx
  const renderPresidentPolicy = (policy) => (
    <article className="bk-card">
      <div className="bk-card__body">
        <span className="bk-badge">대통령</span>
        <h3 className="bk-card__title">{policy.title}</h3>
        {policy.context && <p className="bk-card__summary">{policy.context}</p>}
        {policy.promise_type && <p className="bk-card__summary"><strong>세부:</strong> {policy.promise_type}</p>}
        <div className="bk-card__meta">
          <span className="bk-card__src">{formatDate(policy.date)}</span>
          <button className="bk-card__more" onClick={() => onDetailClick('president', policy)}>자세히 →</button>
        </div>
      </div>
    </article>
  );
```

`renderParliamentActivity(activity)`:
```jsx
  const renderParliamentActivity = (activity) => {
    const statusClass = activity.status === '가결' ? 'bk-badge--success'
      : activity.status === '부결' ? 'bk-badge--alert' : '';
    return (
      <article className="bk-card">
        <div className="bk-card__body">
          <span className={`bk-badge ${statusClass}`}>{activity.status || '정책'}</span>
          <h3 className="bk-card__title">{activity.title}</h3>
          {activity.proposer && <p className="bk-card__summary"><strong>발의자:</strong> {activity.proposer}</p>}
          {activity.committee && <p className="bk-card__summary"><strong>소관위:</strong> {activity.committee}</p>}
          {activity.context && <p className="bk-card__summary">{activity.context}</p>}
          <div className="bk-card__meta">
            <span className="bk-card__src">{formatDate(activity.date)}</span>
            <button className="bk-card__more" onClick={() => onDetailClick('parliament', activity)}>자세히 →</button>
          </div>
        </div>
      </article>
    );
  };
```

`renderPoliticalStatement(statement)`:
```jsx
  const renderPoliticalStatement = (statement) => {
    const typeClass = statement.type === '논란' ? 'bk-badge--alert' : '';
    return (
      <article className="bk-card">
        <div className="bk-card__body">
          <span className={`bk-badge ${typeClass}`}>{statement.type || '발언'}</span>
          <h3 className="bk-card__title">{statement.speaker} <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>({statement.party})</span></h3>
          <p className="bk-card__quote">"{statement.context}"</p>
          {statement.speak_reason && <p className="bk-card__summary"><strong>맥락:</strong> {statement.speak_reason}</p>}
          <div className="bk-card__meta">
            <span className="bk-card__src">{formatDate(statement.date)}</span>
            <button className="bk-card__more" onClick={() => onDetailClick('statements', statement)}>자세히 →</button>
          </div>
        </div>
      </article>
    );
  };
```
이미지 폴백 함수 `isIconLikeImage`와 import(`formatDate`, `defaultNews`)는 유지. `FALLBACK_IMAGE`는 썸네일이 배경이미지 방식으로 바뀌었으므로 `news.image_url`이 없거나 아이콘류면 썸네일 div 자체를 렌더하지 않는다(위 조건). switch/기본 분기는 그대로.

- [ ] **Step 3: 빌드 + 수동** — Run: `CI=false npm run build 2>&1 | tail -6` → `Compiled successfully.` 수동: 각 탭 카드가 통일 디자인·뱃지 색·라이트/다크 정상.

- [ ] **Step 4: Commit**
```bash
git add src/components/NewsCard.jsx src/theme/tokens.css
git commit -m "feat(card): unified bk-card design for all 4 news types"
```

---

## Task 10: 상세 Modal 리스타일 (데스크톱 모달 / 모바일 바텀시트)

**Files:**
- Modify: `src/components/Modal.jsx` (클래스/구조)
- Modify: `src/theme/tokens.css` (모달 스타일)

- [ ] **Step 1: 모달 스타일을 `src/theme/tokens.css` 끝에 추가**

```css
/* ===== 상세 모달 / 바텀시트 ===== */
.bk-modal { position: fixed; inset: 0; z-index: 1000; display: flex; background: rgba(15,18,24,.5); }
.bk-modal__panel {
  background: var(--surface); color: var(--text);
  width: 100%; max-height: 88vh; overflow-y: auto;
  margin-top: auto; border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: 22px 20px calc(22px + env(safe-area-inset-bottom));
  box-shadow: 0 -8px 30px rgba(0,0,0,.25);
}
.bk-modal__close {
  position: absolute; top: 12px; right: 14px; width: 34px; height: 34px;
  border-radius: var(--radius-sm); border: 1px solid var(--card-border);
  background: var(--badge-bg); color: var(--text-secondary); font-size: 18px; cursor: pointer;
}
.bk-modal__panel h3 { font-size: 18px; font-weight: 800; margin-bottom: 12px; color: var(--text); }
.bk-modal__panel p { font-size: 14px; line-height: 1.7; color: var(--text); margin-bottom: 8px; }
.bk-modal__panel .quote { border-left: 3px solid var(--primary); padding-left: 12px; color: var(--text); margin: 10px 0; }
@media (min-width: 768px) {
  .bk-modal { align-items: center; justify-content: center; }
  .bk-modal__panel { max-width: 560px; margin: 0; border-radius: var(--radius-lg); }
}
```

- [ ] **Step 2: `src/components/Modal.jsx` 래퍼 클래스 교체**

`renderContent()`의 각 case 내용(필드)은 그대로 유지하고, 바깥 래퍼만 교체한다:
```jsx
  return (
    <div className="bk-modal" onClick={handleOverlayClick}>
      <div className="bk-modal__panel">
        <button className="bk-modal__close" onClick={onClose} aria-label="닫기">&times;</button>
        {title && <h2>{title}</h2>}
        {renderContent()}
      </div>
    </div>
  );
```
(`handleOverlayClick`은 `e.target === e.currentTarget` 검사 유지 → 패널이 `.bk-modal`의 자식이므로 배경 클릭만 닫힘. 단, 패널 클릭이 닫히지 않도록 패널에 `onClick={(e)=>e.stopPropagation()}` 추가.)

- [ ] **Step 3: 빌드 + 수동** — `Compiled successfully.` 수동: 대통령/정책/발언 "자세히" 클릭 → 모바일 바텀시트 / 데스크톱 중앙 모달, 라이트·다크 정상.

- [ ] **Step 4: Commit**
```bash
git add src/components/Modal.jsx src/theme/tokens.css
git commit -m "feat(modal): restyle detail modal (desktop dialog / mobile bottom sheet)"
```

---

## Task 11: LoginForm 리스타일 (B 스타일, 테마 인지)

**Files:**
- Modify: `src/components/LoginForm.jsx`

배경: 이미 강제 다크테마는 제거됨(공유 MUI 테마 상속). 이제 B 디자인에 맞춰 정리하고 라이트/다크에서 자연스럽게.

- [ ] **Step 1: `LoginForm.jsx` 다듬기**

- 오버레이 `<Box>`의 `bgcolor: 'rgba(0,0,0,0.6)'` 유지(딤드).
- `<Paper>`는 `bgcolor: "background.paper"` 유지(테마 반응). `borderRadius: 2` → `3`, `p:4` 유지.
- 제목 `POLITICS NEWS` → `브리핑 코리아` 로 변경, `<Typography variant="h5" align="center" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>브리핑 코리아</Typography>` + 부제 `<Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>로그인하고 맞춤 브리핑을 받아보세요</Typography>`.
- 닫기 IconButton color는 `text.secondary` 유지.
- 탭/필드/버튼은 MUI 기본 + 테마 primary 사용(이미 적절). 버튼 `size="large"` 유지.

> 데이터 로직(useAuth, handleRegister 등) 변경 없음.

- [ ] **Step 2: 빌드 + 수동** — `Compiled successfully.` 수동: 로그인 모달이 라이트/다크 모두 자연스러움, 브랜드 표기 일관.

- [ ] **Step 3: Commit**
```bash
git add src/components/LoginForm.jsx
git commit -m "feat(auth): restyle LoginForm to Modern Civic, theme-aware"
```

---

## Task 12: MyPage 리스타일

**Files:**
- Modify: `src/components/MyPage.jsx`

- [ ] **Step 1: MyPage 컨테이너/카드 토큰화**

- 바깥 컨테이너 인라인 `background: "var(--color-background)"` 등 옛 변수를 새 토큰으로: `background: 'var(--bg)'`.
- 카드 div의 인라인 스타일을 새 토큰으로 교체: `background: 'var(--surface)'`, `borderRadius: 'var(--radius-lg)'`, `boxShadow: 'var(--shadow-card)'`, `border: '1px solid var(--card-border)'`.
- Avatar `bgcolor: "primary.main"` 유지.
- 닉네임/이메일 Typography는 그대로(테마 색 상속).
- 비밀번호 변경 / 회원 탈퇴 버튼은 MUI variant 유지(테마 primary/error 반응).

> 주석 처리된 북마크/관심사/알림 UI는 백엔드 단계 보류이므로 손대지 않는다.

- [ ] **Step 2: 빌드 + 수동** — `Compiled successfully.` 수동: 마이페이지 카드가 라이트/다크 토큰에 맞게 표시.

- [ ] **Step 3: Commit**
```bash
git add src/components/MyPage.jsx
git commit -m "feat(mypage): tokenize MyPage surfaces for light/dark"
```

---

## Task 13: EmptyState / SkeletonCard / 검색 / 토스트 토큰화

**Files:**
- Modify: `src/components/EmptyState.jsx`
- Modify: `src/components/SkeletonCard.jsx`
- Modify: `src/components/SearchFilters.jsx` (인풋/버튼 토큰)
- Modify: `src/App.jsx` (Toaster toastOptions 테마)
- Modify: `src/theme/tokens.css` (검색/스켈레톤 스타일)

- [ ] **Step 1: EmptyState 토큰** — `color: 'var(--color-text-secondary)'` → `color: 'var(--text-secondary)'`.

- [ ] **Step 2: SkeletonCard 토큰** — `.card` 클래스 의존 제거하고 `.bk-card` 사용 + shimmer 색을 토큰 기반으로. SkeletonCard 루트를 `<div className="bk-card" style={{ padding: '16px' }}>`로 변경(나머지 shimmer 막대 유지).

- [ ] **Step 3: 검색 입력 스타일을 `src/theme/tokens.css` 끝에 추가**

```css
/* ===== 검색 ===== */
.search-container { width: 100%; }
.search-box { display: flex; gap: 8px; }
.search-box .form-control {
  flex: 1; border: 1px solid var(--border); background: var(--surface);
  color: var(--text); padding: 11px 14px; border-radius: var(--radius-md); font-size: 14px;
  font-family: var(--font-base);
}
.search-box .form-control::placeholder { color: var(--text-secondary); }
.btn--primary {
  border: none; background: var(--primary); color: var(--on-primary);
  padding: 0 16px; border-radius: var(--radius-md); font-weight: 700; cursor: pointer;
}
.btn--outline {
  border: 1px solid var(--border); background: var(--surface); color: var(--text);
  padding: 8px 14px; border-radius: var(--radius-md); font-weight: 600; cursor: pointer;
}
```
> 기존 `App.css`의 `.btn--primary`/`.btn--outline`/`.form-control` 정의와 충돌 시, App.css의 해당 옛 정의는 Task 14에서 제거한다. tokens.css가 index.js에서 먼저 로드되지만, 명시도/순서를 위해 Task 14에서 옛 정의를 정리한다.

- [ ] **Step 4: Toaster 테마 옵션** — `src/App.jsx`의 `<Toaster ... />`를 테마 색에 맞춘다:
```jsx
<Toaster
  position="top-center"
  toastOptions={{
    duration: 3000,
    style: { background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--card-border)' },
    success: { iconTheme: { primary: 'var(--primary)', secondary: 'var(--on-primary)' } },
  }}
/>
```

- [ ] **Step 5: 빌드 + 수동** — `Compiled successfully.` 수동: 빈/로딩/검색/토스트가 라이트·다크에서 일관.

- [ ] **Step 6: Commit**
```bash
git add src/components/EmptyState.jsx src/components/SkeletonCard.jsx src/components/SearchFilters.jsx src/App.jsx src/theme/tokens.css
git commit -m "feat(theme): tokenize empty/skeleton/search/toast"
```

---

# Phase 3 — 정리 & 최종 검증

## Task 14: App.css 정리 (옛 토큰·중복 클래스 제거)

**Files:**
- Modify: `src/App.css`

배경: `App.css`는 옛 `:root` 토큰(--color-*) + 다수 옛 클래스를 가진다. tokens.css가 새 진실의 원천이므로 충돌/잔재를 정리한다. **단, 아직 사용 중인 클래스는 보존**한다.

- [ ] **Step 1: 사용 여부 확인 후 제거 대상 식별**

Run: `grep -rn "className=" src/ | grep -oE "(content-cards|tabs-container|tab-btn|main-header|main-footer|newsCard[A-Za-z]*|president-info|key-topics|dashboard-grid)" | sort -u`
→ Task 8/9에서 교체된 클래스(`content-cards`→`feed-grid`, `main-header`/`main-footer`, `tabs*`, `newsCard*` 등)가 더 이상 JSX에서 안 쓰이면 App.css에서 해당 규칙 제거 대상.

- [ ] **Step 2: App.css의 옛 `:root { --color-* … }` 블록 제거**

App.css 최상단의 `:root { … --color-background … }` 와 `@media (prefers-color-scheme: dark){ :root{ … } }` 블록을 삭제(토큰은 tokens.css로 일원화). `* { box-sizing }` 등 리셋은 유지하되, `body`의 `background/color`가 옛 변수면 새 토큰으로 교체하거나 제거(tokens.css가 처리).

- [ ] **Step 3: 더 이상 JSX에서 참조되지 않는 옛 클래스 규칙 제거**

Step 1에서 미사용으로 확인된 규칙만 삭제: `.tabs*`, `.tab-btn`, `.main-header*`, `.main-footer*`, `.newsCardHorizontal/.newsCardThumbnail/...`(NewsCard가 .bk-card로 전환됨), `.content-cards`, `.modal/.modal-content/.close`(Modal이 .bk-modal로 전환됨), `.dashboard-grid`, `.filter-*`. **확실히 미사용인 것만**. 옛 `.btn--primary/.btn--outline/.form-control`은 tokens.css 정의로 대체되므로 App.css 버전 제거.

> 보존: `.quote`, `.status*`(혹시 잔존 사용), `.flex/.gap-*/.py-16/.justify-between` 같은 유틸이 다른 곳에서 쓰이면 유지. 삭제 전 `grep`으로 확인.

- [ ] **Step 4: 빌드 + 수동 회귀** — Run: `CI=false npm run build 2>&1 | tail -6` → `Compiled successfully.` 수동: 전 화면 시각 회귀 없는지(레이아웃 깨짐 없음) 확인.

- [ ] **Step 5: Commit**
```bash
git add src/App.css
git commit -m "chore(css): remove legacy tokens and unused classes superseded by tokens.css"
```

---

## Task 15: 최종 반응형·테마 검증

**Files:** (없음 — 검증/미세조정 only)

- [ ] **Step 1: 클린 빌드** — Run: `CI=false npm run build 2>&1 | tail -8` → `Compiled successfully.`

- [ ] **Step 2: 4분면 수동 스모크** — `npm start`, 브라우저 개발자도구 반응형으로:
  - 모바일(375px) 라이트: 하단 탭바, 1열, 검색 stacked, 카드/뱃지 정상
  - 모바일(375px) 다크: 토글로 전환, 대비 양호
  - 데스크톱(1280px) 라이트: 상단 탭, 그리드(다열), 인라인 검색
  - 데스크톱(1280px) 다크
  - 각 탭(전체/뉴스/대통령/정책/발언) 전환, 검색, "자세히" 모달, 로그인 모달, 마이페이지(로그인 시), 빈/에러/로딩 상태
  - 테마 토글 후 새로고침 → 선택 유지(localStorage), OS 다크 설정 시 기본 다크

- [ ] **Step 3: key 경고/콘솔 에러 없음 확인** (브라우저 콘솔)

- [ ] **Step 4: 발견된 미세 이슈가 있으면 해당 Task 파일에서 수정 후 추가 커밋.**

---

## 자기 점검(플랜 작성자용) 메모
- 데이터 계층(hooks/api/AppContext) 미변경 — 회귀 위험 최소.
- 죽은 서브트리·Dashboard·Tabs.jsx 파일은 삭제하지 않음(미사용으로 남김).
- 백엔드 의존 기능은 범위 밖(이전 결정 유지).
- 클래스 네이밍: 신규는 `bk-`/`app-`/시맨틱 접두. 옛 클래스는 Task 14에서 grep 확인 후에만 제거.

## 다음 단계(이 플랜 이후)
- 백엔드 확보 시: 인증 토큰·북마크·관심사·알림·실제 필터(별도 spec→plan).
