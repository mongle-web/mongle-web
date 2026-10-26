interface AiToggleProps {
  isOn: boolean;
  onChange: (isOn: boolean) => void;
}

function AiToggle({ isOn, onChange }: AiToggleProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <span className="text-[12px] leading-[1.5] text-b-200">AI 작성 부분 표시</span>

      <button
        type="button"
        role="switch"
        aria-checked={isOn}
        aria-label="AI 작성 부분 표시"
        onClick={() => onChange(!isOn)}
        className={[
          'relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200',
          isOn ? 'bg-p-500' : 'bg-b-400',
        ].join(' ')}
      >
        <span
          aria-hidden="true"
          className={[
            'absolute top-0.5 left-0.5 size-5 rounded-full bg-b-200 shadow-[0_0_8px_0_rgba(0,0,0,0.25)]',
            'transition-transform duration-200',
            isOn ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </label>
  );
}

export default AiToggle;
