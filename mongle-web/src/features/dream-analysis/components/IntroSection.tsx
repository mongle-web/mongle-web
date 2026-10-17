import dreamAnalyzeCharacter from '@/assets/images/dreamAnalyze/DreamAnalyze.png';

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
      <img
        src={dreamAnalyzeCharacter}
        alt=""
        className="my-[7px] mr-[9.05px] h-[112px] w-[139.95px] object-cover select-none"
      />
    </section>
  );
}

export default IntroSection;
