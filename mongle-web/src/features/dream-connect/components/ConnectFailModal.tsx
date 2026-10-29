import errorImage from '@/assets/images/dream-connect/connect_error.png';
import imageErrorImage from '@/assets/images/dream-connect/connect_image_error.png';
import { FlowModal } from '@/components/common';

export type ConnectFailType = 'connect' | 'image';

// 피그마: 닫기 28 → 20 → 캐릭터 → 12 → 제목 18 SemiBold → 12 → 설명 14 Medium (B-600)
const FAIL_CONTENT = {
  // 피그마: iPhone 16 - 133 (캐릭터 image 47: 140×109)
  connect: {
    title: '꿈 연결에 실패했어요',
    description: ['서로 연관성이 낮은 꿈을 선택하면', '연결이 어려울 수 있어요.'],
    image: errorImage,
    imageClassName: 'h-[109px] w-[140px]',
  },
  // 피그마: iPhone 16 - 132 (캐릭터 image 48: 146×116)
  image: {
    title: '이미지 생성에 실패했어요',
    description: ['꿈을 그림으로 만들지 못했어요.', '잠시 후 다시 시도해 주세요.'],
    image: imageErrorImage,
    imageClassName: 'h-[116px] w-[146px]',
  },
} as const;

interface ConnectFailModalProps {
  type: ConnectFailType;
  onClose: () => void; // X · 바깥 · ESC → 닫기만 (다시 시도 버튼 없음)
}

// 꿈 연결 실패 · 이미지 생성 실패 모달
// 모달 틀은 "꿈을 연결하고 있어요..."와 같은 FlowModal
function ConnectFailModal({ type, onClose }: ConnectFailModalProps) {
  const { title, description, image, imageClassName } = FAIL_CONTENT[type];

  return (
    <FlowModal title={title} onClose={onClose}>
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="mb-5 ml-auto flex size-7 cursor-pointer items-center justify-center bg-transparent"
      >
        <img src="/dream-record/close.svg" alt="" />
      </button>

      <img
        src={image}
        alt=""
        className={`mx-auto mb-3 max-w-none object-cover ${imageClassName}`}
      />

      <div role="alert" className="flex flex-col gap-3 text-center">
        <h2 className="text-[18px] leading-[1.4] font-semibold">{title}</h2>
        {/* 피그마처럼 설명 2줄 유지 (글꼴 차이로 208보다 길어져도 줄바꿈 금지) */}
        <p className="text-[14px] leading-[1.5] font-medium whitespace-nowrap text-b-600">
          {description[0]}
          <br />
          {description[1]}
        </p>
      </div>
    </FlowModal>
  );
}

export default ConnectFailModal;
