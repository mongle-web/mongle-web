import { registerSW } from 'virtual:pwa-register';
// autoUpdate를 쓰더라도 명시적으로 등록해서 구조를 알아보기 쉽게 Service Worker 등록
export const updateServiceWorker = registerSW({
  immediate: true,

  onRegisteredSW(swUrl) {
    console.info('[PWA] Service Worker registered:', swUrl);
  },

  onRegisterError(error) {
    console.error('[PWA] Service Worker registration failed:', error);
  },
});
