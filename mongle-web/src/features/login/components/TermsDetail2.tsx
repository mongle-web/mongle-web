import { BackHeader } from '@/components/common';

interface TermsDetail2Props {
  // "동의하기"를 눌렀을 때 (약관 시트로 돌아가며 이 항목을 동의 상태로)
  onAgree: () => void;
  // 뒤로 가기를 눌렀을 때 (동의 상태는 그대로 두고 약관 시트로 돌아감)
  onClose: () => void;
}

// 개인정보 수집·이용 동의 상세 (약관 동의 시트 위에 화면 전체로 띄움)
function TermsDetail2({ onAgree, onClose }: TermsDetail2Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="개인정보 수집·이용 동의"
      className="fixed inset-0 mx-auto flex max-w-[480px] flex-col bg-b-900"
    >
      <BackHeader title="개인정보 수집·이용 동의" onBack={onClose} />

      <main className="flex-1 overflow-y-auto px-5 pt-5 pb-6">
        <p className="whitespace-pre-line">{`여기에다가 복붙하면 됩니다`}</p>
      </main>

      {/* 동의하기 (약관 시트의 "동의하고 계속하기" 활성 상태와 같은 모양) */}
      <div className="px-5 pt-2 pb-[42px]">
        <button
          type="button"
          onClick={onAgree}
          className="flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl border-2 border-white/40 bg-p-500 p-2.5 shadow-[0_0_16px_0_rgba(255,255,255,0.25)]"
        >
          {/* 전역 button { font: inherit } 이 글자 클래스를 덮어써서 span에 지정 */}
          <span className="text-[16px] leading-[1.3] font-semibold text-b-200">동의하기</span>
        </button>
      </div>
    </div>
  );
}

export default TermsDetail2;
