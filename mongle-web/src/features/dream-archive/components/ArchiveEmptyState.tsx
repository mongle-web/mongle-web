import emptyCharacterImage from '@/assets/images/dream-archive/archive_empty_character.png';
import emptyGlowImage from '@/assets/images/dream-archive/archive_empty_glow.svg';

// 보관함에 기록한 꿈이 하나도 없을 때 (피그마: iPhone 16 - 119)
// 피그마 좌표 기준으로 화면(헤더 맨 위 = 0)에 절대 위치로 배치
// - 문구: 위 154, 너비 200, 가로 가운데 +0.5 (피그마처럼 제목 1줄 · 설명 2줄 유지 → 줄바꿈 금지,
//   글꼴 차이로 200보다 길어져도 가운데 기준으로 넘치도록 문장마다 가운데 정렬)
// - 캐릭터: 위 347, 211×151, 가로 가운데 +5
// - 빛 번짐(Ellipse 30): 회전된 상자 431.261×396.515 (왼쪽 -22, 위 236)의 중심 = 가로 가운데 -2.87, 위 434.26
function ArchiveEmptyState() {
  return (
    <>
      {/* 피그마에서 내보낸 SVG에 회전 · 흐림이 이미 들어 있어서 크기 그대로, 중심만 맞춤 */}
      <img
        src={emptyGlowImage}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-[434.26px] left-[calc(50%-2.87px)] max-w-none! -translate-x-1/2 -translate-y-1/2"
      />

      <div className="absolute top-[154px] left-[calc(50%+0.5px)] flex w-[200px] -translate-x-1/2 flex-col items-center gap-3 text-center">
        <p className="text-[20px] leading-[1.4] font-semibold whitespace-nowrap text-b-200">
          아직 보관된 꿈이 없어요
        </p>
        <p className="text-[16px] leading-[1.5] font-medium whitespace-nowrap text-b-400">
          어젯밤의 꿈을 기록하고
          <br />
          나만의 꿈 보관함을 채워보세요.
        </p>
      </div>

      <img
        src={emptyCharacterImage}
        alt=""
        className="pointer-events-none absolute top-[347px] left-[calc(50%-100.5px)] h-[151px] w-[211px] max-w-none! object-cover"
      />
    </>
  );
}

export default ArchiveEmptyState;
