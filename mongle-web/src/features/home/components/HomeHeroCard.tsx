import homeCharacter from '@/assets/images/home/home_character.png';

function HomeHeroCard() {
  return (
    <button
      type="button"
      className="relative h-[226px] w-full overflow-hidden rounded-[24px] bg-gradient-to-br from-[#77718E] via-[#5D5871] to-[#292734] px-5 py-6 text-left shadow-[0_16px_45px_rgba(0,0,0,0.28)]"
    >
      <div className="relative z-10">
        <p className="text-[17px] leading-[1.45] font-semibold text-white">
          어젯밤의 꿈,
          <br />
          어떤 모습이었나요?
        </p>
      </div>

      <img
        src={homeCharacter}
        alt=""
        className="absolute right-[-10px] bottom-[-8px] w-[190px] select-none"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/5" />
    </button>
  );
}

export default HomeHeroCard;
