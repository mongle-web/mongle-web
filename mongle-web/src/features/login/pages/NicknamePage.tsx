import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import ErrorIcon from '@/features/login/components/ErrorIcon';

// 2~10자, 한글(완성형) · 영문 · 숫자만 허용 (공백 · 특수문자 불가)
const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]{2,10}$/;
const INVALID_CHAR_REGEX = /[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]/;
const MAX_LENGTH = 10;

// 닉네임 설정 페이지 (입력 상태에 따라 빈 상태 / 에러 / 정상으로 바뀜)
function NicknamePage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');

  const isValid = NICKNAME_REGEX.test(nickname);
  // 1자만 입력한 경우는 에러 없이 다음 버튼만 비활성
  const isError = INVALID_CHAR_REGEX.test(nickname) || nickname.length > MAX_LENGTH;

  // TODO: 닉네임 저장 API 연동 후 성공 시 이동
  const handleNext = () => {
    navigate('/signup/welcome');
  };

  return (
    <div className="relative min-h-dvh bg-b-900">
      {/* TODO: 닫기(✕) 버튼 (이동 위치 미정) */}

      <section className="flex flex-col items-center px-5 pt-[150px] text-center">
        <h1 className="text-[20px] leading-[1.4] font-semibold text-b-200">
          어떤 이름으로 불러드릴까요?
        </h1>

        <p className="mt-3 text-[14px] leading-normal font-medium text-b-600">
          2~10자 이내로 입력해 주세요. (특수문자 사용 불가)
        </p>

        <input
          type="text"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="이름을 입력해주세요."
          aria-label="닉네임"
          className={`mt-[107px] w-full bg-transparent text-center text-[28px]! leading-normal! font-semibold! outline-none placeholder:text-b-600 ${isError ? 'text-b-600' : 'text-b-200'}`}
        />

        {isError && (
          <p
            role="alert"
            className="mt-3 flex items-center gap-1 text-[14px] leading-normal font-medium text-[#FF6F6F]"
          >
            <ErrorIcon className="size-7 shrink-0" />
            닉네임을 다시 확인해 주세요.
          </p>
        )}
      </section>

      <button
        type="button"
        disabled={!isValid}
        onClick={handleNext}
        className="absolute inset-x-5 bottom-[42px] flex h-14 items-center justify-center gap-2.5 rounded-[16px] border-2 border-white/40 bg-n-200 p-2.5 enabled:cursor-pointer enabled:bg-p-500 enabled:shadow-[0_0_16px_0_rgba(255,255,255,0.25)]"
      >
        <span className="text-[16px] leading-[1.3] font-semibold text-b-200">다음</span>
      </button>
    </div>
  );
}

export default NicknamePage;
