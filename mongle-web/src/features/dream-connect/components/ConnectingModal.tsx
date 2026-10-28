import connectLoadingImage from '@/assets/images/dream-connect/connect_loading.png';
import { FlowModal } from '@/components/common';

interface ConnectingModalProps {
  onClose: () => void; // X · 바깥 · ESC → 연결 중단
}

// "꿈을 연결하고 있어요..." 모달 (피그마: iPhone 16 - 117)
// 모달 틀은 꿈 기록의 "이미지를 생성하고 있어요..."와 같은 FlowModal
// 피그마: 닫기 28 → 20 → 캐릭터 139.95×112 → 12 → 문구 18 SemiBold
function ConnectingModal({ onClose }: ConnectingModalProps) {
  return (
    <FlowModal title="꿈 연결 중" onClose={onClose}>
      <button
        type="button"
        onClick={onClose}
        aria-label="꿈 연결 중단"
        className="mb-5 ml-auto flex size-7 cursor-pointer items-center justify-center bg-transparent"
      >
        <img src="/dream-record/close.svg" alt="" />
      </button>

      <img
        src={connectLoadingImage}
        alt=""
        className="mx-auto mb-3 h-[112px] w-[139.95px] max-w-none object-cover"
      />

      <h2 role="status" className="text-center text-[18px] leading-[1.4] font-semibold">
        꿈을 연결하고 있어요...
      </h2>
    </FlowModal>
  );
}

export default ConnectingModal;
