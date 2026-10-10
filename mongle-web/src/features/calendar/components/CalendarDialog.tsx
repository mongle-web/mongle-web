import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { motion } from 'framer-motion';

interface CalendarDialogProps {
  title: string;
  children?: ReactNode; // 제목 아래 내용 (설명 문구, 휠 선택기 등)
  cancelLabel?: string;
  confirmLabel: string;
  isConfirmDisabled?: boolean;
  actionsClassName?: string; // 내용과 버튼 사이 간격 (기본 40px)
  onCancel: () => void;
  onConfirm: () => void;
}

// 캘린더에서 쓰는 유리(Glass) 느낌 확인 창 (피그마: 꿈 삭제 확인 / 날짜 선택)
// - 바깥 영역(dim)이나 취소 버튼, ESC 키를 누르면 닫힌다
function CalendarDialog({
  title,
  children,
  cancelLabel = '취소',
  confirmLabel,
  isConfirmDisabled = false,
  actionsClassName = 'mt-10',
  onCancel,
  onConfirm,
}: CalendarDialogProps) {
  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-5"
      onMouseDown={(event) => {
        // 창 바깥(dim)을 눌렀을 때만 닫기
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ scale: 0.96 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="flex w-[248px] flex-col items-center rounded-3xl bg-[rgba(41,40,52,0.4)] p-5 shadow-[0_0_20px_0_rgba(255,255,255,0.3)] backdrop-blur-md"
      >
        <div className="flex w-full flex-col items-center gap-2.5 text-center">
          <h2 className="w-full text-[18px] leading-[1.4] font-semibold text-b-200">{title}</h2>
          {children}
        </div>

        <div className={['flex w-full gap-2', actionsClassName].join(' ')}>
          <button
            type="button"
            onClick={onCancel}
            className="h-9 flex-1 cursor-pointer rounded-[8px] border border-white/40 bg-p-100 px-3 text-[14px] leading-[1.3] font-semibold text-[#a09dbe]"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            className="h-9 flex-1 cursor-pointer rounded-[8px] border border-white/40 bg-p-500 px-3 text-[14px] leading-[1.3] font-semibold text-b-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {confirmLabel}
          </button>
        </div>
      </motion.section>
    </motion.div>
  );
}

export default CalendarDialog;
