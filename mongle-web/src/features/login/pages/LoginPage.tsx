import { useSearchParams } from 'react-router-dom';

import { KAKAO_LOGIN_URL } from '@/api/authApi';
import kakaoLogo from '@/assets/images/login/KakaoLogo.svg';
import mongleImage from '@/assets/images/login/MongleImage.png';
import ErrorIcon from '@/features/login/components/ErrorIcon';
import GlowBackground from '@/features/login/components/GlowBackground';
import MongleLogo from '@/features/login/components/MongleLogo';

// 로그인 실패 시 백엔드가 /login?code=... 로 돌려보냄 (허용된 코드만 문구로 바꿈)
const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  AUTH_401_1: '로그인에 실패했어요. 다시 시도해 주세요.',
  AUTH_401_2: '카카오 계정의 이메일 제공에 동의해 주세요.',
  AUTH_401_3: '인증된 이메일이 있는 카카오 계정으로 로그인해 주세요.',
  AUTH_401_6: '로그인이 취소되었어요. 다시 시도해 주세요.',
  AUTH_503_1: '잠시 후 다시 시도해 주세요.',
};
const DEFAULT_LOGIN_ERROR_MESSAGE = '로그인에 실패했어요. 다시 시도해 주세요.';

// 로그인 (시작) 페이지
function LoginPage() {
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get('code');
  const errorMessage = errorCode
    ? (LOGIN_ERROR_MESSAGES[errorCode] ?? DEFAULT_LOGIN_ERROR_MESSAGE)
    : null;

  // 카카오 로그인은 백엔드가 처리 → 브라우저 주소를 이동 (axios로 부르지 않음)
  // 신규 회원은 닉네임 페이지, 기존 회원은 홈으로 가는 분기는 콜백 페이지(/auth/callback)에서 처리
  const handleKakaoLogin = () => {
    window.location.href = KAKAO_LOGIN_URL;
  };

  return (
    <div className="relative min-h-dvh bg-b-900">
      {/* TODO: 닫기(✕) 버튼 (이동 위치 미정) */}

      <section className="mx-auto flex w-[225px] flex-col items-center gap-4 pt-[140px]">
        <h1 className="text-p-100">
          <MongleLogo />
        </h1>

        <p className="text-center text-[18px] leading-normal font-medium whitespace-nowrap text-b-200">
          몽글과 함께 꿈을 기록해 보세요.
        </p>
      </section>

      <div aria-hidden="true" className="relative mx-auto mt-16 h-[151px] w-[211px]">
        <GlowBackground />
        <img src={mongleImage} alt="" className="relative size-full object-cover select-none" />
      </div>

      {/* 로그인 실패 문구 (카카오 버튼 위) */}
      {/* TODO: 실패 문구 위치 · 디자인 확인 (현재 닉네임 에러 문구 스타일) */}
      {errorMessage && (
        <p
          role="alert"
          className="absolute inset-x-5 bottom-[114px] flex items-center justify-center gap-1 text-[14px] leading-normal font-medium text-[#FF6F6F]"
        >
          <ErrorIcon className="size-7 shrink-0" />
          {errorMessage}
        </p>
      )}

      <button
        type="button"
        onClick={handleKakaoLogin}
        className="absolute inset-x-5 bottom-[42px] flex h-14 cursor-pointer items-center justify-center gap-4 rounded-[16px] bg-[#FFE812]"
      >
        <img src={kakaoLogo} alt="" className="size-6" />
        <span className="text-[16px] leading-[1.3] font-semibold text-b-900">
          카카오로 시작하기
        </span>
      </button>
    </div>
  );
}

export default LoginPage;
