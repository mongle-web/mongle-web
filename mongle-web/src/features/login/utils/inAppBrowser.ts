// 앱 안의 브라우저(인앱 브라우저) 감지 · 외부 브라우저로 열기
// 인스타그램 · 카카오톡 등 인앱 브라우저는 다른 주소(api.mongle.art)의 쿠키를 막는 경우가 많아서
// 카카오 로그인 후 로그인 상태가 유지되지 않음 → 로그인 전에 외부 브라우저로 열도록 안내

export type InAppBrowser = 'instagram' | 'facebook' | 'kakaotalk' | 'naver' | 'line' | 'other';

// 브라우저 정보(User-Agent)에 들어 있는 앱 이름으로 판단
const IN_APP_PATTERNS: [InAppBrowser, RegExp][] = [
  ['instagram', /Instagram/i],
  ['facebook', /FBAN|FBAV|FB_IAB/i],
  ['kakaotalk', /KAKAOTALK/i],
  ['naver', /NAVER\(inapp/i],
  ['line', /\bLine\//i],
  ['other', /everytimeApp|DaumApps|; wv\)/i], // 에브리타임 · 다음 · 그 밖의 안드로이드 웹뷰
];

// 인앱 브라우저면 어떤 앱인지, 일반 브라우저면 null
export const getInAppBrowser = (userAgent = navigator.userAgent): InAppBrowser | null =>
  IN_APP_PATTERNS.find(([, pattern]) => pattern.test(userAgent))?.[0] ?? null;

export const isAndroid = (userAgent = navigator.userAgent) => /Android/i.test(userAgent);

// 외부 브라우저로 바로 열 수 있는지
// - 카카오톡: 카카오톡 전용 주소로 외부 브라우저 열기
// - 안드로이드: intent 주소로 Chrome 열기
// - 아이폰의 인스타그램 등: 코드로 Safari를 열 수 없음 → 직접 메뉴에서 열도록 안내
export const canOpenExternally = (browser: InAppBrowser, userAgent = navigator.userAgent) =>
  browser === 'kakaotalk' || isAndroid(userAgent);

// 외부 브라우저로 지금 주소 열기 (열 수 없는 환경이면 false)
export const openInExternalBrowser = (url = window.location.href): boolean => {
  const browser = getInAppBrowser();
  if (!browser || !canOpenExternally(browser)) return false;

  if (browser === 'kakaotalk') {
    window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`;
    return true;
  }

  // Chrome이 없으면 같은 주소를 그대로 열도록 browser_fallback_url 지정
  const { host, pathname, search } = new URL(url);
  window.location.href =
    `intent://${host}${pathname}${search}` +
    `#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
  return true;
};
