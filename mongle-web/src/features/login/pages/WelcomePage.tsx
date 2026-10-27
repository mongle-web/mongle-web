import { useNavigate } from 'react-router-dom';

import { authStorage } from '@/api/authStorage';
import welcomeIcon from '@/assets/images/login/WelcomeIcon.png';
import GlowBackground from '@/features/login/components/GlowBackground';

// 가입 완료 (환영) 페이지
function WelcomePage() {
  const navigate = useNavigate();

  const handleStart = () => {
    // TODO: 카카오 로그인 연동 후 제거 (임시: 흐름 확인용 토큰 저장 → 홈이 로그인 화면으로 보임)
    authStorage.setAccessToken('temp-token');
    navigate('/');
  };

  return (
    <div className="relative min-h-dvh bg-b-900">
      <section className="flex flex-col items-center px-5 pt-[150px] text-center">
        <h1 className="text-[20px] leading-[1.4] font-semibold text-b-200">
          몽글에 오신 걸 환영해요!
        </h1>

        <p className="mt-3 text-[14px] leading-normal font-medium text-b-600">
          이제 나만의 꿈 이야기를 시작해 보세요.
        </p>
      </section>

      <div aria-hidden="true" className="relative mx-auto mt-[79px] h-[169px] w-[188px]">
        <GlowBackground />
        <img src={welcomeIcon} alt="" className="relative size-full object-cover select-none" />
      </div>

      <button
        type="button"
        onClick={handleStart}
        className="absolute inset-x-5 bottom-[42px] flex h-14 cursor-pointer items-center justify-center gap-2.5 rounded-[16px] border-2 border-white/40 bg-p-500 p-2.5 shadow-[0_0_16px_0_rgba(255,255,255,0.25)]"
      >
        <span className="text-[16px] leading-[1.3] font-semibold text-b-200">Mongle 시작하기</span>
      </button>
    </div>
  );
}

export default WelcomePage;
