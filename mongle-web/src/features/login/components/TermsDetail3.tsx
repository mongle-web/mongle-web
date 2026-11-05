import { BackHeader } from '@/components/common';

interface TermsDetail3Props {
  // 뒤로 가기를 눌렀을 때 (띄운 화면으로 돌아감)
  onClose: () => void;
}

// 개인정보처리방침 상세 (마이페이지 위에 화면 전체로 띄움, 보기만 함)
function TermsDetail3({ onClose }: TermsDetail3Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="개인정보처리방침"
      className="fixed inset-0 mx-auto flex max-w-[480px] flex-col bg-b-900"
    >
      <BackHeader title="개인정보처리방침" onBack={onClose} />

      <main className="flex-1 overflow-y-auto px-5 pt-5 pb-[42px]">
        <p className="whitespace-pre-line">{`여기에다가 복붙하면 됩니다`}</p>
      </main>
    </div>
  );
}

export default TermsDetail3;
