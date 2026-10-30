import { FlowModal } from '@/components/common';

interface Props {
  required: number;
  available: number | null;
  onClose: () => void;
  onCharge: () => void;
}

export default function DreamTokenShortageModal({ required, available, onClose, onCharge }: Props) {
  const shortage = available === null ? null : Math.max(0, required - available);

  return (
    <FlowModal title="토큰이 부족해요" onClose={onClose} backdropBlur={23}>
      <div className="flex w-full flex-col items-center gap-10">
        <h2 className="w-full text-center text-[18px] leading-[1.4] font-semibold">
          토큰이 부족해요!
        </h2>

        <div className="flex w-full flex-col gap-4">
          <div className="flex w-full flex-col gap-2 text-[12px] leading-[1.5] text-b-300">
            <dl className="flex justify-between">
              <dt>필요한 토큰</dt>
              <dd>{required}개</dd>
            </dl>

            <dl className="flex justify-between">
              <dt>보유 토큰</dt>
              <dd>{available === null ? '—' : `${available}개`}</dd>
            </dl>

            <div
              role="separator"
              aria-orientation="horizontal"
              className="h-0 w-full shrink-0 border-t border-b-300"
            />

            <dl className="flex justify-between">
              <dt>부족한 토큰</dt>
              <dd>{shortage === null ? '—' : `${shortage}개`}</dd>
            </dl>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-2">
            <button
              type="button"
              onClick={onCharge}
              className="h-9 w-full shrink-0 rounded-lg border border-white/40 bg-p-500 px-3 text-[14px] leading-[1.3] font-semibold"
            >
              충전하고 바로 생성하기
            </button>

            <button
              type="button"
              disabled
              aria-label="광고 시청 후 생성하기 (광고 보상 연동 전)"
              className="h-9 w-full shrink-0 rounded-lg border border-white/40 bg-p-100 px-3 text-[14px] leading-[1.3] font-semibold text-[#a09dbe] disabled:cursor-not-allowed"
            >
              광고 시청 후 생성하기
            </button>
          </div>
        </div>
      </div>
    </FlowModal>
  );
}
