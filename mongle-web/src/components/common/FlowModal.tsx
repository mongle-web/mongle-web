import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface FlowModalProps {
  title: string; // 화면에는 안 보이고 스크린리더용
  onClose: () => void;
  children: ReactNode;
  backdropBlur?: boolean;
}

// 진행 상황 · 안내용 유리 느낌 모달 (피그마: 너비 248, 모서리 24, 여백 20)
// 예: "이미지를 생성하고 있어요...", "토큰이 부족해요!", "꿈을 연결하고 있어요..."
// - 바깥(dim)을 누르거나 ESC를 누르면 onClose
// 꿈 기록(DreamRecordPage)에서 쓰던 것을 꿈 연결 등에서도 쓰도록 공통으로 분리
function FlowModal({ title, onClose, children, backdropBlur = true }: FlowModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    dialog?.showModal();

    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      className={[
        'fixed inset-0 m-auto h-fit min-h-0 w-[248px]',
        'max-h-[calc(100dvh-40px)] max-w-[calc(100vw-40px)]',
        'overflow-visible rounded-[24px] border-0 bg-[rgba(41,40,52,0.4)] p-5 text-b-200',
        'shadow-[0_0_20px_rgba(255,255,255,0.3)]',
        backdropBlur ? 'backdrop-blur-xl' : '',
        'backdrop:bg-black/25',
      ].join(' ')}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="h-fit min-h-0 w-full" onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </dialog>
  );
}

export default FlowModal;
