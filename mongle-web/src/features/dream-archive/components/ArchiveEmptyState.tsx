import emptyCharacterImage from '@/assets/images/dream-archive/archive_empty_character.png';
import emptyGlowImage from '@/assets/images/dream-archive/archive_empty_glow.svg';
import noResultImage from '@/assets/images/dream-connect/connect_empty.png';

export type ArchiveEmptyType = 'recorded' | 'connected' | 'search';

// 피그마 좌표 기준 (상태바 54를 뺀 값, 헤더 맨 위 = 0), 가로 위치는 화면 가운데(196.5) 기준
// - 빛 번짐(Ellipse 30): SVG에 회전 · 흐림이 이미 들어 있어서 크기 그대로, 회전된 상자의 중심만 맞춤
const EMPTY_CONTENT = {
  // 기록한 꿈이 하나도 없을 때 (피그마: iPhone 16 - 119)
  // 문구 위 154 · 너비 200, 캐릭터 211×151 위 347 · 가운데 +5, 빛 번짐 중심 가운데 -2.87 · 위 434.26
  recorded: {
    title: '아직 보관된 꿈이 없어요',
    description: ['어젯밤의 꿈을 기록하고', '나만의 꿈 보관함을 채워보세요.'],
    textClassName: 'top-[154px] w-[200px]',
    descriptionClassName: 'text-[16px]',
    image: emptyCharacterImage,
    imageClassName: 'top-[347px] left-[calc(50%-100.5px)] h-[151px] w-[211px]',
    glowClassName: 'top-[434.26px] left-[calc(50%-2.87px)]',
  },
  // 연결된 꿈이 하나도 없을 때 (피그마: iPhone 16 - 124)
  // 문구 위 200, 캐릭터 211×151 위 398 · 가운데 +8, 빛 번짐 중심 가운데 +0.13 · 위 485.26
  connected: {
    title: '아직 연결된 꿈이 없어요',
    description: ['기록한 꿈들을 연결하고', '나만의 특별한 이야기를 만들어 보세요.'],
    textClassName: 'top-[200px]',
    descriptionClassName: 'text-[14px]',
    image: emptyCharacterImage,
    imageClassName: 'top-[398px] left-[calc(50%-97.5px)] h-[151px] w-[211px]',
    glowClassName: 'top-[485.26px] left-[calc(50%+0.13px)]',
  },
  // 검색 결과가 없을 때, 두 탭 공통 (피그마: iPhone 16 - 125)
  // 캐릭터 210×189 위 277 · 왼쪽 92, 문구 위 554 (캐릭터 아래), 빛 번짐 중심 가운데 -2.87 · 위 383.26
  search: {
    title: '일치하는 꿈을 찾지 못했어요',
    description: ['다른 키워드로 검색하거나', '검색어를 다시 확인해 주세요.'],
    textClassName: 'top-[554px]',
    descriptionClassName: 'text-[14px]',
    image: noResultImage,
    imageClassName: 'top-[277px] left-[calc(50%-104.5px)] h-[189px] w-[210px]',
    glowClassName: 'top-[383.26px] left-[calc(50%-2.87px)]',
  },
} as const;

interface ArchiveEmptyStateProps {
  type: ArchiveEmptyType;
}

// 보관함 빈 화면 (기록한 꿈 없음 / 연결된 꿈 없음 / 검색 결과 없음)
// 피그마 좌표 기준으로 화면(헤더 맨 위 = 0)에 절대 위치로 배치 (부모에 relative 필요)
// - 문구: 가로 가운데 +0.5, 제목 20 SemiBold B-200 · 설명 Medium B-400, 사이 12
//   피그마처럼 제목 1줄 · 설명 2줄 유지 → 줄바꿈 금지, 글꼴 차이로 길어져도 가운데 기준으로 넘치도록 문장마다 가운데 정렬
function ArchiveEmptyState({ type }: ArchiveEmptyStateProps) {
  const {
    title,
    description,
    textClassName,
    descriptionClassName,
    image,
    imageClassName,
    glowClassName,
  } = EMPTY_CONTENT[type];

  return (
    <>
      <img
        src={emptyGlowImage}
        alt=""
        aria-hidden="true"
        className={`pointer-events-none absolute max-w-none! -translate-x-1/2 -translate-y-1/2 ${glowClassName}`}
      />

      <div
        className={`absolute left-[calc(50%+0.5px)] flex -translate-x-1/2 flex-col items-center gap-3 text-center ${textClassName}`}
      >
        <p className="text-[20px] leading-[1.4] font-semibold whitespace-nowrap text-b-200">
          {title}
        </p>
        <p
          className={`leading-[1.5] font-medium whitespace-nowrap text-b-400 ${descriptionClassName}`}
        >
          {description[0]}
          <br />
          {description[1]}
        </p>
      </div>

      <img
        src={image}
        alt=""
        className={`pointer-events-none absolute max-w-none! object-cover ${imageClassName}`}
      />
    </>
  );
}

export default ArchiveEmptyState;
