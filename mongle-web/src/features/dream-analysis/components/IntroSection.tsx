import dreamAnalyzeCharacter from '@/assets/images/dreamAnalyze/DreamAnalyze.png';
import dreamAnalyzeGlow from '@/assets/images/dreamAnalyze/DreamAnalyzeGlow.svg';

// 꿈 분석 기록 상단 소개 (문구 + 캐릭터)
function IntroSection() {
  return (
    <section className="flex w-full items-start justify-between">
      <h2 className="text-[18px] leading-[1.4] font-semibold text-b-200">
        그동안 기록한 꿈에서
        <br />
        이런 흐름이 보여요
      </h2>

      {/* 피그마: 139.95 x 112, 위아래 7px, 오른쪽 9.05px */}
      <div
        aria-hidden="true"
        className="relative my-[7px] mr-[9.05px] h-[112px] w-[139.95px] shrink-0"
      >
        {/* 캐릭터 뒤 빛 번짐 (피그마: 193 x 193 원, 캐릭터 정중앙 / SVG는 블러 여백 포함 233) */}
        <img
          src={dreamAnalyzeGlow}
          alt=""
          className="pointer-events-none absolute top-1/2 left-1/2 size-[233px] max-w-none -translate-x-1/2 -translate-y-1/2"
        />
        <img
          src={dreamAnalyzeCharacter}
          alt=""
          className="relative size-full object-cover select-none"
        />
      </div>
    </section>
  );
}

export default IntroSection;
