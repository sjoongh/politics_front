// Firebase Analytics(GA4) 웹 SDK 계측 — 보조 지표. 실패해도 UI에 영향 없음(no-op).
// - 번들 비용 억제: firebase 모듈은 첫 이벤트 시 동적 import
// - 수집 대상: 프로덕션 호스트(웹) 또는 Capacitor 네이티브 WebView(android/ios)
// - 개발/프리뷰/테스트 오염 방지: NODE_ENV!=='production' 이면 끔. REACT_APP_ANALYTICS=1|0 로 강제
// - 검색어 원문은 보내지 않는다(PII). 모드·길이·결과 수만.
import { Capacitor } from '@capacitor/core';

// 웹 Firebase 설정은 공개값(클라이언트 배포에 포함되는 값). 서버 비밀 아님.
const firebaseConfig = {
  apiKey: 'AIzaSyCfkTCjmZtikrQMI7VE5abXKnmHT_mayew',
  authDomain: 'koreanpolitical.firebaseapp.com',
  projectId: 'koreanpolitical',
  storageBucket: 'koreanpolitical.appspot.com',
  messagingSenderId: '443248964813',
  appId: '1:443248964813:web:bc15b7ed832e59bdd36584',
  measurementId: 'G-LWXPJGMD38',
};

const PROD_HOSTS = ['koreanpolitical.web.app', 'koreanpolitical.firebaseapp.com'];

export const appSurface = () => (Capacitor.isNativePlatform() ? Capacitor.getPlatform() : 'web');

export function analyticsEnabled() {
  const flag = process.env.REACT_APP_ANALYTICS;
  if (flag === '0') return false;
  if (flag === '1') return true;
  if (process.env.NODE_ENV !== 'production') return false;
  if (typeof window === 'undefined') return false;
  // Capacitor WebView 는 hostname 이 localhost 라서 호스트 검사 대신 네이티브 여부로 판단
  return appSurface() !== 'web' || PROD_HOSTS.includes(window.location.hostname);
}

let instance = null; // Promise<{analytics, mod} | null>

// 첫 화면 로딩 구간을 피해 SDK 다운로드·파싱을 유휴 시점으로 미룬다(이벤트는 promise 체인에 큐잉됨)
const whenIdle = () => new Promise((resolve) => {
  if (typeof window !== 'undefined' && window.requestIdleCallback) window.requestIdleCallback(() => resolve(), { timeout: 3000 });
  else setTimeout(resolve, 1500);
});

function load() {
  if (!analyticsEnabled()) return Promise.resolve(null);
  if (!instance) {
    instance = (async () => {
      await whenIdle();
      const [{ initializeApp, getApps }, mod] = await Promise.all([
        import('firebase/app'),
        import('firebase/analytics'),
      ]);
      if (!(await mod.isSupported())) return null;
      const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
      // SPA: 자동 page_view 끄고 탭 전환을 수동 page_view 로 기록(중복 방지)
      const analytics = mod.initializeAnalytics(app, { config: { send_page_view: false } });
      mod.setUserProperties(analytics, { app_surface: appSurface() });
      return { analytics, mod };
    })().catch((e) => {
      if (process.env.NODE_ENV !== 'production') console.warn('[analytics] init failed', e);
      instance = null; // 일시 실패(네트워크 등)면 다음 이벤트에서 재시도
      return null;
    });
  }
  return instance;
}

/** 이벤트 기록(비동기, 실패 무시). 렌더링 경로를 막지 않는다. */
export function track(name, params = {}) {
  load().then((ctx) => { if (ctx) ctx.mod.logEvent(ctx.analytics, name, params); }).catch(() => {});
}

/** 탭 전환 = 가상 page_view (GA4 '페이지 및 화면' 보고서에 탭별로 잡히도록) */
export function trackTab(tabId, tabLabel) {
  // GA4 페이지 경로는 page_location 에서 유도되므로 fragment 가 아닌 가상 경로로 보낸다
  track('page_view', {
    page_title: tabLabel || tabId,
    page_location: `${window.location.origin}/${tabId}`,
  });
}

/** 상세가 실제로 표시된 시점에 기록(클릭이 아니라 표시 기준) */
export function trackSelectContent(contentType, itemId) {
  if (!itemId) return;
  track('select_content', { content_type: contentType, item_id: String(itemId) });
}

export function trackShare(contentType, itemId, method) {
  track('share', { content_type: contentType, item_id: String(itemId || ''), method });
}

/** 검색 완료(커스텀). GA4 권장 'search' 는 search_term 이 계약이라 원문 미전송 정책과 맞지 않아 별도 이벤트로 둔다 */
export function trackSearch({ mode, queryLength, resultCount }) {
  track('ai_search', { search_mode: mode || 'unknown', query_length: queryLength || 0, result_count: resultCount || 0 });
}

export function trackLogin(method = 'password') { track('login', { method }); }
export function trackSignUp(method = 'password') { track('sign_up', { method }); }
export function trackOpenOriginal(itemId, source) {
  track('open_original', { item_id: String(itemId || ''), source: source || '' });
}

export function setAnalyticsUser(userId) {
  load().then((ctx) => { if (ctx) ctx.mod.setUserId(ctx.analytics, userId || null); }).catch(() => {});
}
