import emptyGlowImage from '@/assets/images/dream-archive/archive_empty_glow.svg';
import emptyImage from '@/assets/images/dream-connect/connect_empty.png';
import errorImage from '@/assets/images/dream-connect/connect_error.png';
import searchingImage from '@/assets/images/dream-connect/connect_searching.png';

export type ConnectState = 'loading' | 'error' | 'empty';

// 상태별 문구 · 캐릭터 (피그마 좌표에서 상태바 54를 뺀 값, 헤더 맨 위 = 0)
// - 캐릭터 left: 화면 가운데(196.5) 기준으로 계산
const STATE_CONTENT = {
  // 피그마: iPhone 16 - 127 (캐릭터 image 46: 226×170, 왼쪽 76, 위 306)
  loading: {
    title: '꿈을 불러오고 있어요',
    description: ['잠시만 기다려 주세요.', '꿈의 기억을 찾고 있어요.'],
    image: searchingImage,
    imageClassName: 'top-[306px] left-[calc(50%-120.5px)] h-[170px] w-[226px]',
  },
  // 피그마: iPhone 16 - 129 (캐릭터 image 47: 249×194, 왼쪽 66, 위 285)
  error: {
    title: '꿈을 불러오지 못했어요',
    description: ['잠시 문제가 생겼어요.', '다시 한번 시도해 주세요.'],
    image: errorImage,
    imageClassName: 'top-[285px] left-[calc(50%-130.5px)] h-[194px] w-[249px]',
  },
  // 피그마: iPhone 16 - 126 (캐릭터 image 45: 210×189, 왼쪽 92, 위 272)
  empty: {
    title: '아직 연결할 꿈이 없어요',
    description: ['새로운 꿈을 기록하고', '나만의 이야기를 이어가 보세요.'],
    image: emptyImage,
    imageClassName: 'top-[272px] left-[calc(50%-104.5px)] h-[189px] w-[210px]',
  },
} as const;

interface ConnectStateViewProps {
  state: ConnectState;
}

// 꿈 연결하기 · 연결 결과 화면의 불러오는 중 / 불러오기 실패 / 연결할 꿈 없음
// 피그마 좌표 기준으로 화면에 절대 위치로 배치 (부모에 relative 필요)
// - 문구: 위 149, 너비 284, 가로 가운데 +0.5, 제목과 설명 사이 12
// - 빛 번짐(Ellipse 30): 보관함 빈 화면과 같은 타원 → 같은 SVG 사용
//   회전된 상자 431.261×396.515 (왼쪽 -27, 위 174)의 중심 = 가로 가운데 -7.87, 위 372.26
// 불러오기 실패는 다시 시도 버튼 없이 화면을 나갔다 들어오면 다시 불러옴
function ConnectStateView({ state }: ConnectStateViewProps) {
  const { title, description, image, imageClassName } = STATE_CONTENT[state];

  return (
    <>
      {/* 피그마에서 내보낸 SVG에 회전 · 흐림이 이미 들어 있어서 크기 그대로, 중심만 맞춤 */}
      <img
        src={emptyGlowImage}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-[372.26px] left-[calc(50%-7.87px)] max-w-none! -translate-x-1/2 -translate-y-1/2"
      />

      <div
        role={state === 'loading' ? 'status' : undefined}
        className="absolute top-[149px] left-[calc(50%+0.5px)] flex w-[284px] -translate-x-1/2 flex-col items-center gap-3 text-center"
      >
        <p className="text-[20px] leading-[1.4] font-semibold text-b-200">{title}</p>
        <p className="text-[14px] leading-[1.5] font-medium text-b-600">
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

export default ConnectStateView;
