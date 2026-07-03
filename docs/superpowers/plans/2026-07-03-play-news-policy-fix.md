# Google Play 뉴스 정책 대응 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Play 거절 사유 해소 — 연락처(briefingkorea@gmail.com) 상시 노출 + 뉴스 카드 게시 날짜 표시 후 웹 배포·AAB 재빌드.

**Architecture:** 웹과 안드로이드 앱이 같은 React(CRA)+Capacitor 번들이므로 프론트 수정 한 번으로 "웹사이트 + 인앱" 요건을 동시 충족한다. Footer에 이메일 직노출(심사자/크롤러 확인용), AboutModal에 문의 섹션, NewsCard 두 변형에 절대 날짜 추가.

**Tech Stack:** React 18 (CRA), Capacitor Android, Firebase Hosting, Gradle + jarsigner.

## Global Constraints

- 연락처 이메일: `briefingkorea@gmail.com` (정확히 이 주소, mailto 링크)
- 날짜 필드: `news.published_at || news.date` (NewsReaderModal.jsx:75와 동일 규약)
- 날짜 포맷: `formatDate` (`src/utils/dateUtils.js`, "2026년 7월 3일" 형태 절대 날짜)
- versionCode 11 / versionName "1.1.1" (`android/app/build.gradle`)
- 컴포넌트 테스트 인프라 없음(@testing-library 미설치) → 검증은 `CI=false npm run build` + Playwright 캡처(`scripts/shots.js` 패턴) + codex diff 리뷰
- 커밋은 작업 단위별로 분리

---

### Task 1: Footer 연락처 직노출

**Files:**
- Modify: `src/components/layout/Footer.jsx`

**Interfaces:**
- Produces: 푸터에 상시 노출되는 `mailto:briefingkorea@gmail.com` 링크 (Task 4 캡처 검증이 참조)

- [ ] **Step 1: Footer에 연락처 라인 추가**

`src/components/layout/Footer.jsx`의 `<p><button className="footer-link" ...>` 줄 **위**에 추가:

```jsx
        <p>
          문의·제보: <a className="footer-link" href="mailto:briefingkorea@gmail.com">briefingkorea@gmail.com</a>
        </p>
```

- [ ] **Step 2: 빌드로 문법 확인**

Run: `CI=false npm run build`
Expected: `Compiled successfully` (경고 허용, 에러 없음)

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Footer.jsx
git commit -m "feat: expose contact email in footer (Play news policy)"
```

### Task 2: AboutModal 문의·연락처 섹션

**Files:**
- Modify: `src/components/AboutModal.jsx`

**Interfaces:**
- Consumes: 없음
- Produces: 이용안내 모달 내 "문의·연락처" 섹션 (심사 소명서에서 인용 가능)

- [ ] **Step 1: 섹션 추가**

`src/components/AboutModal.jsx`의 "✏️ 정정 요청" 섹션(`about__sec`) **앞**에 추가:

```jsx
        <div className="about__sec">
          <h3>📮 문의·연락처</h3>
          <p>서비스 관련 문의, 제보, 정정 요청은 아래 이메일로 연락해 주세요.</p>
          <p><b>이메일:</b> <a href="mailto:briefingkorea@gmail.com">briefingkorea@gmail.com</a></p>
        </div>
```

그리고 기존 "✏️ 정정 요청" 문단 끝에 한 문장 추가:

```jsx
          <p>잘못된 정보나 정정이 필요한 내용은 각 화면의 <b>피드백(잘못된 정보)</b> 또는
            <b> briefingkorea@gmail.com</b>으로 알려주시면 검토 후 반영합니다.
            사실과 다른 표시가 확인되면 신속히 수정합니다.</p>
```

(기존 두 문장짜리 `<p>`를 위 내용으로 교체 — 이메일 경로 추가가 목적)

- [ ] **Step 2: 빌드 확인**

Run: `CI=false npm run build`
Expected: `Compiled successfully`

- [ ] **Step 3: Commit**

```bash
git add src/components/AboutModal.jsx
git commit -m "feat: add contact section to about modal"
```

### Task 3: NewsCard 게시 날짜 표시

**Files:**
- Modify: `src/components/NewsCard.jsx`

**Interfaces:**
- Consumes: `formatDate` from `../utils/dateUtils` (이미 import되어 있음, NewsCard.jsx:2)
- Produces: 뉴스 목록/피처드/컴팩트 카드 모두 `출처 · 게시날짜` 메타 표시

- [ ] **Step 1: compact row에 날짜 추가**

`renderNewsUpdate` 내 compact 분기(NewsCard.jsx:82-85)의 meta를:

```jsx
            <div className="news-row__meta">
              <span className="bk-card__src">{news.source}</span>
              {(news.published_at || news.date) && (
                <span> · {formatDate(news.published_at || news.date)}</span>
              )}
              {news.category && <span> · {news.category}</span>}
            </div>
```

- [ ] **Step 2: full 카드에 날짜 추가**

full 분기(NewsCard.jsx:105-108)의 meta를:

```jsx
          <div className="bk-card__meta">
            <span className="bk-card__src">
              {news.source}
              {(news.published_at || news.date) && ` · ${formatDate(news.published_at || news.date)}`}
            </span>
            <span className="bk-card__more">자세히 →</span>
          </div>
```

- [ ] **Step 3: 빌드 확인**

Run: `CI=false npm run build`
Expected: `Compiled successfully`

- [ ] **Step 4: Commit**

```bash
git add src/components/NewsCard.jsx
git commit -m "feat: show publish date on news cards (content age visibility)"
```

### Task 4: 시각 검증 + codex 리뷰

**Files:**
- Test: `scripts/shots.js` (기존 Playwright 캡처 스크립트 재사용)

**Interfaces:**
- Consumes: Task 1-3의 UI 변경, `build/` 산출물

- [ ] **Step 1: 로컬 서빙 + 캡처**

```bash
npx serve -s build -l 5055 &
node scripts/shots.js   # /tmp/shots/ 에 데스크톱+모바일 캡처
```

Expected: 캡처 이미지에서 ① 푸터에 briefingkorea@gmail.com 노출 ② 뉴스 카드에 "연합뉴스 · 2026년 7월 3일" 형태 메타 확인. 이미지 Read로 직접 확인.

- [ ] **Step 2: codex diff 리뷰**

```bash
git diff HEAD~3 -- src/ | codex exec "Google Play 뉴스 정책(연락처 노출, 콘텐츠 연령 표시) 대응 diff 리뷰. 문제점·누락 지적해줘"
```

Expected: 블로킹 이슈 없음. 지적 사항 있으면 반영 후 재커밋.

### Task 5: 버전 범프 + 웹 배포 + AAB 빌드

**Files:**
- Modify: `android/app/build.gradle:10-11` (versionCode 10→11, versionName "1.1.0"→"1.1.1")

**Interfaces:**
- Consumes: `build/` (Task 1-3 반영된 최종 빌드)
- Produces: 배포된 웹 + 서명된 `app-release.aab`

- [ ] **Step 1: build.gradle 버전 범프**

```groovy
        versionCode 11
        versionName "1.1.1"
```

- [ ] **Step 2: 웹 배포**

Run: `npx firebase deploy --only hosting`
Expected: `Deploy complete!` → https://koreanpolitical.web.app 에서 푸터 이메일 눈으로 확인 (curl로 번들 내 문자열 확인 가능: `curl -s https://koreanpolitical.web.app/static/js/main.*.js | grep -c briefingkorea`)

- [ ] **Step 3: cap sync + AAB 빌드**

```bash
npx cap sync android
cd android && ./gradlew bundleRelease
```

Expected: `BUILD SUCCESSFUL`, 산출물 `android/app/build/outputs/bundle/release/app-release.aab`

- [ ] **Step 4: 서명**

키스토어: `~/Downloads/my-release-key.jks` (비밀번호는 사용자 확인 필요 — 셸 히스토리에 jarsigner 이력 있으면 재사용)

```bash
jarsigner -keystore ~/Downloads/my-release-key.jks \
  android/app/build/outputs/bundle/release/app-release.aab <alias>
jarsigner -verify android/app/build/outputs/bundle/release/app-release.aab
```

Expected: `jar verified.`

- [ ] **Step 5: 번들 검증 + 커밋**

```bash
unzip -p android/app/build/outputs/bundle/release/app-release.aab base/assets/public/static/js/main.*.js | grep -c briefingkorea   # ≥1
git add android/app/build.gradle
git commit -m "chore(android): bump versionCode 11 / versionName 1.1.1"
git push origin main
```

### Task 6: 재제출 체크리스트 (사용자 안내)

- [ ] Play Console에 새 AAB(vc11) 업로드, 거절 소명에 변경사항 기재(연락처 페이지 추가, 게시 날짜 표시, 콘텐츠는 매시간 자동 수집됨)
- [ ] 앱 카테고리 = 뉴스·잡지, 뉴스 앱 선언 최신화 확인
- [ ] 스토어 등록정보의 이메일도 briefingkorea@gmail.com으로 일치시킬지 검토
- [ ] 재제출 직전 전 탭(뉴스/대통령/정책/발언/이슈) 데이터 존재 확인
