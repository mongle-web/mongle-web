import { FlowModal } from '@/components/common';

interface ImageGeneratingModalProps {
  onClose: () => void;
}

// "이미지를 생성하고 있어요..." 모달 (피그마: iPhone 16 - 86)
// 꿈 기록 화면의 이미지 생성 중 모달과 같은 디자인 · 같은 이미지(public/dream-record/painter.png)
// TODO: 꿈 기록 화면의 모달도 공통 컴포넌트로 옮기면 이 파일 대신 그걸 사용 (꿈 기록 담당과 협의)
function ImageGeneratingModal({ onClose }: ImageGeneratingModalProps) {
  return (
    <FlowModal title="이미지 생성 중" onClose={onClose}>
      <button
        type="button"
        onClick={onClose}
        aria-label="진행 창 닫기"
        className="mb-5 ml-auto flex size-7 cursor-pointer items-center justify-center bg-transparent"
      >
        <img src="/dream-record/close.svg" alt="" />
      </button>

      <div className="relative mx-auto mb-3 h-[112px] w-[146px] overflow-hidden">
        <img
          src="/dream-record/painter.png"
          alt=""
          className="absolute top-[-13px] left-0 h-[131px] w-[146px] max-w-none"
        />
      </div>

      {/* 피그마: 문구 상자 너비 208에 한 줄 (iPhone 16 - 138)
          기기 글꼴이 피그마 글꼴(Wanted Sans)보다 넓으면 두 줄로 꺾여서, 줄바꿈 없이 모달 여백(좌우 20)까지 쓰게 함 */}
      <h2
        role="status"
        className="-mx-5 text-center text-[18px] leading-[1.4] font-semibold whitespace-nowrap"
      >
        이미지를 생성하고 있어요...
      </h2>
    </FlowModal>
  );
}

export default ImageGeneratingModal;
