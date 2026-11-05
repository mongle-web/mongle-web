import { useState } from 'react';

type TermsKey = 'service' | 'privacy';

const TERMS_ITEMS: { key: TermsKey; label: string }[] = [
  { key: 'service', label: '(필수) 서비스 이용약관 동의' },
  { key: 'privacy', label: '(필수) 개인정보 수집·이용 동의' },
];

interface TermsAgreementSheetProps {
  // 필수 약관에 모두 동의하고 "동의하고 계속하기"를 눌렀을 때
  onAgree: () => void;
}

// 체크 아이콘 (피그마: 20 x 20, 색은 currentColor)
function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-5 shrink-0">
      <path
        d="M16.6663 5L7.49967 14.1667L3.33301 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 회원가입 약관 동의 시트 (닉네임 페이지에 처음 들어오면 표시, 필수 약관 동의 전에는 닫을 수 없음)
function TermsAgreementSheet({ onAgree }: TermsAgreementSheetProps) {
  const [agreements, setAgreements] = useState<Record<TermsKey, boolean>>({
    service: false,
    privacy: false,
  });

  const isAllAgreed = agreements.service && agreements.privacy;

  // 전체 동의: 하나라도 안 되어 있으면 모두 동의, 모두 동의된 상태면 모두 해제
  const handleToggleAll = () => {
    const next = !isAllAgreed;
    setAgreements({ service: next, privacy: next });
  };

  const handleToggle = (key: TermsKey) => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    // 뒤 화면을 누르지 못하게 화면 전체를 덮음 (시트 바깥을 눌러도 닫히지 않음)
    <div className="fixed inset-0 z-50 mx-auto flex max-w-[480px] items-end">
      {/* 피그마: padding 42px 20px, column, gap 44, 위쪽 radius 32, B-800 */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-agreement-title"
        className="flex w-full flex-col items-start gap-11 rounded-t-[32px] bg-b-800 px-5 py-[42px]"
      >
        <div className="flex w-full flex-col items-center">
          {/* 피그마: 18 SemiBold 140%, B-200, 가운데, 너비 225 */}
          <h2
            id="terms-agreement-title"
            className="w-[225px] text-center text-[18px] leading-[1.4] font-semibold text-b-200"
          >
            서비스 이용을 위해
            <br />
            약관에 동의해 주세요
          </h2>

          {/* 전체 동의하기 (피그마: 제목 아래 24, padding 16, gap 12, radius 16 / 비활성 #5E5B74 · 활성 P-300) */}
          <button
            type="button"
            onClick={handleToggleAll}
            aria-pressed={isAllAgreed}
            className={`mt-6 flex w-full cursor-pointer items-center gap-3 rounded-2xl p-4 ${
              isAllAgreed ? 'bg-p-300 text-p-900' : 'bg-[#5E5B74] text-b-200'
            }`}
          >
            <CheckIcon />
            {/* 전역 button { font: inherit } 이 글자 클래스를 덮어써서 span에 지정 */}
            <span className="text-[18px] leading-[1.4] font-semibold">전체 동의하기</span>
          </button>

          {/* 필수 약관 (피그마: 전체 동의 아래 16, 서로 12 / 16 Medium 150%, 동의 전 B-600 · 동의 후 P-300) */}
          <ul className="mt-4 flex w-full flex-col gap-3">
            {TERMS_ITEMS.map(({ key, label }) => (
              <li
                key={key}
                className={`flex items-center justify-between px-4 ${
                  agreements[key] ? 'text-p-300' : 'text-b-600'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggle(key)}
                  aria-pressed={agreements[key]}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <CheckIcon />
                  <span className="text-[16px] leading-[1.5] font-medium">{label}</span>
                </button>

                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-5 shrink-0">
                  <path
                    d="M9.16699 15L14.167 10L9.167 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </li>
            ))}
          </ul>
        </div>

        {/* 동의하고 계속하기 (피그마: 약관 아래 44, 높이 56, radius 16, 흰색 40% 테두리 / 비활성 Neutral-200 · 활성은 닉네임 다음 버튼과 같음) */}
        <button
          type="button"
          onClick={onAgree}
          disabled={!isAllAgreed}
          className="flex h-14 items-center justify-center gap-2.5 self-stretch rounded-2xl border-2 border-white/40 bg-n-200 p-2.5 enabled:cursor-pointer enabled:bg-p-500 enabled:shadow-[0_0_16px_0_rgba(255,255,255,0.25)]"
        >
          <span className="text-[16px] leading-[1.3] font-semibold text-b-200">
            동의하고 계속하기
          </span>
        </button>
      </section>
    </div>
  );
}

export default TermsAgreementSheet;
