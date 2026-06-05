# 브리핑 코리아 UI 전면 리디자인 — 설계 (Design Spec)

작성일: 2026-06-05
대상 레포: `politics_front` (React 19 / CRA / Capacitor / Firebase 웹)

## 1. 목표 & 범위

**목표:** 현재 "전체적으로 밋밋한" UI를 완성도 높은 정치 뉴스 앱 디자인으로 전면 교체한다. 구조·기능·데이터 계층은 유지하고 **외관과 레이아웃 체계(테마·반응형·다크모드)** 를 바꾼다.

**포함:**
- 디자인 시스템 정립(토큰·타이포·컴포넌트 스타일)
- 반응형 적응 내비게이션(모바일=하단 탭바, 데스크톱=상단 탭)
- 라이트/다크 모드(토큰 + 토글 + 영속)
- 모든 라이브 화면 리스타일(헤더·검색·탭·뉴스카드·상세 모달·로그인·마이페이지·빈/로딩/에러·토스트·푸터)

**제외 (이전 결정과 동일하게 유지):**
- 백엔드 의존 기능(인증 토큰 저장, 북마크, 관심사, 알림 토글, 실제 서버 필터) — 손대지 않음
- 새 기능/데이터 추가 없음
- 죽은 피처 서브트리(SummaryCard, Favorites, CommentSection, FeedbackForm, NotificationList, TagChart, useComments, useFeedback, useFetchData) 및 Dashboard — 그대로 보존(삭제·재활성화 안 함)
- 데이터 계층(`hooks/useNews.js`, `hooks/api.js`, `AppContext`, `useAuth`, `useMyPage`) 로직 변경 없음 — 순수 시각/구조 작업

## 2. 디자인 방향 (확정)

**Modern Civic (시안 B)** — 핀테크/뉴스 앱 같은 클린·모던. 인디고 프라이머리, 넉넉한 여백, 둥근 카드, 부드러운 그림자, 명확한 타이포 위계.

**타이포그래피:** **Pretendard**(한글 UI 프리미엄 폰트). npm `pretendard` 패키지로 자체 호스팅(오프라인/앱 환경 대비). 폴백 `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`. 가중치 400/500/700/800 사용.

**아이콘:** 이미 의존성인 `lucide-react` 사용(하단 탭바, 토글, 메타 등). 이모지는 카테고리 뱃지 등 제한적으로만.

## 3. 디자인 토큰 (라이트 / 다크)

CSS 커스텀 프로퍼티로 단일 소스. `[data-theme="dark"]`로 오버라이드, 미지정 시 `prefers-color-scheme` 추종.

| 토큰 | 라이트 | 다크 |
|------|--------|------|
| `--bg` | `#f4f6fb` | `#0f1218` |
| `--surface` | `#ffffff` | `#181c24` |
| `--surface-elevated` | `#ffffff` | `#161a22` |
| `--text` | `#1a2233` | `#eef1f7` |
| `--text-secondary` | `#5b6580` | `#9aa3b5` |
| `--primary` (버튼/강조) | `#3354ff` | `#5b78ff` |
| `--primary-text` (링크/브랜드 글자) | `#3354ff` | `#7e97ff` |
| `--on-primary` | `#ffffff` | `#ffffff` |
| `--border` | `#e8ecf4` | `#232834` |
| `--card-border` | `#eef1f7` | `#242a36` |
| `--badge-bg` | `#eef1fb` | `#222a44` |
| `--badge-text` | `#3354ff` | `#9fb4ff` |
| `--accent-red` (속보/논란) | `#e11d6b` | `#ff7da6` |
| `--accent-red-bg` | `#fdeaf0` | `#3a1f2c` |
| `--shadow-card` | `0 6px 18px rgba(26,34,51,.06)` | `0 6px 18px rgba(0,0,0,.30)` |

**상태색(법안 status / 발언 type):** 가결=success(green `#1c9c6b`/dark `#39c08a`), 부결=error(=accent-red 계열), 발의/info=primary 계열, 인사/warning=amber(`#c07f1a`/dark `#e6a23c`). 라이트/다크 각각 정의.

**간격:** 기존 유지 `--space-4/8/12/16/20/24/32`.
**라운드:** `--radius-sm:8px` `--radius-md:12px` `--radius-lg:16px` `--radius-pill:999px`.
**타입 스케일:** brand 18–20 / page-title 22 / card-title 14.5–16(700) / body 13–14 / summary 12.5 / meta 11. line-height 1.4–1.6.
**브레이크포인트:** `--bp-md: 768px` (이상=데스크톱 레이아웃).

## 4. 반응형 적응 내비게이션

하나의 코드/디자인이 폭에 따라 분기(CSS 미디어쿼리 768px 기준). 탭 목록은 단일 소스(전체/뉴스/대통령/정책/발언, 로그인 시 마이페이지).

- **< 768px (모바일·Capacitor 앱):** 화면 하단 고정 **BottomTabBar**(lucide 아이콘 + 라벨). iOS 세이프에어리어 인셋 적용. 콘텐츠는 1열 피드, 하단 패딩 확보. 상단 헤더는 브랜드+토글+검색만.
- **≥ 768px (데스크톱 웹):** 헤더 행 안 **TopTabNav**(알약 탭) + 우측 인라인 검색. 콘텐츠는 다열 그리드(2–3열, `minmax` auto-fill). 최대 폭 컨테이너(~1080px) 가운데 정렬. 하단 탭바 숨김.

구현: 두 내비를 모두 렌더하고 CSS `display`로 폭에 따라 토글(JS 미디어쿼리 깜빡임 회피). BottomTabBar는 `position: fixed`.

## 5. 다크모드 동작

- 모드 상태: `light | dark | system`. 기본 `system`.
- `ThemeContext`/`useTheme`가 effective 테마를 계산해 `document.documentElement.dataset.theme = 'light'|'dark'` 설정. `system`일 때 `matchMedia('(prefers-color-scheme: dark)')` 구독.
- 헤더의 **ThemeToggle**(☀︎/☾)로 light↔dark 순환(원하면 system 포함 3단). 선택은 `localStorage` 키 `bk-theme`에 저장.
- CSS 변수와 **MUI 테마가 동시 반응**: `muiTheme.js`의 `makeTheme(mode)`가 같은 팔레트로 라이트/다크 MUI 테마를 생성, 루트 `ThemeProvider`에 effective 모드 주입(로그인/마이페이지 MUI 표면도 일관).

## 6. 컴포넌트 인벤토리 (리스타일/신규)

**신규 (레이아웃/테마):**
- `src/theme/tokens.css` — 라이트/다크 토큰 단일 소스
- `src/theme/ThemeContext.jsx` — 모드 상태·영속·data-theme 적용·system 구독, `useTheme` 훅
- `src/theme/muiTheme.js` — `makeTheme(mode)` (기존 `src/theme.js` 대체/이전, Pretendard 타이포)
- `src/components/layout/AppShell.jsx` — 헤더+내비+main+푸터 조합, 데스크톱 컨테이너 폭
- `src/components/layout/Navigation.jsx` — 단일 탭 소스로 TopTabNav + BottomTabBar 렌더(CSS 분기)
- `src/components/layout/Footer.jsx` — 기존 인라인 푸터 추출·리스타일
- `src/components/ThemeToggle.jsx`

**리스타일 (기존 파일):**
- `Header.jsx` — 새 브랜드 워드마크("브리핑 코리아" + 부제), 이모지 타이틀 제거, 검색/토글/인증칩 배치, 마지막 업데이트 정보는 절제
- `SearchFilters.jsx` → 검색 전용으로 이미 정리됨; B 스타일 인풋/버튼 + 아이콘 (필요 시 `SearchBar`로 명칭 정리)
- `NewsCard.jsx` — 4변형(news/policy/parliament/statement) 통일 카드: (옵션)썸네일 + 색상 카테고리 뱃지 + 제목 + AI요약 + 출처·날짜 메타 + "자세히". 그리드/1열 모두 대응
- `Modal.jsx` — 데스크톱 중앙 모달 / 모바일 바텀시트, B 스타일
- `LoginForm.jsx` — B 스타일 모달, 라이트/다크 인지(강제 다크테마는 이전 작업서 제거됨 → 공유 테마 사용)
- `MyPage.jsx` — 카드 리스타일, 테마 토큰화
- `EmptyState.jsx` / `SkeletonCard.jsx` — 하드코딩 색 → 토큰, B 스타일
- 에러 화면(App.jsx 내) — 토큰화
- 토스트(react-hot-toast) — 테마 색에 맞춘 `toastOptions`(모드 반응)

**App.jsx 슬림화:** 데이터 훅 + activeTab 상태 보유 + `AppShell` 조합 + 탭 콘텐츠 렌더. 탭 콘텐츠 렌더가 비대하면 `TabContent.jsx`(또는 `Feed.jsx`)로 추출.

## 7. 파일 구조 (요지)

```
src/
  theme/
    tokens.css          (신규)
    ThemeContext.jsx    (신규)
    muiTheme.js         (신규, 기존 theme.js 이전)
  components/
    layout/
      AppShell.jsx      (신규)
      Header.jsx        (이전 components/Header.jsx 이동·재작성)
      Navigation.jsx    (신규: TopTabNav + BottomTabBar)
      Footer.jsx        (신규)
    ThemeToggle.jsx     (신규)
    NewsCard.jsx        (리스타일)
    Modal.jsx           (리스타일)
    LoginForm.jsx       (리스타일)
    MyPage.jsx          (리스타일)
    SearchFilters.jsx   (리스타일)
    EmptyState.jsx      (토큰화)
    SkeletonCard.jsx    (토큰화)
  App.jsx               (슬림화 + AppShell 사용)
  App.css               (정리: 토큰은 tokens.css로, 컴포넌트 클래스 B로 갱신)
```
데이터/훅 파일은 변경 없음. 죽은 서브트리는 이동·삭제하지 않음.

## 8. 성공 기준

- `CI=false npm run build` 통과, 웹·앱 양쪽에서 동작.
- 모든 라이브 화면이 일관된 B 비주얼(라이트/다크 모두).
- < 768px 하단 탭바 / ≥ 768px 상단 탭 자동 전환.
- 테마 토글 동작·영속, OS 기본값 추종.
- 기존 기능 무회귀(검색·탭 전환·상세 모달·로그인·마이페이지·빈/에러/로딩).
- 검증: **빌드 통과 + 수동 반응형/테마 스모크**(라이트·다크 × 모바일·데스크톱 폭). 엄격 TDD 미적용(테스트 인프라 부재, 이전 결정 유지).

## 9. 리스크 / 메모

- Pretendard 자체 호스팅 시 번들/로드 영향 — npm 패키지의 동적 서브셋 CSS import로 최소화.
- 다크 토큰을 CSS 변수와 MUI 양쪽에서 동기 유지해야 함(단일 팔레트 객체에서 파생 권장).
- Capacitor 앱은 항상 모바일 레이아웃 → 하단 탭바 + 세이프에어리어 필수.
- 색상은 특정 정당 연상 회피(중립 인디고) — 정치 앱 톤에 적합.
