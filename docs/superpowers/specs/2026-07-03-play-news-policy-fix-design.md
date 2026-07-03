# Google Play 뉴스·잡지 정책 거절 대응 — 설계

날짜: 2026-07-03
대상: politics_front (웹 koreanpolitical.web.app + Android 앱 com.political.app)

## 배경

Google Play Console에서 BriefingKorea 앱이 "뉴스 및 잡지 정책 위반"으로 거절됨.
진단 결과(2026-07-03) 실제 미충족 항목은 두 가지:

1. **연락처 부재**: 이메일/전화가 포함된 연락처 페이지가 인앱·웹 어디에도 없음.
   AboutModal(이용안내)에는 저작권·방법론·정정 안내만 있음. 피드백 폼은 Google 기준상
   연락처로 인정되지 않음.
2. **콘텐츠 연령 확인 불가**: 뉴스 목록 카드(NewsCard)가 출처·카테고리만 표시하고
   게시 날짜를 표시하지 않음. 날짜는 리더 모달을 열어야만 보임.

콘텐츠 최신성 자체는 문제없음: 백엔드(politicsbackend-ruby.vercel.app) 정상,
당일 기사 유입 중, 수집 크론(GitHub Actions) 정상, 업로드된 AAB(1.1.0/vc10)도
살아있는 Vercel URL을 사용.

## 변경 사항

### 1. 연락처 노출 (이메일: briefingkorea@gmail.com)

- **Footer** (`src/components/layout/Footer.jsx`):
  `문의·제보: briefingkorea@gmail.com` 라인을 mailto 링크로 **상시 노출**.
  모달 안에만 두면 심사자/크롤러가 "확인 불가" 판정할 소지가 있어 푸터 직노출이 핵심.
  웹과 앱이 같은 React 번들이므로 한 번의 수정으로 "웹사이트 + 인앱" 요건 동시 충족.
- **AboutModal** (`src/components/AboutModal.jsx`):
  "📮 문의·연락처" 섹션 추가 — 이메일 명시 + 정정 요청도 이 이메일로 가능함을 안내
  (기존 "✏️ 정정 요청" 섹션과 연결).

### 2. 뉴스 카드에 게시 날짜 표시

- `src/components/NewsCard.jsx`의 뉴스 렌더링 두 곳:
  - full 카드 meta: `출처 · 날짜` 형태로 `formatDate(news.published_at || news.date)` 추가
  - compact row meta: 동일하게 날짜 추가
- `utils/dateUtils.formatDate` 재사용(기존 정책/발언 카드와 동일 포맷). 절대 날짜가
  보이도록 포맷 확인 — 상대시간만 나온다면 절대 날짜 병기.

### 3. 버전 및 배포

- `android/app/build.gradle`: versionCode 10 → 11, versionName 1.1.0 → 1.1.1
- 웹: `CI=false npm run build` → `firebase deploy` (koreanpolitical.web.app)
- 앱: `npx cap sync android` → `./gradlew bundleRelease` → 키스토어
  (`~/Downloads/my-release-key.jks`)로 서명 → AAB 산출.
  Play Console 재제출과 "뉴스 및 잡지" 선언/카테고리 확인은 사용자 수행.

## 변경하지 않는 것 (YAGNI)

- 별도 연락처 페이지/라우트 신설 — SPA 구조상 푸터+모달로 충분
- 전화번호 — 정책은 이메일 또는 전화 중 하나면 충족
- 백엔드 변경 — 데이터·API는 문제없음

## 검증

- `CI=false npm run build` 성공
- `npx serve -s build` + `scripts/shots.js`(Playwright)로 홈/푸터/카드 캡처 확인:
  푸터에 이메일, 뉴스 카드에 날짜 노출
- codex 교차 리뷰(변경 diff) — work-with-codex 관행
- AAB 빌드 후 `bundletool`/`unzip`으로 번들 내 자산이 새 빌드인지 확인

## 리스크

- 키스토어 비밀번호 필요(서명 단계). 확보 불가 시 서명 전 단계까지 완료하고 사용자에 요청.
- Play 재심사에서 다른 위치의 문제를 추가 지적할 가능성 — 재제출 전 전체 탭 데이터
  존재 확인(대통령/정책/발언/이슈 탭 API 응답 비어있지 않음)을 체크리스트에 포함.
