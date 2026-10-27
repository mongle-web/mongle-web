import { useNavigate } from 'react-router-dom';

import kakaoLogo from '@/assets/images/login/KakaoLogo.svg';
import mongleImage from '@/assets/images/login/MongleImage.png';
import GlowBackground from '@/features/login/components/GlowBackground';
import MongleLogo from '@/features/login/components/MongleLogo';

// 로그인 (시작) 페이지
function LoginPage() {
  const navigate = useNavigate();

  // 신규 회원은 닉네임 페이지, 기존 회원은 홈으로 가는 분기는 콜백 페이지에서 처리
  const handleKakaoLogin = () => {
    navigate('/signup/nickname'); // 임시: 다음 화면 확인용
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
