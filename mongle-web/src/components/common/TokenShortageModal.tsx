import FlowModal from './FlowModal';

interface TokenShortageModalProps {
  required: number; // 필요한 토큰
  owned: number | null; // 보유 토큰 (확인 전이면 null)
  onCharge: () => void; // "충전하고 바로 생성하기" → 충전 화면으로 (돌아갈 곳은 각 화면에서 정함)
  onLater: () => void; // "다음에 만들어볼게요"
  onClose: () => void; // 바깥 · ESC
}

// "토큰이 부족해요!" 모달
// 꿈 기록 화면(DreamRecordPage)의 모달을 꿈 연결 등에서도 쓰도록 공통으로 분리 (모양은 그대로)
// TODO: 꿈 기록 담당의 진입 처리 PR이 머지되면 꿈 기록 화면도 이 컴포넌트로 교체
function TokenShortageModal({
  required,
  owned,
  onCharge,
  onLater,
  onClose,
}: TokenShortageModalProps) {
  return (
    <FlowModal title="토큰이 부족해요" onClose={onClose}>
      <h2 className="text-center text-[18px] font-semibold">토큰이 부족해요!</h2>

      <dl className="mt-10 mb-4 flex flex-col gap-2 text-[12px] leading-[1.5] text-b-300">
        <div className="flex justify-between">
          <dt>필요한 토큰</dt>
          <dd>{required}개</dd>
        </div>

        <div className="flex justify-between">
          <dt>보유 토큰</dt>
          <dd>{owned ?? '—'}개</dd>
        </div>

        <div className="flex justify-between border-t border-b-600 pt-2">
          <dt>부족한 토큰</dt>
          <dd>{owned == null ? '—' : Math.max(0, required - owned)}개</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onCharge}
          className="h-9 w-full rounded-lg border border-white/40 bg-p-500 px-3 text-[14px] leading-[1.3] font-semibold"
        >
          충전하고 바로 생성하기
        </button>

        <button
          type="button"
          onClick={onLater}
          className="h-9 w-full rounded-lg border border-white/40 bg-p-100 px-3 text-[14px] leading-[1.3] font-semibold text-[#a09dbe]"
        >
          다음에 만들어볼게요
        </button>
      </div>
    </FlowModal>
  );
}

export default TokenShortageModal;
