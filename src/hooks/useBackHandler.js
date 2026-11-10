import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Capacitor } from '@capacitor/core';
import { nextBackAction, listPathFor } from './backRules';

/** Android 하드웨어 뒤로가기: 모달 닫기 → 내부 이력 back → 상세 직접 진입이면 목록 → 탭 루트면 종료.
 *  웹은 브라우저 기본 동작(이력 back)을 그대로 쓴다. */
export function useBackHandler({ modalOpen, closeModal }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;
    let handle = null;
    let cancelled = false;
    import('@capacitor/app').then(({ App }) => {
      if (cancelled) return;
      App.addListener('backButton', () => {
        const historyIndex = (window.history.state && window.history.state.idx) || 0;
        const action = nextBackAction({ modalOpen, historyIndex, pathname: location.pathname });
        if (action === 'close-modal') closeModal();
        else if (action === 'back') navigate(-1);
        else if (action === 'to-list') navigate(listPathFor(location.pathname), { replace: true });
        else App.exitApp();
      }).then((h) => { handle = h; });
    }).catch(() => {});
    return () => { cancelled = true; if (handle) handle.remove(); };
  }, [modalOpen, closeModal, location.pathname, navigate]);
}
