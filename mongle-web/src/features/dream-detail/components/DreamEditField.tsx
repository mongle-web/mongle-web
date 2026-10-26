import { useLayoutEffect, useRef } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';

interface DreamEditFieldProps {
  label: string; // 화면에는 안 보이고 스크린리더용
  value: string;
  maxLength: number;
  variant: 'title' | 'content';
  isError?: boolean;
  onChange: (value: string) => void;
}

// 꿈 수정 화면의 입력 상자 (제목 / 내용)
// 피그마: 배경 N-800, 모서리 16, 안쪽 여백 12, 오른쪽 아래 글자 수
// - 제목: 18 SemiBold, 줄바꿈 입력 불가
// - 내용: 12 Regular, 높이 196 (내용이 길면 늘어남)
// - 오류(비어 있음): 테두리 #BB7676 · 글자 수 #FF6F6F, 상자는 내용 높이만큼만
function DreamEditField({
  label,
  value,
  maxLength,
  variant,
  isError = false,
  onChange,
}: DreamEditFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isTitle = variant === 'title';

  // 입력한 줄 수만큼 높이를 자동으로 맞춘다 (스크롤 없이 전부 보이게)
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    // 제목은 한 문단만 (붙여넣은 줄바꿈도 공백으로)
    const nextValue = isTitle ? event.target.value.replace(/\n/g, ' ') : event.target.value;
    onChange(nextValue.slice(0, maxLength));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // 제목에서 Enter로 줄바꿈되지 않게 (한글 조합 중 Enter는 그대로 둠)
    if (isTitle && event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
    }
  };

  return (
    <div
      className={[
        'flex w-full flex-col items-end gap-5 rounded-2xl bg-n-800 p-3',
        // 피그마 테두리는 상자 안쪽에 그려져서 크기가 바뀌지 않음 → ring-inset
        isError ? 'ring-1 ring-[#bb7676] ring-inset' : '',
        !isTitle && !isError ? 'min-h-[196px] justify-between' : '',
      ].join(' ')}
    >
      <textarea
        ref={textareaRef}
        aria-label={label}
        aria-invalid={isError}
        rows={1}
        value={value}
        maxLength={maxLength}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={[
          'block w-full resize-none overflow-hidden bg-transparent text-b-200 outline-none',
          // global.css의 textarea { font: inherit } 보다 우선하도록 ! 사용 (꿈 기록 화면과 같은 방식)
          isTitle ? 'text-[18px]! leading-[1.4]! font-semibold!' : 'text-[12px]! leading-[1.5]!',
        ].join(' ')}
      />

      <p
        aria-live="polite"
        className={[
          'text-[12px] leading-[1.5] whitespace-nowrap',
          isError ? 'text-[#ff6f6f]' : 'text-b-600',
        ].join(' ')}
      >
        {value.length} / {maxLength}
      </p>
    </div>
  );
}

export default DreamEditField;
