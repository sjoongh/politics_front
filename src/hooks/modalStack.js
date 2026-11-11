// 열린 모달의 닫기 함수 스택. Android 뒤로가기는 맨 위 모달부터 닫는다.
import { useEffect } from 'react';

const stack = [];

export function pushModal(close) {
  const entry = { close };
  stack.push(entry);
  return () => { const i = stack.indexOf(entry); if (i !== -1) stack.splice(i, 1); };
}

export function topModalClose() {
  return stack.length ? stack[stack.length - 1].close : null;
}

export function modalCount() { return stack.length; }

/** open인 동안 onClose를 스택에 등록. */
export function useRegisterModal(open, onClose) {
  useEffect(() => (open && onClose ? pushModal(onClose) : undefined), [open, onClose]);
}
