# UI 전면 개편 (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (inline) + Playwright before/after 캡처. Steps use `- [ ]`.

**Goal:** 평평한 카드 그리드에서 → 에디토리얼 홈(히어로+섹션), 리치 이슈/의원 카드, 세련된 디자인 시스템, 모바일·접근성 개선으로 끌어올린다.

**Architecture:** 디자인 토큰(`tokens.css`)을 먼저 정비 → 공통 카드/섹션 컴포넌트 → 화면별(홈/이슈/의원/모바일) 적용. 백엔드 변경 최소(예시의원 제거만). 검증은 **Playwright 스크린샷 + 빌드 + designer/critic 에이전트 + codex 재검토**.

**Tech Stack:** React, CSS custom properties(tokens.css), Playwright(설치됨, `--no-save`), codex CLI(read-only 검토).

**근거:** 저 + codex 합의 진단(스크린샷 기반). 작업 전 `git checkout -b feat/ui-overhaul`. 라이브: koreanpolitical.web.app, 백엔드 politicsbackend-ruby.vercel.app.

**검증 루프(각 Task):** 변경 → `CI=false npm run build` → 로컬 dev(또는 빌드 serve)에서 Playwright로 해당 화면 캡처 → 이미지 확인 → (핵심 화면) codex `-i` 재검토.

---

## Task 0: 준비 — 예시 데이터 제거 + 스크린샷 베이스라인
- [ ] **Step 1: 가짜 의원 제거** (백엔드 .venv): 예시의원A/B 삭제
```bash
cd /Users/manager/side/politics_backend && source .venv/bin/activate && python3 - <<'PY'
from firebase.firebase_config import db
n=0
for doc in db.collection("members").stream():
    d=doc.to_dict()
    if (d.get("name") or "").startswith("예시의원"):
        db.collection("members").document(doc.id).delete(); n+=1
print("deleted", n)
PY
```
- [ ] **Step 2: 베이스라인 스크린샷 보관** — `/tmp/shots`의 현재 이미지를 `/tmp/shots_before/`로 복사. (after와 비교용)
```bash
mkdir -p /tmp/shots_before && cp /tmp/shots/*.png /tmp/shots_before/ 2>/dev/null; echo ok
```

---

## Task 1: 디자인 토큰 정비 (tokens.css)
**Files:** Modify `politics_front/src/theme/tokens.css`

- [ ] **Step 1: 타이포 스케일 + 카드 스타일 현대화** — `tokens.css`에 추가/조정:
  - 타이포 스케일 변수: `--fs-hero`(28px/800), `--fs-title`(17px/700), `--fs-body`(14px/1.6), `--fs-meta`(12px). 줄간격 ↑.
  - 카드: 보더 얇게(`1px var(--card-border)`), 그림자 낮게(`0 1px 2px rgba(0,0,0,.04)`), radius 통일(`--radius-lg:14px`), hover transform(`translateY(-2px)`)+shadow.
  - 섹션 색 신호: 카테고리/정당별 액센트 변수(정치=blue, 정책=violet, 대통령=amber, 속보=red).
  - 접근성: 본문 대비(WCAG AA), 포커스 링(`:focus-visible{outline:2px solid var(--primary)}`), 최소 터치 44px.
- [ ] **Step 2:** 빌드 확인 `CI=false npm run build | grep Compiled`.
- [ ] **Step 3: Commit** `git add src/theme/tokens.css && git commit -m "feat(ui): refine design tokens (type scale, cards, accents, a11y)"`

---

## Task 2: 홈 — "오늘의 브리핑" 히어로 + 섹션형
**Files:** Modify `src/App.jsx`(default/news case), `src/components/DailySummaryCard.jsx`, tokens.css

- [ ] **Step 1: 히어로 강화** — `DailySummaryCard`를 홈 상단 풀폭 히어로로(요약 없으면 "오늘 핵심 이슈" 폴백 = 최신 이슈/속보 카드). 그라데이션 배경 + 큰 타이포.
- [ ] **Step 2: 섹션형 피드** — 'all' 탭을 단일 그리드 → 섹션 구분(🔥 이슈 가로 스크롤 → 📰 최신 뉴스 그리드). 첫 뉴스 1개는 **피처드 대형 카드**(이미지 큼+제목 크게), 나머지 표준.
- [ ] **Step 3:** 빌드 + Playwright 캡처(`/tmp/shots/after-home.png` desktop+mobile) → 확인.
- [ ] **Step 4: Commit** `feat(ui): editorial home (briefing hero + sectioned feed + featured card)`

---

## Task 3: 이슈 카드/대시보드 리치하게
**Files:** Modify `src/components/IssueCard.jsx`, `src/theme/tokens.css`

- [ ] **Step 1: IssueCard 강화** — 상태별 색 뱃지(가결=green/부결=red/진행중=blue/계류=amber), 요약 클램프, **관점비교 미니바**(가능 시 list API에 breakdown 없으면 상세에서만 — 카드엔 출처 수/매체 수 표시), 업데이트 시각.
- [ ] **Step 2: 빈 상태** — 이슈 적을 때 "추천/최근 업데이트" 안내 박스.
- [ ] **Step 3:** 빌드 + Playwright 캡처(이슈 탭) → 확인.
- [ ] **Step 4: Commit** `feat(ui): richer issue cards (status colors, source meta, empty state)`

---

## Task 4: 의원 카드 = 감시/비교 도구
**Files:** Modify `src/components/MemberCard.jsx`, `src/components/MemberDetail.jsx`, tokens.css

- [ ] **Step 1: MemberCard** — 정당색 좌측 액센트 바, 이름 크게, 지역구·위원회·선수, **한눈 지표 칩**(전과 N · 발의 N · 표결 N — bill_count/votes 길이 활용), 사진 없으면 이니셜 아바타.
- [ ] **Step 2: MemberDetail** — 표결/발의 섹션 시각 정리(찬반 태그 색, 카운트 요약 헤더).
- [ ] **Step 3:** 빌드 + Playwright 캡처(의원 탭) → 확인.
- [ ] **Step 4: Commit** `feat(ui): member cards as accountability tool (party accent, metric chips, avatar)`

---

## Task 5: 모바일 + 접근성
**Files:** Modify `src/components/layout/Navigation.jsx`, `src/theme/tokens.css`, AppShell 관련

- [ ] **Step 1: 하단탭 라벨** — 모바일 하단 내비에 아이콘+**라벨** 표시, 활성 상태 강조, 터치영역 ≥44px.
- [ ] **Step 2: 주제 칩/맨위로** — 피드 상단 빠른 주제 칩(전체/정치/정책/대통령), 스크롤 시 "맨 위로" 버튼.
- [ ] **Step 3: 반응형/대비** — 모바일 그리드 1열 간격·본문 글자 키우기, 색 대비 점검.
- [ ] **Step 4:** 빌드 + Playwright 모바일 캡처(뷰포트 390) → 확인.
- [ ] **Step 5: Commit** `feat(ui): mobile nav labels + topic chips + a11y/touch targets`

---

## Task 6: 최종 검증 + 다관점 리뷰 + 배포
- [ ] **Step 1: 전체 Playwright 캡처** (desktop+mobile, 홈/이슈/의원) → `/tmp/shots/after-*`
- [ ] **Step 2: before/after 비교** — 직접 확인 + **codex `-i`로 after 스크린샷 재검토**(개선됐는지/남은 문제) + **designer 또는 critic 에이전트** 검토.
- [ ] **Step 3: 지적사항 반영**(있으면).
- [ ] **Step 4: 빌드 + 커밋 + push + `firebase deploy --only hosting`** → 라이브 반영. (앱도 `npx cap sync android` + AAB 재빌드는 선택)

---

## Self-Review
- 합의 항목(히어로·카드현대화·이슈대시보드·의원비교·모바일·빈상태·접근성) 전부 Task로 커버.
- 검증: Playwright 스크린샷(설치됨) + 빌드 + codex/에이전트 다관점.
- Phase 2(후속): AI 자연어 검색, 인앱 리더, 깊은 개인화.
